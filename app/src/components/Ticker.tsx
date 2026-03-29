import type { ArbitrageSignal } from '../lib/types';

interface TickerProps {
  signals: ArbitrageSignal[];
}

function platformLabel(platform: string): string {
  if (platform === 'polymarket') return 'POLY';
  if (platform === 'kalshi') return 'KALS';
  if (platform === 'manifold') return 'MANI';
  return platform.toUpperCase().slice(0, 4);
}

function truncateQuestion(text: string, maxLen = 48): string {
  if (!text) return '—';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

function formatSpread(spread: number): string {
  const pct = spread * 100;
  return `+${pct.toFixed(1)}%`;
}

export default function Ticker({ signals }: TickerProps) {
  if (!signals.length) {
    return (
      <div
        style={{
          height: '28px',
          background: '#05060a',
          borderBottom: '1px solid #1a1d2e',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: '9px', color: '#2d3147', letterSpacing: '0.15em', paddingLeft: '12px' }}>
          AWAITING SIGNALS…
        </span>
      </div>
    );
  }

  // Double the list for seamless loop
  const items = [...signals, ...signals];

  return (
    <div
      style={{
        height: '28px',
        background: '#05060a',
        borderBottom: '1px solid #1a1d2e',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Left fade */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '40px',
          background: 'linear-gradient(90deg, #05060a, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      {/* Right fade */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '40px',
          background: 'linear-gradient(270deg, #05060a, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <div
        className="ticker-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {items.map((sig, idx) => {
          const label = platformLabel(sig.platform_a);
          const question = truncateQuestion(sig.text_a || sig.text_b);
          const price = sig.price_a.toFixed(2);
          const spread = formatSpread(sig.raw_spread);

          return (
            <span
              key={`${sig.pair_id}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                paddingRight: '32px',
                fontSize: '10px',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              <span style={{ color: '#4a5568', fontSize: '9px' }}>◆</span>
              <span style={{ color: '#64748b', fontWeight: '500' }}>{label}</span>
              <span style={{ color: '#94a3b8' }}>{question}</span>
              <span style={{ color: '#e2e8f0' }}>{price}</span>
              <span style={{ color: '#22c55e', fontWeight: '600' }}>{spread}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
