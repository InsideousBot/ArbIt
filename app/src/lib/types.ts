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

export type RealismMode = 'optimistic' | 'realistic' | 'pessimistic';

export interface SimSummary {
  start_time: string;
  end_time: string;
  run_duration_s: number;
  events_processed: number;
  realized_pnl: number;
  unrealized_pnl: number;
  fees_paid: number;
  slippage_cost: number;
  final_equity: number;
  trades_attempted: number;
  trades_filled: number;
  partial_fills: number;
  fill_rate: number;
  win_rate: number;
  avg_profit_per_trade: number;
  avg_holding_hours: number;
  max_locked_capital: number;
  sharpe_ratio: number | null;
  max_drawdown: number;
  profit_by_arb_type: Record<string, number>;
  open_baskets: number;
  closed_baskets: number;
}

export interface EquityPoint {
  t: string;
  equity: number;
}

export interface TradeEntry {
  market_id: string;
  platform: string;
  side: string;
  price: number;
  size: number;
  status: string;
  fee: number;
  timestamp: string | null;
}

export interface SimResult {
  summary: SimSummary;
  equity_curve: EquityPoint[];
  trade_log: TradeEntry[];
  realism_mode: RealismMode;
}

export interface AppConfig {
  embedding_model: string;
  similarity_threshold: number;
  db_status: 'connected' | 'disconnected' | 'error';
  markets: string[];
  last_run: string | null;
}
