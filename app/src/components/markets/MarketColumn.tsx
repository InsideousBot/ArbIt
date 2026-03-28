import type { QuestionResponse } from '../../lib/types';
import QuestionRow from './QuestionRow';

const MARKET_COLOR: Record<string, string> = {
  polymarket: 'text-cyan',
  kalshi: 'text-amber',
  manifold: 'text-purple',
};
const MARKET_LABEL: Record<string, string> = {
  polymarket: 'POLYMARKET',
  kalshi: 'KALSHI',
  manifold: 'MANIFOLD',
};

interface MarketColumnProps {
  market: string;
  questions: QuestionResponse[];
  pairIds: Set<string>;
  candidateCount: number;
  loading: boolean;
  error: string | null;
}

export default function MarketColumn({ market, questions, pairIds, candidateCount, loading, error }: MarketColumnProps) {
  const color = MARKET_COLOR[market] ?? 'text-text-secondary';
  const label = MARKET_LABEL[market] ?? market.toUpperCase();

  return (
    <div className="flex flex-col border-r border-border last:border-r-0 flex-1 min-w-0 h-full">
      <div className="px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold tracking-widest ${color}`}>◆ {label}</span>
          {candidateCount > 0 && (
            <span className="text-[10px] text-orange tracking-wider">{candidateCount} FOUND</span>
          )}
        </div>
        <span className="text-[10px] text-text-muted tracking-wider">
          {loading ? '--' : questions.length.toLocaleString()} LIVE MARKETS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-3 py-2 border-b border-border animate-pulse">
              <div className="h-2.5 bg-surface rounded w-5/6 mb-1.5" />
              <div className="h-2 bg-surface rounded w-1/4" />
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-red text-[10px] tracking-wider">⚠ LOAD FAILED</div>
        ) : questions.length === 0 ? (
          <div className="p-4 text-text-muted text-[10px] tracking-wider">NO QUESTIONS SCRAPED YET</div>
        ) : (
          questions.map((q) => (
            <QuestionRow key={q.id} question={q} inPair={pairIds.has(q.id)} />
          ))
        )}
      </div>
    </div>
  );
}
