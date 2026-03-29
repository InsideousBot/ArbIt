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

export interface ArbitrageSignal {
  pair_id: string;
  platform_a: string;
  platform_b: string;
  market_a_id: string;
  market_b_id: string;
  text_a: string;
  text_b: string;
  price_a: number;
  price_b: number;
  raw_spread: number;
  direction: string;
  expected_profit: number;
  kelly_fraction: number;
  recommended_size_usd: number;
  confidence: number;
  regression_convergence_prob: number;
  created_at: string;
}

export interface SignalsStats {
  total: number;
  total_ev: number;
  top_ev: number;
  avg_confidence: number;
  avg_spread: number;
}

export interface SimTrade {
  pair_id: string;
  platform_a: string;
  platform_b: string;
  market_a_id: string;
  market_b_id: string;
  text_a: string;
  text_b: string;
  price_a: number;
  price_b: number;
  raw_spread: number;
  direction: string;
  expected_profit: number;
  recommended_size_usd: number;
  confidence: number;
  entry_date: string;
  exit_date: string;
  end_date_a: string | null;
  end_date_b: string | null;
  resolution_a: string | null;
  resolution_b: string | null;
  outcome: 'WIN' | 'LOSS' | 'UNKNOWN';
  realized_pnl: number | null;
}

export interface PnlPoint {
  date: string;
  daily_pnl: number;
  cumulative_pnl: number;
}

export interface AppConfig {
  embedding_model: string;
  similarity_threshold: number;
  db_status: 'connected' | 'disconnected' | 'error';
  markets: string[];
  last_run: string | null;
}
