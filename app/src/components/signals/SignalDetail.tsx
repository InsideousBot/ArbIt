import type { ArbitrageSignal } from '../../lib/types';

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
  signal: ArbitrageSignal | null;
}

function MarketCard({ market, text, price, marketId }: { market: string; text: string; price: number; marketId: string }) {
  const color = MARKET_COLOR[market] ?? '#94a3b8';
  const label = MARKET_LABEL[market] ?? market.toUpperCase();
  return (
    <div
      className="flex-1 bg-surface border border-border p-4 flex flex-col gap-2"
      style={{ borderLeftColor: color, borderLeftWidth: 2 }}
    >
      <span className="text-[9px] tracking-widest font-bold" style={{ color }}>◆ {label}</span>
      <p className="text-sm text-text-primary leading-relaxed flex-1">{text || marketId}</p>
      <span className="text-2xl font-bold" style={{ color }}>
        {Math.round(price * 100)}¢
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

export default function SignalDetail({ signal }: SignalDetailProps) {
  if (!signal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING...</span>
      </div>
    );
  }

  const spread = Math.round(signal.raw_spread * 100);
  const directionLabel = signal.direction === 'buy_a_sell_b'
    ? `BUY ${(MARKET_LABEL[signal.platform_a] ?? signal.platform_a).split('').slice(0, 4).join('')} · SELL ${(MARKET_LABEL[signal.platform_b] ?? signal.platform_b).split('').slice(0, 4).join('')}`
    : `BUY ${(MARKET_LABEL[signal.platform_b] ?? signal.platform_b).split('').slice(0, 4).join('')} · SELL ${(MARKET_LABEL[signal.platform_a] ?? signal.platform_a).split('').slice(0, 4).join('')}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border shrink-0">
        <span className="text-[10px] text-text-muted tracking-[3px]">SIGNAL DETAIL</span>
        <span className="text-2xl font-bold text-green">${signal.expected_profit.toFixed(2)} EV</span>
      </div>

      <div className="mx-5 mt-3 px-4 py-2 bg-surface border border-border text-[10px] tracking-wider text-text-secondary shrink-0">
        ▶ {directionLabel} · PAIR {signal.pair_id.slice(0, 12).toUpperCase()}
      </div>

      <div className="flex gap-4 px-5 pt-4 shrink-0">
        <MarketCard market={signal.platform_a} text={signal.text_a} price={signal.price_a} marketId={signal.market_a_id} />
        <MarketCard market={signal.platform_b} text={signal.text_b} price={signal.price_b} marketId={signal.market_b_id} />
      </div>

      <div className="flex mx-5 mt-4 border border-border bg-surface shrink-0">
        <StatBlock label="EXP PROFIT" value={`$${signal.expected_profit.toFixed(2)}`} color="text-green" />
        <StatBlock label="SPREAD" value={`+${spread}pp`} color="text-green" />
        <StatBlock label="CONFIDENCE" value={`${(signal.confidence * 100).toFixed(1)}%`} color="text-orange" />
        <StatBlock label="KELLY" value={`${(signal.kelly_fraction * 100).toFixed(2)}%`} />
      </div>

      <div className="flex mx-5 mt-2 border border-border bg-surface shrink-0">
        <StatBlock label="REC SIZE" value={`$${signal.recommended_size_usd.toFixed(0)}`} color="text-orange" />
        <StatBlock label="CONV PROB" value={`${(signal.regression_convergence_prob * 100).toFixed(1)}%`} />
        <StatBlock label="PLATFORM A" value={signal.platform_a.toUpperCase()} />
        <StatBlock label="PLATFORM B" value={signal.platform_b.toUpperCase()} />
      </div>
    </div>
  );
}
