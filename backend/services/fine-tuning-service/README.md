# Fine-tuning Service

This service allows users to fine-tune language models on their own datasets using LoRA.

## API Endpoints

- `POST /finetune` – start a fine-tuning job.
- `GET /status/{job_id}` – check job status.

## Usage

Send a POST request with a JSON body containing:
- `model_name`: base model (e.g., "codellama/CodeLlama-7b-hf")
- `dataset`: list of objects with `instruction` and `output`
- Optional hyperparameters: `lora_r`, `lora_alpha`, `lora_dropout`, `epochs`, `learning_rate`

Example:
```json
{
  "model_name": "codellama/CodeLlama-7b-hf",
  "dataset": [
    {"instruction": "Write a function to add two numbers", "output": "def add(a,b): return a+b"}
  ],
  "epochs": 3
}
