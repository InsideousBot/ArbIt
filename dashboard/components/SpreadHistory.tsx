'use client'
import { useState } from 'react'
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { SPREAD_HISTORY } from '@/lib/mockData'
import type { SpreadPoint } from '@/lib/types'

const PAIR_OPTIONS = ['BTC $100K', 'Fed Rate Cut', 'Biden 2024']

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const poly = payload.find((p) => p.name === 'polyPrice')
  const kalshi = payload.find((p) => p.name === 'kalshiPrice')
  const spread = poly && kalshi ? Math.abs(poly.value - kalshi.value) : 0

  return (
    <div
      style={{
        background: '#0D1117',
        border: '1px solid #1C2333',
        padding: '8px 12px',
        borderRadius: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          color: '#6B7688',
          marginBottom: 4,
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </div>
      {poly && (
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#4fc3f7',
          }}
        >
          POLY: {poly.value.toFixed(3)}
        </div>
      )}
      {kalshi && (
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#F59E0B',
          }}
        >
          KALSHI: {kalshi.value.toFixed(3)}
        </div>
      )}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: '#00FF88',
          marginTop: 2,
        }}
      >
        SPREAD: {(spread * 100).toFixed(1)}pp
      </div>
    </div>
  )
}

export default function SpreadHistory() {
  const [selectedPair, setSelectedPair] = useState(PAIR_OPTIONS[0])

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid #1C2333' }}
      >
        <div className="flex items-center gap-3">
          <h2
            className="text-sm font-bold tracking-widest"
            style={{ fontFamily: 'Syne, sans-serif', color: '#E8EDF5', letterSpacing: '0.2em' }}
          >
            SPREAD HISTORY — 24H
          </h2>
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-1.5">
              <div style={{ width: 20, height: 2, background: '#4fc3f7' }} />
              <span
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#4fc3f7' }}
              >
                POLYMARKET
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 20, height: 2, background: '#F59E0B' }} />
              <span
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#F59E0B' }}
              >
                KALSHI
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                style={{ width: 16, height: 10, background: 'rgba(0,255,136,0.2)', border: '1px solid rgba(0,255,136,0.4)' }}
              />
              <span
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#00FF88' }}
              >
                ARB SPREAD
              </span>
            </div>
          </div>
        </div>

        <select
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#E8EDF5',
            background: '#111827',
            border: '1px solid #1C2333',
            padding: '4px 8px',
            borderRadius: 0,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {PAIR_OPTIONS.map((opt) => (
            <option key={opt} value={opt} style={{ background: '#111827' }}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={SPREAD_HISTORY}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1C2333"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              tick={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                fill: '#6B7688',
              }}
              tickLine={false}
              axisLine={{ stroke: '#1C2333' }}
              interval={5}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                fill: '#6B7688',
              }}
              tickLine={false}
              axisLine={{ stroke: '#1C2333' }}
              tickFormatter={(v: number) => v.toFixed(2)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Spread fill area (computed as spread field) */}
            <Area
              type="monotone"
              dataKey="spread"
              stroke="none"
              fill="rgba(0,255,136,0.15)"
              fillOpacity={1}
              legendType="none"
              isAnimationActive={false}
            />

            {/* Polymarket price line */}
            <Area
              type="monotone"
              dataKey="polyPrice"
              stroke="#4fc3f7"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={{ r: 3, fill: '#4fc3f7', stroke: '#4fc3f7' }}
              isAnimationActive={false}
            />

            {/* Kalshi price line */}
            <Area
              type="monotone"
              dataKey="kalshiPrice"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={{ r: 3, fill: '#F59E0B', stroke: '#F59E0B' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats */}
      <div
        className="flex gap-6 mt-3 pt-3"
        style={{ borderTop: '1px solid #1C2333' }}
      >
        {[
          { label: 'CURRENT SPREAD', value: `${(SPREAD_HISTORY[SPREAD_HISTORY.length - 1]?.spread * 100).toFixed(1)}pp`, color: '#00FF88' },
          { label: 'MAX SPREAD (24H)', value: `${(Math.max(...SPREAD_HISTORY.map((p: SpreadPoint) => p.spread)) * 100).toFixed(1)}pp`, color: '#F59E0B' },
          { label: 'MIN SPREAD (24H)', value: `${(Math.min(...SPREAD_HISTORY.map((p: SpreadPoint) => p.spread)) * 100).toFixed(1)}pp`, color: '#6B7688' },
          { label: 'AVG POLY PRICE', value: (SPREAD_HISTORY.reduce((s: number, p: SpreadPoint) => s + p.polyPrice, 0) / SPREAD_HISTORY.length).toFixed(3), color: '#4fc3f7' },
          { label: 'AVG KALSHI PRICE', value: (SPREAD_HISTORY.reduce((s: number, p: SpreadPoint) => s + p.kalshiPrice, 0) / SPREAD_HISTORY.length).toFixed(3), color: '#F59E0B' },
        ].map(({ label, value, color }) => (
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
                fontSize: 13,
                fontWeight: 600,
                color,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
