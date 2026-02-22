#!/usr/bin/env python3
"""
Automated PR review using local AI.
Fetches PR diff from GitHub, analyzes code changes, and posts comments.
Designed to be run in CI (e.g., GitHub Actions) or locally.
"""

import os
import sys
import json
import re
import requests
from github import Github
from typing import List, Dict, Any

# Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
AI_ENDPOINT = os.getenv('AI_ENDPOINT', 'http://localhost:8000/generate')
DEFAULT_MODEL = os.getenv('AI_MODEL', 'tinyllama-1.1b')

def get_pr_files(repo_name: str, pr_number: int) -> List[Any]:
    """Fetch list of files changed in the pull request."""
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    return pr.get_files()

def analyze_code(code_snippet: str, file_path: str) -> List[Dict[str, Any]]:
    """
    Send code snippet to AI and get structured review comments.
    Returns list of dicts with keys: line (optional), severity, message.
    """
    prompt = f"""You are an expert code reviewer. Review the following code from file `{file_path}` and provide specific, actionable feedback. Focus on bugs, style issues, security vulnerabilities, and improvements. Output a JSON array of objects, each with optional "line" (integer line number), "severity" (one of "error", "warning", "info"), and "message" (string). If no issues, return an empty array.

Code:    try:
        response = requests.post(AI_ENDPOINT, json={
            'prompt': prompt,
            'max_tokens': 500,
            'temperature': 0.3,
            'model': DEFAULT_MODEL
        }, timeout=30)
        if response.status_code != 200:
            print(f"AI request failed with status {response.status_code}: {response.text}", file=sys.stderr)
            return []
        data = response.json()
        text = data.get('text') or data.get('generated_text') or ''
        # Extract JSON array
        json_match = re.search(r'\[[\s\S]*\]', text)
        if not json_match:
            print("No JSON array found in AI response, using fallback.", file=sys.stderr)
            return [{'severity': 'info', 'message': text}]
        try:
            comments = json.loads(json_match.group())
            # Validate structure
            validated = []
            for c in comments:
                if isinstance(c, dict) and 'message' in c:
                    validated.append({
                        'line': c.get('line'),
                        'severity': c.get('severity', 'info'),
                        'message': c['message']
                    })
            return validated
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}", file=sys.stderr)
            return []
    except Exception as e:
        print(f"Error during AI analysis: {e}", file=sys.stderr)
        return []

def post_comments(repo_name: str, pr_number: int, comments: List[Dict[str, Any]], file_path: str):
    """Post comments as PR review comments (one per file)."""
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    # Use the latest commit of the PR
    commit = pr.get_commits().reversed[0]
    for comment in comments:
        try:
            pr.create_review_comment(
                body=comment['message'],
                commit=commit,
                path=file_path,
                line=comment.get('line', 1)  # line number optional
            )
        except Exception as e:
            print(f"Failed to post comment on {file_path}: {e}", file=sys.stderr)

def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <repo-name> <pr-number>", file=sys.stderr)
        print("Example: PRReviewer.py owner/repo 42", file=sys.stderr)
        sys.exit(1)

    repo_name = sys.argv[1]
    pr_number = int(sys.argv[2])

    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN environment variable not set.", file=sys.stderr)
        sys.exit(1)

    files = get_pr_files(repo_name, pr_number)
    print(f"Found {len(files)} changed files in PR #{pr_number}.")

    for file in files:
        # Fetch the full file content from the raw URL (this gives the version in the PR)
        try:
            content = requests.get(file.raw_url).text
        except Exception as e:
            print(f"Failed to fetch content for {file.filename}: {e}", file=sys.stderr)
            continue

        print(f"Analyzing {file.filename}...")
        comments = analyze_code(content, file.filename)
        if comments:
            print(f"Posting {len(comments)} comments on {file.filename}")
            post_comments(repo_name, pr_number, comments, file.filename)
        else:
            print(f"No issues found in {file.filename}")

if __name__ == '__main__':
    main()
