import type { CandidatePair } from '../../lib/types';

const MARKET_COLOR: Record<string, string> = {
  polymarket: '#4fc3f7',
  kalshi: '#ff9800',
  manifold: '#a78bfa',
};
const MARKET_LABEL: Record<string, string> = {
  polymarket: 'POLYMARKET',
  kalshi: 'KALSHI',
  manifold: 'MANIFOLD',
};

interface SignalDetailProps {
  pair: CandidatePair | null;
}

function MarketCard({ market, text, price }: { market: string; text: string; price: number }) {
  const color = MARKET_COLOR[market] ?? '#94a3b8';
  const label = MARKET_LABEL[market] ?? market.toUpperCase();
  return (
    <div
      className="flex-1 bg-surface border border-border p-4 flex flex-col gap-2"
      style={{ borderLeftColor: color, borderLeftWidth: 2 }}
    >
      <span className="text-[9px] tracking-widest font-bold" style={{ color }}>◆ {label}</span>
      <p className="text-sm text-text-primary leading-relaxed flex-1">{text}</p>
      <span className="text-2xl font-bold" style={{ color }}>
        {Math.round(price * 100)}%
      </span>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center flex-1 border-r border-border last:border-r-0 py-3">
      <span className={`text-sm font-bold ${color ?? 'text-text-secondary'}`}>{value}</span>
      <span className="text-[9px] text-text-muted tracking-widest mt-1">{label}</span>
    </div>
  );
}

export default function SignalDetail({ pair }: SignalDetailProps) {
  if (!pair) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING...</span>
      </div>
    );
  }

  const spread = Math.round(pair.price_spread * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border shrink-0">
        <span className="text-[10px] text-text-muted tracking-[3px]">SIGNAL DETAIL</span>
        <span className="text-2xl font-bold text-orange">{pair.similarity_score.toFixed(3)}</span>
      </div>

      {pair.has_potential_negation && (
        <div className="mx-5 mt-3 px-4 py-2 bg-[#100808] border border-red text-red text-[10px] tracking-wider leading-relaxed shrink-0">
          ⚠ POTENTIAL NEGATION — these questions may be inverses.
          {pair.negation_tokens.length > 0 && (
            <span className="ml-2 opacity-70">Tokens: {pair.negation_tokens.join(', ')}</span>
          )}
        </div>
      )}

      <div className="flex gap-4 px-5 pt-4 shrink-0">
        <MarketCard market={pair.market_a} text={pair.text_a} price={pair.price_a} />
        <MarketCard market={pair.market_b} text={pair.text_b} price={pair.price_b} />
      </div>

      <div className="flex mx-5 mt-4 border border-border bg-surface shrink-0">
        <StatBlock label="SIM SCORE" value={pair.similarity_score.toFixed(4)} color="text-orange" />
        <StatBlock label="PRICE SPREAD" value={`+${spread}pp`} color="text-green" />
        <StatBlock label="VOLUME" value="--" />
        <StatBlock label="LLM STATUS" value="PENDING" color="text-text-muted" />
      </div>
    </div>
  );
}
