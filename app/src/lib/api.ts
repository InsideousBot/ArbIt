import type { CandidatePair, QuestionResponse, PipelineStatus, AppConfig } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getCandidates: (minScore = 0.70, limit = 200) =>
    get<CandidatePair[]>(`/api/candidates?min_score=${minScore}&limit=${limit}`),
  getQuestions: (market?: string) =>
    get<QuestionResponse[]>(`/api/questions${market ? `?market=${market}` : ''}`),
  getPipelineStatus: () =>
    get<PipelineStatus>('/api/pipeline-status'),
  getConfig: () =>
    get<AppConfig>('/api/config'),
};
