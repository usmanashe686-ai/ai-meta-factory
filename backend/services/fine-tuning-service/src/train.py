import os
import logging
import json
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training, TaskType
from datasets import Dataset
import uuid

logger = logging.getLogger(__name__)

# Global job status store (shared with main, but we'll pass through functions)
# In production, use a database.
jobs = {}  # This should be shared with main, but for simplicity we'll use a global.

def start_finetuning(job_id: str, request: dict):
    """Background task to fine-tune a model."""
    try:
        jobs[job_id]["status"] = "running"
        model_name = request["model_name"]
        dataset = request["dataset"]
        lora_r = request.get("lora_r", 8)
        lora_alpha = request.get("lora_alpha", 16)
        lora_dropout = request.get("lora_dropout", 0.05)
        epochs = request.get("epochs", 3)
        learning_rate = request.get("learning_rate", 2e-4)

        # Prepare dataset
        texts = []
        for item in dataset:
            instruction = item.get("instruction", "")
            output = item.get("output", "")
            # Format as instruction + response
            texts.append(f"### Instruction:\n{instruction}\n\n### Response:\n{output}")
        # Create Hugging Face Dataset
        hf_dataset = Dataset.from_dict({"text": texts})

        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        tokenizer.pad_token = tokenizer.eos_token

        # Tokenize dataset
        def tokenize_function(examples):
            return tokenizer(examples["text"], truncation=True, max_length=512, padding="max_length")

        tokenized_dataset = hf_dataset.map(tokenize_function, batched=True, remove_columns=["text"])

        # Load base model
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            load_in_4bit=True,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        model = prepare_model_for_kbit_training(model)

        # LoRA configuration
        lora_config = LoraConfig(
            r=lora_r,
            lora_alpha=lora_alpha,
            lora_dropout=lora_dropout,
            bias="none",
            task_type=TaskType.CAUSAL_LM,
        )
        model = get_peft_model(model, lora_config)

        # Training arguments
        output_dir = f"./models/finetuned_{job_id}"
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=4,
            gradient_accumulation_steps=4,
            warmup_steps=100,
            learning_rate=learning_rate,
            fp16=True,
            logging_steps=10,
            save_strategy="epoch",
            evaluation_strategy="no",
            save_total_limit=1,
            remove_unused_columns=False,
        )

        # Data collator
        data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)

        # Trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_dataset,
            data_collator=data_collator,
        )

        # Train
        trainer.train()

        # Save final model
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["model_path"] = output_dir

    except Exception as e:
        logger.exception("Fine-tuning failed")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
