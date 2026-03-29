'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Opportunity } from '@/lib/types'

interface Props {
  opportunity: Opportunity
  index: number
}

export default function OpportunityCard({ opportunity, index }: Props) {
  const [reasoningOpen, setReasoningOpen] = useState(false)

  const {
    polymarket,
    kalshi,
    spread,
    profitMargin,
    geminiConfidence,
    geminiReasoning,
    timestamp,
    arbType,
  } = opportunity

  const borderWidth = Math.max(3, profitMargin * 0.8)

  const confidenceColor =
    geminiConfidence > 80 ? '#00FF88' : geminiConfidence > 60 ? '#F59E0B' : '#FF3B5C'
  const confidenceGlow =
    geminiConfidence > 80 ? 'glow-green' : geminiConfidence > 60 ? 'glow-amber' : 'glow-red'

  const arbDirectionLeft = arbType === 'YES_YES' ? 'BUY YES' : arbType === 'YES_NO' ? 'BUY NO' : 'BUY NO'
  const arbDirectionRight = arbType === 'YES_YES' ? 'SELL YES' : arbType === 'YES_NO' ? 'BUY YES' : 'SELL YES'

  const timeStr = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{
        borderLeft: `${borderWidth}px solid #00FF88`,
        background: '#0D1117',
        borderTop: '1px solid #1C2333',
        borderRight: '1px solid #1C2333',
        borderBottom: '1px solid #1C2333',
        marginBottom: '8px',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between px-3 pt-3 pb-2">
        <div>
          <div
            className="text-[9px] tracking-widest"
            style={{ fontFamily: 'Syne, sans-serif', color: '#6B7688', letterSpacing: '0.15em' }}
          >
            ARB OPPORTUNITY
          </div>
          <div
            className="text-[9px] mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#2A3347' }}
          >
            {timeStr}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold glow-green"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00FF88', lineHeight: 1 }}
          >
            +{spread.toFixed(1)}%
          </div>
          <div
            className="text-[9px] mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688', letterSpacing: '0.1em' }}
          >
            SPREAD
          </div>
        </div>
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-3 gap-0 px-3 pb-3" style={{ borderBottom: '1px solid #1C2333' }}>
        {/* Polymarket */}
        <div className="pr-3" style={{ borderRight: '1px solid #1C2333' }}>
          <span
            className="inline-block text-[9px] px-1.5 py-0.5 mb-1"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(79,195,247,0.12)',
              color: '#4fc3f7',
              letterSpacing: '0.08em',
              borderRadius: 0,
            }}
          >
            POLYMARKET
          </span>
          <p
            className="text-[11px] mb-1 line-clamp-2"
            style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5', lineHeight: 1.4 }}
          >
            {polymarket.question}
          </p>
          <div
            className="text-[10px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688' }}
          >
            YES:{' '}
            <span style={{ color: '#00FF88' }}>{polymarket.yesPrice.toFixed(2)}</span>
            {' '}|{' '}
            NO:{' '}
            <span style={{ color: '#FF3B5C' }}>{polymarket.noPrice.toFixed(2)}</span>
          </div>
          <div
            className="text-[9px] mt-1"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#2A3347' }}
          >
            VOL {polymarket.volume}
          </div>
        </div>

        {/* Center: arb direction */}
        <div className="flex flex-col items-center justify-center px-2">
          <div
            className="text-[10px] mb-1"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688' }}
          >
            {arbDirectionLeft}
          </div>
          <div
            className="text-lg"
            style={{ color: '#00FF88', lineHeight: 1 }}
          >
            ⇄
          </div>
          <div
            className="text-[10px] mt-1"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688' }}
          >
            {arbDirectionRight}
          </div>
          <span
            className="inline-block text-[8px] px-1 py-0.5 mt-2"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(0,255,136,0.1)',
              color: '#00FF88',
              border: '1px solid rgba(0,255,136,0.3)',
              letterSpacing: '0.06em',
              borderRadius: 0,
            }}
          >
            {arbType}
          </span>
        </div>

        {/* Kalshi */}
        <div className="pl-3" style={{ borderLeft: '1px solid #1C2333' }}>
          <span
            className="inline-block text-[9px] px-1.5 py-0.5 mb-1"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(245,158,11,0.12)',
              color: '#F59E0B',
              letterSpacing: '0.08em',
              borderRadius: 0,
            }}
          >
            KALSHI
          </span>
          <p
            className="text-[11px] mb-1 line-clamp-2"
            style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5', lineHeight: 1.4 }}
          >
            {kalshi.question}
          </p>
          <div
            className="text-[10px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7688' }}
          >
            YES:{' '}
            <span style={{ color: '#00FF88' }}>{kalshi.yesPrice.toFixed(2)}</span>
            {' '}|{' '}
            NO:{' '}
            <span style={{ color: '#FF3B5C' }}>{kalshi.noPrice.toFixed(2)}</span>
          </div>
          <div
            className="text-[9px] mt-1"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#2A3347' }}
          >
            VOL {kalshi.volume}
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #1C2333' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[9px]"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6B7688',
              letterSpacing: '0.1em',
            }}
          >
            GEMINI CONFIDENCE
          </span>
          <span
            className={`text-lg font-bold ${confidenceGlow}`}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: confidenceColor,
            }}
          >
            {geminiConfidence}
          </span>
        </div>
        <div
          className="w-full h-1.5"
          style={{ background: '#111827', borderRadius: 0 }}
        >
          <div
            className="confidence-bar h-full"
            style={{
              width: `${geminiConfidence}%`,
              background: `linear-gradient(to right, #F59E0B, #00FF88)`,
              borderRadius: 0,
            }}
          />
        </div>
        <div className="mt-1.5">
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex items-center gap-1"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              color: '#6B7688',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ transform: reasoningOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
              ▼
            </span>{' '}
            REASONING
          </button>
        </div>
        {reasoningOpen && (
          <div
            className="mt-1.5 pt-1.5"
            style={{ borderTop: '1px solid #1C2333' }}
          >
            <p
              className="text-[10px]"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: '#6B7688',
                lineHeight: 1.6,
              }}
            >
              {geminiReasoning}
            </p>
          </div>
        )}
      </div>

      {/* Bottom action row */}
      <div className="flex items-center justify-between px-3 py-2">
        <span
          className="text-[9px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#2A3347' }}
        >
          {opportunity.id.toUpperCase()} · {opportunity.polymarket.volume} POLY · {opportunity.kalshi.volume} KALS
        </span>
        <button
          className={profitMargin > 3 ? 'execute-pulse' : ''}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            padding: '4px 10px',
            border: `1px solid ${profitMargin > 3 ? '#00FF88' : '#2A3347'}`,
            color: profitMargin > 3 ? '#00FF88' : '#6B7688',
            background: profitMargin > 3 ? 'rgba(0,255,136,0.05)' : 'transparent',
            cursor: 'pointer',
            borderRadius: 0,
            ...(profitMargin > 3
              ? { textShadow: '0 0 8px rgba(0,255,136,0.6)' }
              : {}),
          }}
        >
          EXECUTE ARBITRAGE
        </button>
      </div>
    </motion.div>
  )
}
