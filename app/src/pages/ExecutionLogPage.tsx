import type { ExecutedTrade } from '../lib/types';

const PLATFORM_COLOR: Record<string, string> = {
  polymarket: '#22c55e',
  kalshi: '#a78bfa',
  manifold: '#f472b6',
};

function statusBadge(status: ExecutedTrade['status']) {
  if (status === 'CONFIRMED') return { icon: '●', label: 'CONFIRMED', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' };
  if (status === 'PENDING')   return { icon: '○', label: 'PENDING',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
  return                             { icon: '×', label: 'FAILED',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)' };
}

interface Props {
  trades: ExecutedTrade[];
}

export default function ExecutionLogPage({ trades }: Props) {
  const sorted = [...trades].reverse();
  const totalPnl = trades.reduce((s, t) => s + (t.netPnl ?? 0), 0);
  const confirmed = trades.filter((t) => t.status === 'CONFIRMED').length;
  const successRate = trades.length > 0 ? (confirmed / trades.length) * 100 : 0;

  const S: React.CSSProperties = { fontFamily: 'IBM Plex Mono, monospace' };

  return (
    <div style={{ ...S, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px', borderBottom: '1px solid #1a1d2e',
        background: '#09090d', flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.1em' }}>
          EXECUTION LOG
        </span>
        <span style={{
          fontSize: '11px', fontWeight: '700', color: '#4a5568',
          background: '#1a1d2e', padding: '2px 8px', borderRadius: '10px',
        }}>
          {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
        </span>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '1px solid #1a1d2e',
        background: '#0d0e12', flexShrink: 0,
      }}>
        {[
          { label: 'TOTAL TRADES', value: String(trades.length), color: '#e2e8f0', size: '28px' },
          { label: 'TOTAL PROFIT', value: `$${totalPnl.toFixed(2)}`, color: '#22c55e', size: '28px' },
          { label: 'SUCCESS RATE', value: `${successRate.toFixed(1)}%`, color: '#f59e0b', size: '28px' },
        ].map(({ label, value, color, size }) => (
          <div key={label} style={{
            flex: 1, padding: '16px 24px',
            borderRight: '1px solid #1a1d2e',
          }}>
            <div style={{ fontSize: '9px', color: '#4a5568', letterSpacing: '0.12em', marginBottom: '8px' }}>
              {label}
            </div>
            <div style={{ fontSize: size, fontWeight: '700', color, lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {trades.length === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <div style={{ fontSize: '13px', color: '#374151', letterSpacing: '0.15em' }}>
            NO EXECUTED TRADES
          </div>
          <div style={{ fontSize: '10px', color: '#2d3147', letterSpacing: '0.1em' }}>
            Click EXECUTE on an opportunity to record a trade
          </div>
        </div>
      )}

      {/* Table */}
      {trades.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 160px 160px 70px 100px 110px',
            gap: '0',
            padding: '8px 16px',
            borderBottom: '1px solid #1a1d2e',
            background: '#0a0b0f',
            position: 'sticky', top: 0, zIndex: 1,
          }}>
            {['TIME', 'EVENT', 'POLY SIDE', 'KALSHI SIDE', 'SPREAD', 'NET P&L', 'STATUS'].map((h) => (
              <div key={h} style={{ fontSize: '8px', color: '#374151', letterSpacing: '0.12em', fontWeight: '600' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {sorted.map((trade, i) => {
            const badge = statusBadge(trade.status);
            const pnl = trade.netPnl;
            const pnlColor = pnl === null ? '#4a5568' : pnl >= 0 ? '#22c55e' : '#ef4444';
            const pnlStr = pnl === null ? '—' : `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`;
            const spreadStr = `${(trade.signal.raw_spread * 100).toFixed(1)}%`;
            const event = `BUY YES ${trade.signal.platform_a.charAt(0).toUpperCase() + trade.signal.platform_a.slice(1)} + SELL YES ${trade.signal.platform_b.charAt(0).toUpperCase() + trade.signal.platform_b.slice(1)} — ${(trade.signal.text_a || trade.signal.market_a_id).slice(0, 40)}${(trade.signal.text_a || '').length > 40 ? '…' : ''}`;

            const colorA = PLATFORM_COLOR[trade.signal.platform_a] ?? '#94a3b8';
            const colorB = PLATFORM_COLOR[trade.signal.platform_b] ?? '#94a3b8';

            return (
              <div
                key={trade.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 160px 160px 70px 100px 110px',
                  gap: '0',
                  padding: '10px 16px',
                  borderBottom: '1px solid #12131a',
                  background: i % 2 === 0 ? '#0a0b0f' : '#0d0e12',
                  alignItems: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#111318')}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#0a0b0f' : '#0d0e12')}
              >
                <div style={{ fontSize: '10px', color: '#64748b' }}>{trade.executedAt}</div>

                <div style={{ fontSize: '10px', color: '#94a3b8', paddingRight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event}
                </div>

                <div style={{ fontSize: '10px', color: colorA, fontWeight: '600' }}>
                  {trade.sideA}
                </div>

                <div style={{ fontSize: '10px', color: colorB, fontWeight: '600' }}>
                  {trade.sideB}
                </div>

                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{spreadStr}</div>

                <div style={{ fontSize: '10px', fontWeight: '700', color: pnlColor }}>{pnlStr}</div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: badge.bg, border: `1px solid ${badge.color}22`,
                  padding: '3px 8px', borderRadius: '3px',
                  width: 'fit-content',
                }}>
                  <span style={{ color: badge.color, fontSize: '10px' }}>{badge.icon}</span>
                  <span style={{ color: badge.color, fontSize: '8px', letterSpacing: '0.1em', fontWeight: '600' }}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
