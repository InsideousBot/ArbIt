'use client'
import { useState, useEffect } from 'react'
import { useCounter } from '@/lib/useCounter'
import { EXECUTIONS } from '@/lib/mockData'

function StatCard({
  label,
  value,
  color,
  borderColor,
  prefix = '',
  suffix = '',
}: {
  label: string
  value: string
  color: string
  borderColor: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div
      style={{
        background: '#111827',
        borderTop: `2px solid ${borderColor}`,
        border: `1px solid #1C2333`,
        borderTopColor: borderColor,
        flex: 1,
        padding: '12px 16px',
        borderRadius: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          color: '#6B7688',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        className={color === '#00FF88' ? 'glow-green' : color === '#F59E0B' ? 'glow-amber' : ''}
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 28,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {prefix}{value}{suffix}
      </div>
    </div>
  )
}

export default function ExecutionLog() {
  const confirmed = EXECUTIONS.filter((e) => e.status === 'CONFIRMED')
  const initialProfit = confirmed.reduce((sum, e) => sum + e.netPnl, 0)
  const [profitTarget, setProfitTarget] = useState(initialProfit)
  const animatedProfit = useCounter(profitTarget, 800)

  useEffect(() => {
    const interval = setInterval(() => {
      setProfitTarget((p) => p + Math.random() * 8 + 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const totalTrades = EXECUTIONS.length
  const successRate = ((confirmed.length / totalTrades) * 100).toFixed(1)
  const successColor = parseFloat(successRate) > 80 ? '#00FF88' : '#F59E0B'

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center gap-3 mb-4 pb-3"
        style={{ borderBottom: '1px solid #1C2333' }}
      >
        <h2
          className="text-sm font-bold tracking-widest"
          style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5', letterSpacing: '0.2em' }}
        >
          EXECUTION LOG
        </h2>
        <span
          className="px-1.5 py-0.5 text-[9px]"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(0,255,136,0.08)',
            color: '#00FF88',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 0,
            letterSpacing: '0.06em',
          }}
        >
          {totalTrades} TRADES
        </span>
      </div>

      {/* Stat cards */}
      <div className="flex gap-3 mb-4">
        <StatCard
          label="TOTAL TRADES"
          value={String(totalTrades)}
          color="#E8EDF5"
          borderColor="#1C2333"
        />
        <StatCard
          label="TOTAL PROFIT"
          value={animatedProfit.toFixed(2)}
          color="#00FF88"
          borderColor="#00FF88"
          prefix="$"
        />
        <StatCard
          label="SUCCESS RATE"
          value={successRate}
          color={successColor}
          borderColor={successColor}
          suffix="%"
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
          }}
        >
          <thead>
            <tr style={{ background: '#080B0F', borderBottom: '2px solid #1C2333' }}>
              {['TIME', 'EVENT', 'POLY SIDE', 'KALSHI SIDE', 'GROSS SPREAD', 'NET P&L', 'STATUS'].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: '#6B7688',
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                      textAlign: 'left',
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {EXECUTIONS.map((exec, i) => {
              const isEven = i % 2 === 0
              const bgColor = isEven ? '#080B0F' : '#0D1117'
              const pnlColor = exec.netPnl >= 0 ? '#00FF88' : '#FF3B5C'
              const pnlGlow = exec.netPnl >= 0 ? 'glow-green' : 'glow-red'

              return (
                <tr
                  key={exec.id}
                  className="scanline-row"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    background: bgColor,
                    borderBottom: '1px solid #1C2333',
                    transition: 'border-left 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.borderLeft = '3px solid #00FF88'
                    ;(e.currentTarget as HTMLTableRowElement).style.paddingLeft = '0px'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.borderLeft = 'none'
                  }}
                >
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: '#6B7688',
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {exec.time}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 11,
                      color: '#E8EDF5',
                      padding: '8px 10px',
                      maxWidth: '280px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={exec.event}
                  >
                    {exec.event}
                  </td>
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: '#4fc3f7',
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {exec.polymarketSide}
                  </td>
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: '#F59E0B',
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {exec.kalshiSide}
                  </td>
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: '#F59E0B',
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {exec.grossSpread.toFixed(1)}%
                  </td>
                  <td
                    className={pnlGlow}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      fontWeight: 600,
                      color: pnlColor,
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {exec.netPnl >= 0 ? '+' : ''}${exec.netPnl.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                    {exec.status === 'CONFIRMED' && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: '#00FF88',
                          background: 'rgba(0,255,136,0.15)',
                          border: '1px solid rgba(0,255,136,0.5)',
                          padding: '3px 8px',
                          letterSpacing: '0.08em',
                          borderRadius: 0,
                          textShadow: '0 0 8px rgba(0,255,136,0.5)',
                        }}
                      >
                        ● CONFIRMED
                      </span>
                    )}
                    {exec.status === 'PENDING' && (
                      <span
                        className="pending-pulse"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: '#F59E0B',
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.4)',
                          padding: '3px 8px',
                          letterSpacing: '0.08em',
                          borderRadius: 0,
                        }}
                      >
                        ◌ PENDING
                      </span>
                    )}
                    {exec.status === 'FAILED' && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: '#FF3B5C',
                          background: 'rgba(255,59,92,0.1)',
                          border: '1px solid rgba(255,59,92,0.4)',
                          padding: '3px 8px',
                          letterSpacing: '0.08em',
                          borderRadius: 0,
                        }}
                      >
                        ✕ FAILED
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
