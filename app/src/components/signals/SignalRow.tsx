import type { CandidatePair } from '../../lib/types';

const MARKET_COLORS: Record<string, string> = {
  polymarket: 'text-cyan border-cyan',
  kalshi: 'text-amber border-amber',
  manifold: 'text-purple border-purple',
};
const MARKET_SHORT: Record<string, string> = {
  polymarket: 'POLY',
  kalshi: 'KALS',
  manifold: 'MANIF',
};

interface SignalRowProps {
  pair: CandidatePair;
  selected: boolean;
  onClick: () => void;
}

export default function SignalRow({ pair, selected, onClick }: SignalRowProps) {
  const spread = Math.round(pair.price_spread * 100);
  const isNeg = pair.has_potential_negation;
  const borderColor = isNeg ? 'border-l-red' : selected ? 'border-l-orange' : 'border-l-transparent';
  const bg = selected ? 'bg-surface' : isNeg ? 'bg-[#100808]' : 'hover:bg-surface';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-l-2 border-b border-border transition-colors ${borderColor} ${bg}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm font-bold w-10 shrink-0 ${isNeg ? 'text-red' : 'text-orange'}`}>
          {pair.similarity_score.toFixed(2)}
        </span>
        <span className={`text-[9px] font-bold border rounded px-1 py-px shrink-0 ${MARKET_COLORS[pair.market_a] ?? 'text-text-muted border-text-muted'}`}>
          {MARKET_SHORT[pair.market_a] ?? pair.market_a.toUpperCase()}
        </span>
        <span className="text-text-muted text-[9px]">→</span>
        <span className={`text-[9px] font-bold border rounded px-1 py-px shrink-0 ${MARKET_COLORS[pair.market_b] ?? 'text-text-muted border-text-muted'}`}>
          {MARKET_SHORT[pair.market_b] ?? pair.market_b.toUpperCase()}
        </span>
        {isNeg && (
          <span className="text-[9px] text-red tracking-wider shrink-0">⚠ NEG</span>
        )}
      </div>
      <div className="text-xs text-text-primary mt-1 truncate">{pair.text_a}</div>
      <div className={`text-[10px] mt-0.5 ${isNeg ? 'text-red' : 'text-green'}`}>
        +{spread}pp spread
      </div>
    </button>
  );
}
