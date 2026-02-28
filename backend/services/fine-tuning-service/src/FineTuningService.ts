import axios from 'axios';

export interface FineTuneRequest {
  model_name: string;
  dataset: Array<{ instruction: string; output: string }>;
  lora_r?: number;
  lora_alpha?: number;
  lora_dropout?: number;
  epochs?: number;
  learning_rate?: number;
  user_id?: string;
}

export interface FineTuneResponse {
  job_id: string;
  status: string;
}

export interface JobStatus {
  job_id: string;
  status: string;
  model_path?: string;
  error?: string;
}

export class FineTuningService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.FINE_TUNING_URL || 'http://localhost:8003') {
    this.baseUrl = baseUrl;
  }

  /**
   * Start a fine-tuning job.
   */
  async startFineTuning(request: FineTuneRequest): Promise<FineTuneResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/finetune`, request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Fine-tuning request failed: ${error.response?.data?.detail || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get job status.
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/status/${jobId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get job status: ${error.response?.data?.detail || error.message}`);
      }
      throw error;
    }
  }

  /**
   * List available base models (could be fetched from the Python service if it has an endpoint).
   * For now, return a static list.
   */
  async listBaseModels(): Promise<Array<{ id: string; name: string }>> {
    // Optionally, you could add an endpoint in the Python service to list models.
    return [
      { id: 'codellama/CodeLlama-7b-hf', name: 'CodeLlama 7B' },
      { id: 'mistralai/Mistral-7B-v0.1', name: 'Mistral 7B' },
      { id: 'microsoft/phi-2', name: 'Phi-2' },
    ];
  }
}
