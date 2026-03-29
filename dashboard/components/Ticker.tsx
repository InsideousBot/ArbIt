'use client'
import { TICKER_ITEMS } from '@/lib/mockData'
import type { MarketTicker } from '@/lib/types'

function TickerItem({ item }: { item: MarketTicker }) {
  const isUp = item.change >= 0
  return (
    <div className="flex items-center gap-2 px-4 border-r border-border flex-shrink-0">
      <span
        className="text-[10px] font-mono px-1 py-0.5 rounded-sm"
        style={{
          background: item.platform === 'POLY' ? 'rgba(79,195,247,0.15)' : 'rgba(245,158,11,0.15)',
          color: item.platform === 'POLY' ? '#4fc3f7' : '#F59E0B',
          fontFamily: 'JetBrains Mono, monospace',
          borderRadius: 0,
        }}
      >
        {item.platform}
      </span>
      <span className="text-[11px] text-muted whitespace-nowrap" style={{ fontFamily: 'Syne, sans-serif' }}>
        {item.name}
      </span>
      <span
        className="text-[11px] font-mono ml-1"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: '#E8EDF5',
        }}
      >
        {item.price.toFixed(2)}
      </span>
      <span
        className="text-[10px] font-mono"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: isUp ? '#00FF88' : '#FF3B5C',
        }}
      >
        {isUp ? '+' : ''}{item.change.toFixed(1)}%
      </span>
    </div>
  )
}

export default function Ticker() {
  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      className="w-full overflow-hidden flex-shrink-0 border-b border-border"
      style={{
        height: '32px',
        background: '#0D1117',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="text-[9px] font-mono px-2 flex-shrink-0 border-r border-border h-full flex items-center"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: '#00FF88',
          background: 'rgba(0,255,136,0.05)',
          letterSpacing: '0.1em',
          minWidth: 'fit-content',
        }}
      >
        LIVE
      </div>
      <div className="flex-1 overflow-hidden h-full relative">
        <div className="ticker-track h-full items-center">
          {allItems.map((item, i) => (
            <TickerItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
