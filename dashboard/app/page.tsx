'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Ticker from '@/components/Ticker'
import Sidebar from '@/components/Sidebar'
import OpportunityFeed from '@/components/OpportunityFeed'
import MatchesExplorer from '@/components/MatchesExplorer'
import ExecutionLog from '@/components/ExecutionLog'

const SpreadHistory = dynamic(() => import('@/components/SpreadHistory'), { ssr: false })

type Tab = 'feed' | 'matches' | 'execution' | 'spread'

const TABS: { id: Tab; label: string }[] = [
  { id: 'feed', label: 'OPPORTUNITY FEED' },
  { id: 'matches', label: 'MATCHES EXPLORER' },
  { id: 'execution', label: 'EXECUTION LOG' },
  { id: 'spread', label: 'SPREAD HISTORY' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100vh', background: '#080B0F' }}
    >
      <Ticker />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Tab bar */}
          <div
            className="flex flex-shrink-0"
            style={{
              borderBottom: '1px solid #1C2333',
              background: '#0D1117',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    padding: '10px 18px',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #00FF88' : '2px solid transparent',
                    background: isActive
                      ? 'linear-gradient(to bottom, rgba(0,255,136,0.06), transparent)'
                      : 'transparent',
                    color: isActive ? '#00FF88' : '#6B7688',
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                    outline: 'none',
                    ...(isActive ? { textShadow: '0 0 8px rgba(0,255,136,0.4)' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#E8EDF5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#6B7688'
                    }
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
            <div className="flex-1" style={{ borderBottom: '2px solid transparent' }} />
          </div>

          {/* Tab content */}
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ background: '#080B0F' }}
          >
            {activeTab === 'feed' && <OpportunityFeed />}
            {activeTab === 'matches' && <MatchesExplorer />}
            {activeTab === 'execution' && <ExecutionLog />}
            {activeTab === 'spread' && <SpreadHistory />}
          </div>
        </main>
      </div>
    </div>
  )
}
