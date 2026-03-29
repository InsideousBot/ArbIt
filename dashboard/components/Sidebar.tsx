'use client'
import { useState, useEffect } from 'react'
import { useCounter } from '@/lib/useCounter'
import { OPPORTUNITIES } from '@/lib/mockData'

export default function Sidebar() {
  const [syncSeconds, setSyncSeconds] = useState(12)
  const [profitTarget, setProfitTarget] = useState(4847.32)
  const [minSpread, setMinSpread] = useState(3)
  const [minConfidence, setMinConfidence] = useState(70)

  const animatedProfit = useCounter(profitTarget, 1000)

  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncSeconds((s) => (s >= 60 ? 0 : s + 1))
    }, 1000)
    return () => clearInterval(syncInterval)
  }, [])

  useEffect(() => {
    const profitInterval = setInterval(() => {
      setProfitTarget((p) => p + Math.random() * 12 + 1)
    }, 8000)
    return () => clearInterval(profitInterval)
  }, [])

  const formatSync = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const liveCount = OPPORTUNITIES.filter((o) => o.status === 'live').length

  return (
    <div
      className="flex flex-col border-r border-border flex-shrink-0"
      style={{
        width: '220px',
        height: '100%',
        background: '#0D1117',
      }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          ARB<span style={{ color: '#00FF88' }}>⚡</span>SIG
        </div>
        <div
          className="text-[9px] mt-0.5"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: '#6B7688',
            letterSpacing: '0.12em',
          }}
        >
          ARBITRAGE SCANNER v2.1
        </div>
      </div>

      {/* System status */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="sonar-dot flex-shrink-0" />
          <span
            className="text-[10px] font-bold tracking-widest"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#00FF88',
            }}
          >
            SYSTEM ONLINE
          </span>
        </div>
        <div className="space-y-1">
          {[
            { label: 'POLYMARKET', color: '#4fc3f7', status: 'CONNECTED' },
            { label: 'KALSHI', color: '#F59E0B', status: 'CONNECTED' },
            { label: 'GEMINI API', color: '#00FF88', status: 'ACTIVE' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 4px ${item.color}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  color: '#6B7688',
                  letterSpacing: '0.08em',
                }}
              >
                {item.label}{' '}
                <span style={{ color: item.color }}>● {item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live stats */}
      <div className="p-3 border-b border-border space-y-3 flex-1">
        <div>
          <div
            className="text-[9px] mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6B7688',
              letterSpacing: '0.1em',
            }}
          >
            ACTIVE OPPORTUNITIES
          </div>
          <div
            className="text-3xl font-bold glow-green"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#00FF88',
            }}
          >
            {liveCount}
          </div>
        </div>

        <div>
          <div
            className="text-[9px] mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6B7688',
              letterSpacing: '0.1em',
            }}
          >
            TOTAL PROFIT TODAY
          </div>
          <div
            className="text-xl font-bold glow-green"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#00FF88',
            }}
          >
            ${animatedProfit.toFixed(2)}
          </div>
        </div>

        <div>
          <div
            className="text-[9px] mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6B7688',
              letterSpacing: '0.1em',
            }}
          >
            SUCCESS RATE
          </div>
          <div
            className="text-xl font-bold glow-amber"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#F59E0B',
            }}
          >
            78.6%
          </div>
        </div>
      </div>

      {/* Threshold controls */}
      <div className="p-3 border-b border-border space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: '#6B7688',
                letterSpacing: '0.08em',
              }}
            >
              MIN SPREAD
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: '#00FF88',
              }}
            >
              {minSpread}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={minSpread}
            onChange={(e) => setMinSpread(Number(e.target.value))}
            className="w-full h-1 appearance-none rounded-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00FF88 ${(minSpread / 20) * 100}%, #1C2333 ${(minSpread / 20) * 100}%)`,
              outline: 'none',
            }}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: '#6B7688',
                letterSpacing: '0.08em',
              }}
            >
              MIN CONFIDENCE
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: '#00FF88',
              }}
            >
              {minConfidence}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-full h-1 appearance-none rounded-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00FF88 ${minConfidence}%, #1C2333 ${minConfidence}%)`,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3">
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: '#6B7688',
            letterSpacing: '0.08em',
          }}
        >
          LAST SYNC{' '}
          <span style={{ color: '#2A3347' }}>{formatSync(syncSeconds)}</span>{' '}
          AGO
        </div>
      </div>
    </div>
  )
}
