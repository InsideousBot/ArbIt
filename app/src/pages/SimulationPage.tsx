import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SimResult, RealismMode } from '../lib/types';
import { api } from '../lib/api';

const MODES: RealismMode[] = ['optimistic', 'realistic', 'pessimistic'];

const MODE_COLOR: Record<RealismMode, string> = {
  optimistic: '#00e676',
  realistic: '#ff6b35',
  pessimistic: '#ff3b3b',
};
const MODE_GLOW: Record<RealismMode, string> = {
  optimistic: '0 0 10px rgba(0,230,118,0.5)',
  realistic: '0 0 10px rgba(255,107,53,0.5)',
  pessimistic: '0 0 10px rgba(255,59,59,0.5)',
};

function MetricTile({
  label, value, color, glow, sub,
}: { label: string; value: string; color: string; glow?: string; sub?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      padding: '12px 14px',
      border: '1px solid #0f1428',
      background: '#040608',
      flex: 1,
      minWidth: '100px',
    }}>
      <span style={{
        fontSize: '20px',
        fontWeight: '600',
        color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
        textShadow: glow,
      }}>
        {value}
      </span>
      <span style={{ fontSize: '7px', color: '#2a3060', letterSpacing: '0.2em' }}>{label}</span>
      {sub && <span style={{ fontSize: '7px', color: '#1a2040', letterSpacing: '0.1em' }}>{sub}</span>}
    </div>
  );
}

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}
function fmtPnl(n: number) {
  const s = n >= 0 ? `+$${fmt(n)}` : `-$${fmt(Math.abs(n))}`;
  return s;
}

export default function SimulationPage() {
  const [mode, setMode] = useState<RealismMode>('realistic');
  const [capital, setCapital] = useState(10000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      const r = await api.runSimulation(mode, capital);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setRunning(false);
    }
  }

  const accentColor = MODE_COLOR[mode];
  const accentGlow = MODE_GLOW[mode];
  const s = result?.summary;

  // Format equity curve for recharts
  const equityData = (result?.equity_curve ?? []).map((pt, i) => ({
    i,
    equity: pt.equity,
    label: pt.t ? new Date(pt.t).toLocaleTimeString('en-US', { hour12: false }) : String(i),
  }));

  const pnlColor = s && s.realized_pnl >= 0 ? '#00e676' : '#ff3b3b';
  const equityColor = s && s.final_equity >= capital ? '#00e676' : '#ff3b3b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '36px',
        borderBottom: '1px solid #0a0d1a',
        background: 'linear-gradient(180deg, #070a14 0%, #060810 100%)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '8px', color: '#1a2040', letterSpacing: '0.3em' }}>BACKTEST SIMULATOR</span>
        {result && (
          <span style={{ fontSize: '8px', color: '#2a3060', letterSpacing: '0.15em' }}>
            {result.summary.events_processed} EVENTS · {result.summary.run_duration_s}s
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Config panel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 20px',
          borderBottom: '1px solid #0a0d1a',
          flexShrink: 0,
          background: '#040608',
        }}>
          {/* Realism mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '7px', color: '#1a2040', letterSpacing: '0.2em' }}>REALISM MODE</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {MODES.map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '3px 10px',
                    fontSize: '8px',
                    letterSpacing: '0.1em',
                    fontFamily: 'IBM Plex Mono, monospace',
                    background: mode === m ? `rgba(${m === 'optimistic' ? '0,230,118' : m === 'realistic' ? '255,107,53' : '255,59,59'},0.12)` : 'transparent',
                    border: `1px solid ${mode === m ? MODE_COLOR[m] : '#1a2040'}`,
                    color: mode === m ? MODE_COLOR[m] : '#2a3060',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Capital input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '7px', color: '#1a2040', letterSpacing: '0.2em' }}>INITIAL CAPITAL ($)</span>
            <input
              type="number"
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              style={{
                width: '100px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'IBM Plex Mono, monospace',
                background: '#060810',
                border: '1px solid #1a2040',
                color: '#c0c8d8',
                outline: 'none',
                letterSpacing: '0.05em',
              }}
            />
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={running}
            style={{
              marginTop: '18px',
              padding: '6px 20px',
              fontSize: '9px',
              letterSpacing: '0.2em',
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: '600',
              background: running ? 'rgba(255,107,53,0.05)' : `rgba(${mode === 'optimistic' ? '0,230,118' : mode === 'realistic' ? '255,107,53' : '255,59,59'},0.1)`,
              border: `1px solid ${running ? '#1a2040' : accentColor}`,
              color: running ? '#2a3060' : accentColor,
              cursor: running ? 'default' : 'pointer',
              textShadow: running ? 'none' : accentGlow,
              transition: 'all 0.15s',
            }}
          >
            {running ? '● RUNNING...' : '▶ RUN BACKTEST'}
          </button>

          {error && (
            <span style={{ fontSize: '9px', color: '#ff3b3b', letterSpacing: '0.1em', marginTop: '18px' }}>
              ⚠ {error}
            </span>
          )}
        </div>

        {result && s && (
          <>
            {/* Metrics grid */}
            <div style={{
              display: 'flex',
              gap: '2px',
              padding: '12px 20px',
              flexWrap: 'wrap',
              borderBottom: '1px solid #0a0d1a',
            }}>
              <MetricTile label="REALIZED P&L" value={fmtPnl(s.realized_pnl)} color={pnlColor} glow={s.realized_pnl >= 0 ? '0 0 10px rgba(0,230,118,0.5)' : '0 0 10px rgba(255,59,59,0.5)'} />
              <MetricTile label="FINAL EQUITY" value={`$${fmt(s.final_equity)}`} color={equityColor} glow={s.final_equity >= capital ? '0 0 10px rgba(0,230,118,0.5)' : '0 0 10px rgba(255,59,59,0.5)'} />
              <MetricTile label="WIN RATE" value={`${fmt(s.win_rate * 100)}%`} color={s.win_rate >= 0.5 ? '#00e676' : '#ff9800'} />
              <MetricTile label="FILL RATE" value={`${fmt(s.fill_rate * 100)}%`} color="#4fc3f7" />
              <MetricTile label="SHARPE" value={s.sharpe_ratio != null ? fmt(s.sharpe_ratio, 3) : '--'} color="#a78bfa" />
              <MetricTile label="MAX DRAWDOWN" value={`${fmt(s.max_drawdown * 100)}%`} color={s.max_drawdown > 0.1 ? '#ff3b3b' : '#ff9800'} />
              <MetricTile label="FEES PAID" value={`$${fmt(s.fees_paid)}`} color="#2a3060" />
              <MetricTile label="SLIPPAGE" value={`$${fmt(s.slippage_cost)}`} color="#2a3060" />
              <MetricTile label="TRADES" value={`${s.trades_filled}/${s.trades_attempted}`} color="#ff6b35" sub="filled/attempted" />
              <MetricTile label="AVG PROFIT" value={`$${fmt(s.avg_profit_per_trade, 4)}`} color="#4fc3f7" sub="per trade" />
            </div>

            {/* Equity curve */}
            {equityData.length > 0 && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #0a0d1a' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '8px', color: '#1a2040', letterSpacing: '0.3em' }}>EQUITY CURVE</span>
                  <span style={{ fontSize: '9px', color: equityColor, letterSpacing: '0.1em' }}>
                    ${fmt(s.final_equity)} final
                  </span>
                </div>
                <div style={{ height: '140px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={equityColor} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={equityColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" hide />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 8, fill: '#2a3060', fontFamily: 'IBM Plex Mono, monospace' }}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                        tickFormatter={v => `$${v.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#040608',
                          border: '1px solid #0f1428',
                          borderRadius: 0,
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontSize: '9px',
                          color: '#c0c8d8',
                        }}
                        itemStyle={{ color: equityColor }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, 'EQUITY']}
                        labelFormatter={() => ''}
                      />
                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke={equityColor}
                        strokeWidth={1.5}
                        fill="url(#equityGrad)"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Trade log */}
            {result.trade_log.length > 0 && (
              <div style={{ padding: '12px 20px 20px' }}>
                <span style={{ fontSize: '8px', color: '#1a2040', letterSpacing: '0.3em' }}>
                  TRADE LOG ({result.trade_log.length} SHOWN)
                </span>
                <div style={{ marginTop: '8px', border: '1px solid #0f1428' }}>
                  {/* Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 60px 60px 60px 60px 80px',
                    padding: '5px 10px',
                    borderBottom: '1px solid #0a0d1a',
                    background: '#040608',
                  }}>
                    {['MARKET', 'PLATFORM', 'SIDE', 'PRICE', 'SIZE', 'FEE', 'STATUS'].map(h => (
                      <span key={h} style={{ fontSize: '7px', color: '#1a2040', letterSpacing: '0.2em' }}>{h}</span>
                    ))}
                  </div>
                  {result.trade_log.map((t, i) => {
                    const sideColor = t.side === 'buy' ? '#00e676' : '#ff3b3b';
                    const statusColor = t.status === 'filled' ? '#00e676' : t.status === 'rejected' ? '#ff3b3b' : '#ff9800';
                    return (
                      <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 60px 60px 60px 60px 80px',
                        padding: '5px 10px',
                        borderBottom: '1px solid #060810',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}>
                        <span style={{ fontSize: '9px', color: '#5a6080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.market_id}
                        </span>
                        <span style={{ fontSize: '9px', color: '#2a3060', letterSpacing: '0.05em' }}>{t.platform}</span>
                        <span style={{ fontSize: '9px', color: sideColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.side}</span>
                        <span style={{ fontSize: '9px', color: '#c0c8d8', fontVariantNumeric: 'tabular-nums' }}>{t.price}</span>
                        <span style={{ fontSize: '9px', color: '#c0c8d8', fontVariantNumeric: 'tabular-nums' }}>{t.size}</span>
                        <span style={{ fontSize: '9px', color: '#2a3060', fontVariantNumeric: 'tabular-nums' }}>{t.fee}</span>
                        <span style={{ fontSize: '9px', color: statusColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!result && !running && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <span style={{ fontSize: '9px', color: '#0f1428', letterSpacing: '0.3em' }}>CONFIGURE AND RUN A BACKTEST</span>
          </div>
        )}
      </div>
    </div>
  );
}
