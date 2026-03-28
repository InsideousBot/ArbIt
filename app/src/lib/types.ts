export interface CandidatePair {
  id: string;
  question_id_a: string;
  question_id_b: string;
  text_a: string;
  text_b: string;
  market_a: string;
  market_b: string;
  price_a: number;
  price_b: number;
  price_spread: number;
  similarity_score: number;
  has_potential_negation: boolean;
  negation_tokens: string[];
  created_at: string;
}

export interface QuestionResponse {
  id: string;
  text: string;
  market: string;
  price: number;
}

export type StepStatus = 'done' | 'active' | 'pending' | 'error';

export interface PipelineStep {
  number: number;
  short_label: string;
  full_label: string;
  status: StepStatus;
  elapsed_ms: number | null;
  message: string | null;
}

export interface PipelineStatus {
  last_run: string | null;
  total_runtime_ms: number;
  steps: PipelineStep[];
  logs: string[];
}

export interface AppConfig {
  embedding_model: string;
  similarity_threshold: number;
  db_status: 'connected' | 'disconnected' | 'error';
  markets: string[];
  last_run: string | null;
}
