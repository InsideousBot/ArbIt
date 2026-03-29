'use client'
import { useState } from 'react'
import { MATCHES } from '@/lib/mockData'
import type { Match } from '@/lib/types'

function ConfidenceBadge({ value }: { value: number }) {
  const color = value > 85 ? '#00FF88' : value > 70 ? '#F59E0B' : '#FF3B5C'
  const glow = value > 85 ? 'glow-green' : value > 70 ? 'glow-amber' : 'glow-red'
  return (
    <span
      className={glow}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        color,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {value}%
    </span>
  )
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'LIVE') {
    return (
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          color: '#00FF88',
          border: '1px solid rgba(0,255,136,0.4)',
          background: 'rgba(0,255,136,0.08)',
          padding: '2px 6px',
          letterSpacing: '0.08em',
          borderRadius: 0,
        }}
      >
        ● LIVE
      </span>
    )
  }
  return (
    <span
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        color: '#2A3347',
        border: '1px solid #2A3347',
        padding: '2px 6px',
        letterSpacing: '0.08em',
        borderRadius: 0,
      }}
    >
      ○ EXPIRED
    </span>
  )
}

export default function MatchesExplorer() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

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
          MATCHES EXPLORER
        </h2>
        <span
          className="px-1.5 py-0.5 text-[9px]"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(79,195,247,0.1)',
            color: '#4fc3f7',
            border: '1px solid rgba(79,195,247,0.3)',
            borderRadius: 0,
            letterSpacing: '0.06em',
          }}
        >
          {MATCHES.length} MATCHES
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '90px' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <thead>
            <tr
              style={{
                borderBottom: '2px solid #1C2333',
                background: '#080B0F',
              }}
            >
              {['MATCH ID', 'POLYMARKET QUESTION', 'KALSHI QUESTION', 'CONFIDENCE', 'STATUS', 'SPREAD'].map(
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
                      borderBottom: '1px solid #1C2333',
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {MATCHES.map((match, i) => (
              <>
                <tr
                  key={match.id}
                  className="scanline-row"
                  onClick={() => toggle(match.id)}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    cursor: 'pointer',
                    background: i % 2 === 0 ? '#080B0F' : '#0D1117',
                    borderBottom: '1px solid #1C2333',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background =
                      'rgba(0,255,136,0.04)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? '#080B0F' : '#0D1117'
                  }}
                >
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: '#2A3347',
                      padding: '8px 10px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {match.id.toUpperCase()}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 11,
                      color: '#E8EDF5',
                      padding: '8px 10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={match.polymarketQuestion}
                  >
                    {match.polymarketQuestion}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 11,
                      color: '#E8EDF5',
                      padding: '8px 10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={match.kalshiQuestion}
                  >
                    {match.kalshiQuestion}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <ConfidenceBadge value={match.confidence} />
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <StatusBadge status={match.status} />
                  </td>
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: '#F59E0B',
                      padding: '8px 10px',
                    }}
                  >
                    {match.spread.toFixed(1)}pp
                  </td>
                </tr>
                {expandedId === match.id && match.detail && (
                  <tr key={`${match.id}-detail`} style={{ background: '#111827' }}>
                    <td
                      colSpan={6}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #1C2333',
                        borderLeft: '3px solid #00FF88',
                      }}
                    >
                      <div
                        className="grid grid-cols-2 gap-4"
                        style={{ maxWidth: '600px' }}
                      >
                        {[
                          {
                            label: 'EMBEDDING SIMILARITY',
                            value: match.detail.embedding_similarity.toFixed(3),
                          },
                          {
                            label: 'KEYWORD OVERLAP',
                            value: match.detail.keyword_overlap.toFixed(3),
                          },
                          {
                            label: 'TEMPORAL MATCH',
                            value: match.detail.temporal_match ? 'YES' : 'NO',
                          },
                          { label: 'TIMESTAMP', value: match.timestamp },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div
                              style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 9,
                                color: '#6B7688',
                                letterSpacing: '0.1em',
                                marginBottom: 2,
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 11,
                                color: '#00FF88',
                              }}
                            >
                              {value}
                            </div>
                          </div>
                        ))}
                        <div className="col-span-2">
                          <div
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 9,
                              color: '#6B7688',
                              letterSpacing: '0.1em',
                              marginBottom: 2,
                            }}
                          >
                            NOTES
                          </div>
                          <div
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 10,
                              color: '#E8EDF5',
                              lineHeight: 1.6,
                            }}
                          >
                            {match.detail.notes}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
