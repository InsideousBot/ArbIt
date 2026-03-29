import { useEffect, useRef, useState, useCallback } from 'react';
import type { SimTrade, PnlPoint } from '../lib/types';
import { api } from '../lib/api';

const MARKET_COLOR: Record<string, string> = {
  polymarket: '#4fc3f7',
  kalshi: '#ff9800',
  manifold: '#a78bfa',
};

const SPEEDS = [1, 5, 20, 100];

function PnlChart({ curve, currentDate }: { curve: PnlPoint[]; currentDate: string }) {
  if (curve.length === 0) return null;
  const max = Math.max(...curve.map((p) => Math.abs(p.cumulative_pnl)), 1);
  const w = 100 / (curve.length - 1 || 1);

  return (
    <div className="relative h-20 w-full border border-border bg-surface overflow-hidden">
      <span className="absolute top-1 left-2 text-[9px] text-text-muted tracking-widest">P&L CURVE</span>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 100 40`} preserveAspectRatio="none">
        <line x1="0" y1="20" x2="100" y2="20" stroke="#333" strokeWidth="0.3" />
        {curve.map((p, i) => {
          if (i === 0) return null;
          const prev = curve[i - 1];
          const x1 = (i - 1) * w;
          const x2 = i * w;
          const y1 = 20 - (prev.cumulative_pnl / max) * 18;
          const y2 = 20 - (p.cumulative_pnl / max) * 18;
          const color = p.cumulative_pnl >= 0 ? '#4ade80' : '#f87171';
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.6" />;
        })}
        {/* current date marker */}
        {(() => {
          const idx = curve.findIndex((p) => p.date >= currentDate);
          if (idx < 0) return null;
          const x = idx * w;
          return <line x1={x} y1="0" x2={x} y2="40" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,1" />;
        })()}
      </svg>
    </div>
  );
}

function TradeCard({ trade }: { trade: SimTrade }) {
  const isWin = trade.outcome === 'WIN';
  const isLoss = trade.outcome === 'LOSS';
  const color = isWin ? '#4ade80' : isLoss ? '#f87171' : '#94a3b8';
  const bg = isWin ? 'bg-[#0a1a0f]' : isLoss ? 'bg-[#1a0a0a]' : 'bg-surface';
  const pnl = trade.realized_pnl;

  return (
    <div className={`px-3 py-2 border-b border-border ${bg} text-xs`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold" style={{ color }}>
          {isWin ? '▲ WIN' : isLoss ? '▼ LOSS' : '◌ UNKNOWN'}
        </span>
        <span className="text-[9px] font-bold px-1 border rounded" style={{ color: MARKET_COLOR[trade.platform_a] ?? '#888', borderColor: MARKET_COLOR[trade.platform_a] ?? '#888' }}>
          {trade.platform_a.toUpperCase().slice(0, 4)}
        </span>
        <span className="text-text-muted text-[9px]">↔</span>
        <span className="text-[9px] font-bold px-1 border rounded" style={{ color: MARKET_COLOR[trade.platform_b] ?? '#888', borderColor: MARKET_COLOR[trade.platform_b] ?? '#888' }}>
          {trade.platform_b.toUpperCase().slice(0, 4)}
        </span>
        <span className="ml-auto font-bold" style={{ color }}>
          {pnl !== null ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}` : '--'}
        </span>
      </div>
      <div className="text-text-primary truncate">{trade.text_a || trade.market_a_id}</div>
      <div className="text-text-muted text-[10px] mt-0.5">
        {trade.exit_date} · spread {Math.round(trade.raw_spread * 100)}pp · ${trade.recommended_size_usd.toFixed(0)} size
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const [allTrades, setAllTrades] = useState<SimTrade[]>([]);
  const [pnlCurve, setPnlCurve] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([api.getSimulationTrades(), api.getSimulationPnlCurve()])
      .then(([trades, curve]) => {
        setAllTrades(trades);
        setPnlCurve(curve);
        setCurrentIdx(0);
        if (trades.length > 0) setSelectedDate(trades[0].exit_date);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // unique sorted dates
  const dates = [...new Set(allTrades.map((t) => t.exit_date).filter(Boolean))].sort();

  const dateIdx = dates.indexOf(selectedDate);
  const visibleTrades = allTrades.filter((t) => t.exit_date <= selectedDate);
  const todayTrades = allTrades.filter((t) => t.exit_date === selectedDate);
  const currentPnl = pnlCurve.find((p) => p.date === selectedDate)?.cumulative_pnl ?? 0;
  const wins = visibleTrades.filter((t) => t.outcome === 'WIN').length;
  const losses = visibleTrades.filter((t) => t.outcome === 'LOSS').length;
  const totalPnl = visibleTrades.reduce((s, t) => s + (t.realized_pnl ?? 0), 0);

  const tick = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = prev + 1;
      if (next >= dates.length) {
        setPlaying(false);
        return prev;
      }
      setSelectedDate(dates[next]);
      return next;
    });
  }, [dates]);

  useEffect(() => {
    if (playing) {
      const ms = Math.max(50, 600 / speed);
      intervalRef.current = setInterval(tick, ms);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, tick]);

  function handleReset() {
    setPlaying(false);
    setCurrentIdx(0);
    if (dates.length > 0) setSelectedDate(dates[0]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING SIMULATION...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-5 text-red text-xs tracking-wider">⚠ {error}</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Controls */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-border bg-surface shrink-0 flex-wrap">
        <span className="text-[10px] text-text-muted tracking-[3px]">SIMULATION</span>

        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-3 py-1 text-xs tracking-widest border rounded transition-colors ${playing ? 'border-orange text-orange bg-orange/10' : 'border-green text-green hover:bg-green/10'}`}
        >
          {playing ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        <button onClick={handleReset} className="px-3 py-1 text-xs tracking-widest border border-border text-text-muted hover:text-text-secondary rounded">
          ↺ RESET
        </button>

        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${speed === s ? 'border-orange text-orange' : 'border-border text-text-muted'}`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Date scrubber */}
        <div className="flex-1 min-w-40 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(dates.length - 1, 0)}
            value={dateIdx >= 0 ? dateIdx : 0}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setCurrentIdx(idx);
              setSelectedDate(dates[idx] ?? '');
              setPlaying(false);
            }}
            className="flex-1 accent-orange cursor-pointer"
          />
          <span className="text-[10px] text-text-secondary tracking-wider w-24 shrink-0">{selectedDate || '--'}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-[10px] tracking-wider shrink-0">
          <span className="text-green">▲ {wins} WIN</span>
          <span className="text-red">▼ {losses} LOSS</span>
          <span className={totalPnl >= 0 ? 'text-green font-bold' : 'text-red font-bold'}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} P&L
          </span>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="px-5 pt-3 shrink-0">
        <PnlChart curve={pnlCurve} currentDate={selectedDate} />
      </div>

      {/* Trade log */}
      <div className="flex flex-1 overflow-hidden gap-4 px-5 pt-3 pb-3">

        {/* Today's trades */}
        <div className="flex flex-col border border-border" style={{ width: '340px', minWidth: '280px' }}>
          <div className="px-3 py-2 border-b border-border shrink-0">
            <span className="text-[10px] text-text-muted tracking-widest">
              RESOLVED ON {selectedDate || '--'} ({todayTrades.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {todayTrades.length === 0 ? (
              <div className="p-3 text-text-muted text-[10px] tracking-widest">NO TRADES THIS DATE</div>
            ) : (
              todayTrades.map((t) => <TradeCard key={t.pair_id} trade={t} />)
            )}
          </div>
        </div>

        {/* All resolved trades so far */}
        <div className="flex flex-col flex-1 border border-border overflow-hidden">
          <div className="px-3 py-2 border-b border-border shrink-0 flex items-center justify-between">
            <span className="text-[10px] text-text-muted tracking-widest">ALL TRADES UP TO {selectedDate || '--'} ({visibleTrades.length})</span>
            <span className={`text-xs font-bold ${currentPnl >= 0 ? 'text-green' : 'text-red'}`}>
              CUMULATIVE: {currentPnl >= 0 ? '+' : ''}${currentPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[...visibleTrades].reverse().map((t) => <TradeCard key={t.pair_id} trade={t} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
