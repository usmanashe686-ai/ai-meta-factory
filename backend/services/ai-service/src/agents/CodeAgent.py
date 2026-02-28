import os
import json
import logging
import requests
from typing import Dict, Any, Optional, List
import subprocess
import time

logger = logging.getLogger(__name__)

class CodeAgent:
    """
    Autonomous coding agent that can break down a task, write code, run commands, and iterate.
    Uses ReAct (Reason + Act) pattern with JSON action output.
    """

    def __init__(self, workspace: str, llm_endpoint: str = "http://localhost:8000/generate", model: str = "tinyllama-1.1b", max_steps: int = 10):
        self.workspace = workspace
        self.llm_endpoint = llm_endpoint
        self.model = model
        self.max_steps = max_steps
        self.history = []  # stores messages and actions for context
        os.makedirs(workspace, exist_ok=True)

    def call_llm(self, prompt: str, temperature: float = 0.3, max_tokens: int = 500) -> str:
        """Call the local LLM with the given prompt."""
        try:
            response = requests.post(
                self.llm_endpoint,
                json={
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "model": self.model,
                },
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data.get("text") or data.get("generated_text") or ""
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return f"Error: {e}"

    def build_prompt(self, task: str, step: int) -> str:
        """Build the ReAct prompt including history."""
        system = """You are an autonomous coding assistant. You have access to the following actions:
- think: reason about what to do next. Argument should be a string with your reasoning.
- write_file: write content to a file. Argument must be a JSON object with "path" and "content".
- read_file: read a file. Argument is the file path.
- run_command: execute a shell command in the workspace. Argument is the command string.
- finish: when the task is complete. Argument should be a string summarizing the result.

You must respond in JSON format with keys "action" and "argument". Example:
{"action": "think", "argument": "I need to create a Python file..."}
Do not include any other text outside the JSON.
"""
        history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in self.history[-6:]])  # last 6 messages
        prompt = f"{system}\n\nTask: {task}\n\nHistory:\n{history_str}\n\nStep {step}: What is your next action?"
        return prompt

    def execute_action(self, action: str, argument: Any) -> str:
        """Execute the given action and return observation."""
        if action == "think":
            # Just log the thought; no side effect.
            logger.info(f"Thought: {argument}")
            return f"Thought recorded: {argument}"
        elif action == "write_file":
            try:
                path = argument.get("path")
                content = argument.get("content", "")
                full_path = os.path.join(self.workspace, path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w") as f:
                    f.write(content)
                return f"File written: {path}"
            except Exception as e:
                return f"Error writing file: {str(e)}"
        elif action == "read_file":
            try:
                path = argument
                full_path = os.path.join(self.workspace, path)
                with open(full_path, "r") as f:
                    content = f.read()
                return f"Content of {path}:\n{content}"
            except Exception as e:
                return f"Error reading file: {str(e)}"
        elif action == "run_command":
            try:
                cmd = argument
                result = subprocess.run(cmd, shell=True, cwd=self.workspace, capture_output=True, text=True, timeout=30)
                output = f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
                if result.returncode != 0:
                    output = f"Command failed with code {result.returncode}\n{output}"
                return output
            except subprocess.TimeoutExpired:
                return "Command timed out after 30 seconds."
            except Exception as e:
                return f"Error running command: {str(e)}"
        elif action == "finish":
            return f"Task completed: {argument}"
        else:
            return f"Unknown action: {action}"

    def run(self, task: str) -> Dict[str, Any]:
        """
        Execute the agent on the given task. Returns a result dict.
        """
        self.history = [{"role": "user", "content": task}]
        for step in range(1, self.max_steps + 1):
            prompt = self.build_prompt(task, step)
            llm_output = self.call_llm(prompt)
            # Try to parse JSON
            try:
                # Find first { ... } in the output
                start = llm_output.find('{')
                end = llm_output.rfind('}') + 1
                if start == -1 or end == 0:
                    raise ValueError("No JSON object found")
                json_str = llm_output[start:end]
                data = json.loads(json_str)
                action = data.get("action")
                argument = data.get("argument")
            except Exception as e:
                logger.error(f"Failed to parse LLM output: {llm_output[:200]}")
                self.history.append({"role": "assistant", "content": f"Error parsing JSON: {e}"})
                continue

            self.history.append({"role": "assistant", "content": json.dumps(data)})
            observation = self.execute_action(action, argument)
            self.history.append({"role": "system", "content": observation})

            if action == "finish":
                return {
                    "success": True,
                    "steps": step,
                    "final_message": argument,
                    "history": self.history
                }

        return {
            "success": False,
            "steps": self.max_steps,
            "message": "Max steps reached without finishing.",
            "history": self.history
        }


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agent = CodeAgent(workspace="./agent_workspace")
    result = agent.run("Create a Python script that prints the current date and time, then run it.")
    print(json.dumps(result, indent=2))
