import type { SignalsStats, AppConfig } from '../lib/types';

interface SidebarProps {
  stats: SignalsStats | null;
  totalPnl: number;
  successRate: number;
  minSpread: number;
  onMinSpread: (v: number) => void;
  minConfidence: number;
  onMinConfidence: (v: number) => void;
  config: AppConfig | null;
}

function formatDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export default function Sidebar({
  stats,
  totalPnl,
  successRate,
  minSpread,
  onMinSpread,
  minConfidence,
  onMinConfidence,
  config,
}: SidebarProps) {
  const isConnected = config?.db_status === 'connected';

  const activeOpportunities = stats?.total ?? 0;

  const connections = [
    { label: 'Polymarket', status: 'Connected', color: '#22c55e' },
    { label: 'Kalshi', status: 'Connected', color: '#22c55e' },
    { label: 'Gemini API', status: 'Active', color: '#22c55e' },
  ];

  return (
    <div
      style={{
        width: '195px',
        flexShrink: 0,
        background: '#0a0b0f',
        borderRight: '1px solid #1a1d2e',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        gap: '16px',
        overflowY: 'auto',
        fontFamily: 'IBM Plex Mono, monospace',
      }}
    >
      {/* Logo / branding */}
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid #1a1d2e' }}>
        <div
          style={{
            fontSize: '26px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          Arbit
        </div>
        <div
          style={{
            fontSize: '7.5px',
            color: '#4a5568',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Prediction Market Arbitrage
        </div>
        <div style={{ fontSize: '9px', color: '#374151' }}>operator@arbit.trade</div>
      </div>

      {/* System status */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#ef4444',
              display: 'inline-block',
              boxShadow: isConnected ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
            }}
          />
          <span style={{ fontSize: '9px', color: isConnected ? '#22c55e' : '#ef4444', letterSpacing: '0.15em' }}>
            {isConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </span>
        </div>

        {/* Connections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {connections.map((conn) => (
            <div
              key={conn.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: '9px', color: '#4a5568' }}>{conn.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: conn.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: '9px', color: conn.color }}>{conn.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #1a1d2e', paddingTop: '12px' }}>
        <div>
          <div style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.12em', marginBottom: '3px' }}>
            ACTIVE OPPORTUNITIES
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0', lineHeight: 1 }}>
            {activeOpportunities}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.12em', marginBottom: '3px' }}>
            TOTAL PROFIT TODAY
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', lineHeight: 1 }}>
            {formatDollar(totalPnl)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.12em', marginBottom: '3px' }}>
            SUCCESS RATE
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', lineHeight: 1 }}>
            {successRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ borderTop: '1px solid #1a1d2e', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* MIN SPREAD slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.12em' }}>MIN SPREAD</span>
            <span style={{ fontSize: '9px', color: '#e2e8f0', fontWeight: '600' }}>{minSpread}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={minSpread}
            onChange={(e) => onMinSpread(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#4f46e5',
              cursor: 'pointer',
              height: '3px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <span style={{ fontSize: '8px', color: '#2d3147' }}>0%</span>
            <span style={{ fontSize: '8px', color: '#2d3147' }}>20%</span>
          </div>
        </div>

        {/* MIN CONFIDENCE slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '8px', color: '#4a5568', letterSpacing: '0.12em' }}>MIN CONFIDENCE</span>
            <span style={{ fontSize: '9px', color: '#e2e8f0', fontWeight: '600' }}>{minConfidence}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={minConfidence}
            onChange={(e) => onMinConfidence(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#4f46e5',
              cursor: 'pointer',
              height: '3px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <span style={{ fontSize: '8px', color: '#2d3147' }}>50%</span>
            <span style={{ fontSize: '8px', color: '#2d3147' }}>95%</span>
          </div>
        </div>
      </div>

      {/* Spacer to push content up */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1d2e', paddingTop: '10px' }}>
        <div style={{ fontSize: '8px', color: '#2d3147', letterSpacing: '0.1em' }}>
          v2.0.0 · arbit.trade
        </div>
      </div>
    </div>
  );
}
