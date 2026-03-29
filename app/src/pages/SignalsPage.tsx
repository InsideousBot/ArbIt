import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArbitrageSignal } from '../lib/types';
import { api } from '../lib/api';

interface SignalsPageProps {
  minSpread: number;
  minConfidence: number;
}

function platformColor(platform: string): string {
  if (platform === 'polymarket') return '#22c55e';
  if (platform === 'kalshi') return '#a78bfa';
  if (platform === 'manifold') return '#f472b6';
  return '#94a3b8';
}

function platformLabel(platform: string): string {
  if (platform === 'polymarket') return 'POLYMARKET';
  if (platform === 'kalshi') return 'KALSHI';
  if (platform === 'manifold') return 'MANIFOLD';
  return platform.toUpperCase();
}

function formatVolume(vol?: number): string {
  if (vol === undefined || vol === null || vol === 0) return 'VOL --';
  if (vol >= 1_000_000) return `VOL $${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `VOL $${(vol / 1_000).toFixed(0)}K`;
  return `VOL $${vol.toFixed(0)}`;
}

function formatTime(offsetSeconds: number): string {
  const now = new Date();
  const t = new Date(now.getTime() - offsetSeconds * 1000);
  const hh = t.getHours().toString().padStart(2, '0');
  const mm = t.getMinutes().toString().padStart(2, '0');
  const ss = t.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

interface OpportunityCardProps {
  signal: ArbitrageSignal;
  index: number;
  timeOffset: number;
}

function OpportunityCard({ signal, index, timeOffset }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const spreadPct = signal.raw_spread * 100;
  const netPct = (signal.raw_spread - 0.01) * 100;
  const priceANo = (1 - signal.price_a).toFixed(2);
  const priceBNo = (1 - signal.price_b).toFixed(2);
  const confPct = Math.round(signal.confidence * 100);

  const colorA = platformColor(signal.platform_a);
  const colorB = platformColor(signal.platform_b);
  const labelA = platformLabel(signal.platform_a);
  const labelB = platformLabel(signal.platform_b);

  const arbId = `ARB-${String(index + 1).padStart(3, '0')}`;
  const timestamp = formatTime(timeOffset);

  return (
    <div
      style={{
        background: '#0d0e12',
        border: '1px solid #1a1d2e',
        borderRadius: '4px',
        marginBottom: '8px',
        fontFamily: 'IBM Plex Mono, monospace',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid #1a1d2e',
          background: '#0a0b0f',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#e2e8f0',
              letterSpacing: '0.1em',
            }}
          >
            {arbId}
          </span>
          <span
            style={{
              fontSize: '9px',
              color: '#94a3b8',
              background: '#1a1d2e',
              padding: '2px 6px',
              borderRadius: '2px',
              letterSpacing: '0.05em',
            }}
          >
            YES_YES
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.05em' }}>
          {timestamp}
        </span>
      </div>

      {/* Main content: 4-column grid */}
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '10px 12px', gap: '8px' }}>
        {/* Col 1: Platform A */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '8px',
              fontWeight: '600',
              color: colorA,
              border: `1px solid ${colorA}`,
              padding: '2px 6px',
              borderRadius: '2px',
              marginBottom: '6px',
              letterSpacing: '0.08em',
            }}
          >
            {labelA}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#cbd5e1',
              lineHeight: '1.4',
              marginBottom: '8px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {signal.text_a || '—'}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', lineHeight: 1 }}>
                {signal.price_a.toFixed(2)}
              </div>
              <div style={{ fontSize: '8px', color: '#4a5568', marginTop: '1px' }}>YES</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#f87171', lineHeight: 1 }}>
                {priceANo}
              </div>
              <div style={{ fontSize: '8px', color: '#4a5568', marginTop: '1px' }}>NO</div>
            </div>
          </div>
          <div style={{ fontSize: '9px', color: '#374151' }}>{formatVolume(signal.volume_a)}</div>
        </div>

        {/* Col 2: Trade direction */}
        <div
          style={{
            width: '80px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <div style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '0.05em', fontWeight: '600' }}>
            BUY YES
          </div>
          <div style={{ fontSize: '16px', color: '#4a5568' }}>⇌</div>
          <div style={{ fontSize: '9px', color: '#f87171', letterSpacing: '0.05em', fontWeight: '600' }}>
            SELL YES
          </div>
        </div>

        {/* Col 3: Platform B */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '8px',
              fontWeight: '600',
              color: colorB,
              border: `1px solid ${colorB}`,
              padding: '2px 6px',
              borderRadius: '2px',
              marginBottom: '6px',
              letterSpacing: '0.08em',
            }}
          >
            {labelB}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#cbd5e1',
              lineHeight: '1.4',
              marginBottom: '8px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {signal.text_b || '—'}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', lineHeight: 1 }}>
                {signal.price_b.toFixed(2)}
              </div>
              <div style={{ fontSize: '8px', color: '#4a5568', marginTop: '1px' }}>YES</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#f87171', lineHeight: 1 }}>
                {priceBNo}
              </div>
              <div style={{ fontSize: '8px', color: '#4a5568', marginTop: '1px' }}>NO</div>
            </div>
          </div>
          <div style={{ fontSize: '9px', color: '#374151' }}>{formatVolume(signal.volume_b)}</div>
        </div>

        {/* Col 4: Spread */}
        <div
          style={{
            width: '120px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#22c55e',
              lineHeight: 1,
              letterSpacing: '-1px',
            }}
          >
            {spreadPct >= 0 ? '+' : ''}{spreadPct.toFixed(1)}%
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600' }}>
              NET {netPct.toFixed(1)}%
            </div>
            <div style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.08em' }}>MARGIN</div>
          </div>
        </div>
      </div>

      {/* Footer: AI confidence + actions */}
      <div
        style={{
          borderTop: '1px solid #1a1d2e',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#09090d',
        }}
      >
        <span style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.1em', flexShrink: 0 }}>
          AI CONFIDENCE
        </span>

        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: '6px',
            background: '#1a1d2e',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${confPct}%`,
              background: 'linear-gradient(90deg, #16a34a, #22c55e)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <span
          style={{
            fontSize: '10px',
            fontWeight: '700',
            color: '#e2e8f0',
            minWidth: '32px',
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {confPct}%
        </span>

        {/* Reasoning toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: 'transparent',
            border: '1px solid #1a1d2e',
            color: '#94a3b8',
            fontSize: '9px',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          REASONING {expanded ? '▲' : '▼'}
        </button>

        {/* Execute button */}
        <button
          style={{
            background: '#4f46e5',
            border: 'none',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}
        >
          EXECUTE
        </button>
      </div>

      {/* Expanded reasoning panel */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid #1a1d2e',
            padding: '10px 12px',
            background: '#08090c',
          }}
        >
          <div style={{ fontSize: '9px', color: '#4a5568', letterSpacing: '0.1em', marginBottom: '6px' }}>
            SIGNAL DETAILS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              ['Expected Profit', `$${signal.expected_profit.toFixed(2)}`],
              ['Kelly Fraction', `${(signal.kelly_fraction * 100).toFixed(1)}%`],
              ['Recommended Size', `$${signal.recommended_size_usd.toFixed(0)}`],
              ['Convergence Prob', `${(signal.regression_convergence_prob * 100).toFixed(1)}%`],
              ['Direction', signal.direction],
              ['Pair ID', signal.pair_id?.slice(0, 16) ?? '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '8px', color: '#374151', marginBottom: '2px' }}>{k}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stable random offsets per signal (keyed by pair_id)
const timeOffsetCache: Record<string, number> = {};
function getTimeOffset(pairId: string): number {
  if (!timeOffsetCache[pairId]) {
    timeOffsetCache[pairId] = Math.floor(Math.random() * 3600);
  }
  return timeOffsetCache[pairId];
}

export default function SignalsPage({ minSpread, minConfidence }: SignalsPageProps) {
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const data = await api.getSignals(0, minConfidence / 100, 200, 'profit');
      // Apply client-side spread filter
      const filtered = data.filter((sig) => sig.raw_spread * 100 >= minSpread);
      setSignals(filtered);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [minSpread, minConfidence]);

  useEffect(() => {
    setLoading(true);
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchSignals, 5_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchSignals]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        fontFamily: 'IBM Plex Mono, monospace',
      }}
    >
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #1a1d2e',
          background: '#09090d',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.1em' }}>
            LIVE OPPORTUNITIES
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#22c55e',
              minWidth: '24px',
            }}
          >
            {loading ? '…' : signals.length}
          </span>
          {error && (
            <span style={{ fontSize: '9px', color: '#f87171' }}>{error}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
          <span style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '0.15em' }}>
            AUTO-REFRESH 5s
          </span>
        </div>
      </div>

      {/* Scrollable cards list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
        }}
      >
        {loading && signals.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#4a5568',
              fontSize: '11px',
              letterSpacing: '0.1em',
            }}
          >
            LOADING OPPORTUNITIES…
          </div>
        ) : signals.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#4a5568',
              fontSize: '11px',
              letterSpacing: '0.1em',
            }}
          >
            NO OPPORTUNITIES MATCH CURRENT FILTERS
          </div>
        ) : (
          signals.map((sig, i) => (
            <OpportunityCard
              key={sig.pair_id}
              signal={sig}
              index={i}
              timeOffset={getTimeOffset(sig.pair_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
