'use client'
import { OPPORTUNITIES } from '@/lib/mockData'
import OpportunityCard from './OpportunityCard'

export default function OpportunityFeed() {
  const liveOpps = OPPORTUNITIES.filter((o) => o.status === 'live')

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
          OPPORTUNITY FEED
        </h2>
        <span
          className="px-1.5 py-0.5 text-[9px]"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(0,255,136,0.12)',
            color: '#00FF88',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 0,
            letterSpacing: '0.06em',
          }}
        >
          {liveOpps.length} LIVE
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 4px #00FF88',
              animation: 'amber-pulse 1.2s ease-in-out infinite',
            }}
          />
          <span
            className="text-[9px]"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6B7688',
              letterSpacing: '0.1em',
            }}
          >
            AUTO-REFRESH 5s
          </span>
        </div>
      </div>

      {/* Cards */}
      {liveOpps.length === 0 ? (
        <div
          className="text-center py-16"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688', fontSize: 12, letterSpacing: '0.1em' }}
        >
          SCANNING FOR OPPORTUNITIES...
        </div>
      ) : (
        <div>
          {liveOpps.map((opp, i) => (
            <OpportunityCard key={opp.id} opportunity={opp} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
