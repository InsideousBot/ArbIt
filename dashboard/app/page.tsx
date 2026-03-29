'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AuthScreen from '@/components/AuthScreen'
import Ticker from '@/components/Ticker'
import Sidebar from '@/components/Sidebar'
import OpportunityFeed from '@/components/OpportunityFeed'
import MatchesExplorer from '@/components/MatchesExplorer'
import ExecutionLog from '@/components/ExecutionLog'
import { EXECUTIONS, OPPORTUNITIES } from '@/lib/mockData'
import type { Execution, Opportunity } from '@/lib/types'

const SpreadHistory = dynamic(() => import('@/components/SpreadHistory'), { ssr: false })

type Tab = 'feed' | 'matches' | 'execution' | 'spread'

const TABS: { id: Tab; label: string }[] = [
  { id: 'feed',      label: 'Opportunity Feed' },
  { id: 'matches',   label: 'Matches Explorer' },
  { id: 'execution', label: 'Execution Log' },
  { id: 'spread',    label: 'Spread History' },
]

const AUTH_STORAGE_KEY = 'arbit-dashboard-auth'

function buildExecutionFromOpportunity(opportunity: Opportunity): Execution {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const eventTitle = opportunity.polymarket.question.split('?')[0] || opportunity.kalshi.question
  const polymarketSide = opportunity.arbType === 'YES_NO'
    ? `BUY NO @ ${opportunity.polymarket.noPrice.toFixed(3)}`
    : `SELL YES @ ${opportunity.polymarket.yesPrice.toFixed(3)}`
  const kalshiSide = `BUY YES @ ${opportunity.kalshi.yesPrice.toFixed(3)}`

  return {
    id: `exec-${Date.now()}`,
    time,
    event: `${kalshiSide.includes('BUY YES') ? 'BUY YES Kalshi' : 'BUY Kalshi'} + ${polymarketSide.startsWith('SELL') ? 'SELL YES Polymarket' : 'BUY NO Polymarket'} — ${eventTitle}`,
    polymarketSide,
    kalshiSide,
    grossSpread: opportunity.spread,
    netPnl: parseFloat((opportunity.profitMargin * 118.4).toFixed(2)),
    status: 'PENDING',
    matchId: opportunity.id.replace('arb', 'mtch'),
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [countdown, setCountdown] = useState(5)
  const [authenticated, setAuthenticated] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [operatorEmail, setOperatorEmail] = useState('operator@arbit.trade')
  const [opportunities, setOpportunities] = useState<Opportunity[]>(OPPORTUNITIES)
  const [executions, setExecutions] = useState<Execution[]>(EXECUTIONS)

  const liveCount = opportunities.filter((o) => o.status === 'live').length

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 5 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (saved) {
      setAuthenticated(true)
      setOperatorEmail(saved)
    }
    setHydrated(true)
  }, [])

  function handleAuthenticate(email: string) {
    setAuthenticated(true)
    setOperatorEmail(email)
    window.localStorage.setItem(AUTH_STORAGE_KEY, email)
  }

  function handleLogout() {
    setAuthenticated(false)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  function handleExecute(opportunityId: string) {
    const target = opportunities.find((opportunity) => opportunity.id === opportunityId)
    if (!target || target.status === 'executed') return

    const execution = buildExecutionFromOpportunity(target)
    setOpportunities((current) =>
      current.map((opportunity) =>
        opportunity.id === opportunityId ? { ...opportunity, status: 'executed' } : opportunity
      )
    )
    setExecutions((current) => [execution, ...current])
    setActiveTab('execution')

    window.setTimeout(() => {
      setExecutions((current) =>
        current.map((item) =>
          item.id === execution.id ? { ...item, status: 'CONFIRMED' } : item
        )
      )
    }, 1400)
  }

  if (!hydrated) {
    return <div style={{ minHeight: '100vh', background: '#000' }} />
  }

  if (!authenticated) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000' }}>
      <Ticker />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          opportunities={opportunities}
          executions={executions}
          operatorEmail={operatorEmail}
          onLogout={handleLogout}
        />
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderLeft: '1px solid #1A1A1A' }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            height: 40,
            borderBottom: '1px solid #1A1A1A',
            background: '#000',
            flexShrink: 0,
          }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.02em',
                    padding: '0 20px',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #00FF88' : '2px solid transparent',
                    background: 'transparent',
                    color: isActive ? '#fff' : '#888',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#ccc' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
                >
                  {tab.label}
                  {tab.id === 'feed' && (
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      background: '#00FF88',
                      color: '#000',
                      borderRadius: 10,
                      padding: '1px 6px',
                      lineHeight: '14px',
                    }}>
                      {liveCount}
                    </span>
                  )}
                </button>
              )
            })}

            {/* Right side: LIVE + refresh */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, paddingRight: 20, borderLeft: '1px solid #1A1A1A', paddingLeft: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: '#00FF88', letterSpacing: '0.08em' }}>LIVE</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#666', letterSpacing: '0.06em' }}>
                REFRESH {countdown}s
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#000' }}>
            {activeTab === 'feed'      && <OpportunityFeed opportunities={opportunities} onExecute={handleExecute} />}
            {activeTab === 'matches'   && <MatchesExplorer />}
            {activeTab === 'execution' && <ExecutionLog executions={executions} />}
            {activeTab === 'spread'    && <SpreadHistory />}
          </div>

        </main>
      </div>
    </div>
  )
}
