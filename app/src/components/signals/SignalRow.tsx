import type { ArbitrageSignal } from '../../lib/types';

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
  signal: ArbitrageSignal;
  selected: boolean;
  onClick: () => void;
}

export default function SignalRow({ signal, selected, onClick }: SignalRowProps) {
  const spread = Math.round(signal.raw_spread * 100);
  const evColor = signal.expected_profit > 10 ? 'text-green' : 'text-orange';
  const borderColor = selected ? 'border-l-orange' : 'border-l-transparent';
  const bg = selected ? 'bg-surface' : 'hover:bg-surface';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-l-2 border-b border-border transition-colors ${borderColor} ${bg}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm font-bold w-14 shrink-0 ${evColor}`}>
          ${signal.expected_profit.toFixed(1)}
        </span>
        <span className={`text-[9px] font-bold border rounded px-1 py-px shrink-0 ${MARKET_COLORS[signal.platform_a] ?? 'text-text-muted border-text-muted'}`}>
          {MARKET_SHORT[signal.platform_a] ?? signal.platform_a.toUpperCase()}
        </span>
        <span className="text-text-muted text-[9px]">→</span>
        <span className={`text-[9px] font-bold border rounded px-1 py-px shrink-0 ${MARKET_COLORS[signal.platform_b] ?? 'text-text-muted border-text-muted'}`}>
          {MARKET_SHORT[signal.platform_b] ?? signal.platform_b.toUpperCase()}
        </span>
        <span className="text-[9px] text-text-muted shrink-0">
          {(signal.confidence * 100).toFixed(0)}% conf
        </span>
      </div>
      <div className="text-xs text-text-primary mt-1 truncate">{signal.text_a || signal.market_a_id}</div>
      <div className="text-[10px] mt-0.5 text-green">
        +{spread}pp spread · ${signal.recommended_size_usd.toFixed(0)} size
      </div>
    </button>
  );
}
