import { useEffect, useRef, useState, useCallback } from 'react';
import type { SimTrade, PnlPoint } from '../lib/types';
import { api } from '../lib/api';

const PLATFORM_COLOR: Record<string, string> = {
  polymarket: '#4fc3f7',
  kalshi: '#ff9800',
  manifold: '#a78bfa',
};

const SPEEDS = [1, 5, 20, 100];

// ── P&L Curve ─────────────────────────────────────────────────────────────────

function PnlChart({ curve, currentDate }: { curve: PnlPoint[]; currentDate: string }) {
  if (curve.length === 0) return null;
  const visibleCurve = curve.filter((p) => p.date <= currentDate);
  const allValues = curve.map((p) => p.cumulative_pnl);
  const max = Math.max(...allValues.map(Math.abs), 1);
  const w = 100 / (curve.length - 1 || 1);

  return (
    <div className="relative h-16 w-full border border-border bg-surface overflow-hidden">
      <span className="absolute top-1 left-2 text-[9px] text-text-muted tracking-widest z-10">CUMULATIVE P&L</span>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
        <line x1="0" y1="16" x2="100" y2="16" stroke="#1e293b" strokeWidth="0.4" />
        {/* Full dim line */}
        {curve.map((p, i) => {
          if (i === 0) return null;
          const prev = curve[i - 1];
          return (
            <line
              key={`dim-${i}`}
              x1={(i - 1) * w} y1={16 - (prev.cumulative_pnl / max) * 14}
              x2={i * w}       y2={16 - (p.cumulative_pnl / max) * 14}
              stroke="#1e3a2a" strokeWidth="0.5"
            />
          );
        })}
        {/* Bright active line up to currentDate */}
        {visibleCurve.map((p, i) => {
          if (i === 0) return null;
          const prev = visibleCurve[i - 1];
          const gi = curve.findIndex((c) => c.date === p.date);
          const pgi = curve.findIndex((c) => c.date === prev.date);
          return (
            <line
              key={`act-${i}`}
              x1={pgi * w} y1={16 - (prev.cumulative_pnl / max) * 14}
              x2={gi * w}  y2={16 - (p.cumulative_pnl / max) * 14}
              stroke={p.cumulative_pnl >= 0 ? '#4ade80' : '#f87171'} strokeWidth="0.8"
            />
          );
        })}
        {/* Current date marker */}
        {(() => {
          const idx = curve.findIndex((p) => p.date >= currentDate);
          if (idx < 0) return null;
          return <line x1={idx * w} y1="0" x2={idx * w} y2="32" stroke="#f97316" strokeWidth="0.6" strokeDasharray="2,1" />;
        })()}
      </svg>
    </div>
  );
}

// ── Open position row (compact) ───────────────────────────────────────────────

function PositionRow({ trade, currentDate, isNew }: { trade: SimTrade; currentDate: string; isNew: boolean }) {
  const daysHeld = Math.max(0, Math.round(
    (new Date(currentDate).getTime() - new Date(trade.entry_date).getTime()) / 86_400_000
  ));
  const daysLeft = Math.max(0, Math.round(
    (new Date(trade.exit_date).getTime() - new Date(currentDate).getTime()) / 86_400_000
  ));
  const ca = PLATFORM_COLOR[trade.platform_a] ?? '#888';
  const cb = PLATFORM_COLOR[trade.platform_b] ?? '#888';

  return (
    <div className={`px-3 py-1.5 border-b border-border text-[11px] transition-colors ${isNew ? 'bg-[#0a1a0f]' : 'bg-transparent'}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {isNew && <span className="text-[8px] text-green tracking-widest font-bold">NEW</span>}
        <span className="font-bold px-1 border rounded text-[8px]" style={{ color: ca, borderColor: ca }}>
          {trade.platform_a.slice(0, 4).toUpperCase()}
        </span>
        <span className="text-text-muted text-[8px]">↔</span>
        <span className="font-bold px-1 border rounded text-[8px]" style={{ color: cb, borderColor: cb }}>
          {trade.platform_b.slice(0, 4).toUpperCase()}
        </span>
        <span className="text-text-muted ml-auto text-[9px]">
          <span className="text-orange">{daysLeft}d</span> left · held {daysHeld}d
        </span>
      </div>
      <div className="text-text-primary truncate leading-tight">
        {trade.text_a || trade.market_a_id}
      </div>
      <div className="text-text-muted text-[9px] mt-0.5">
        spread {Math.round(trade.raw_spread * 100)}pp · ${trade.recommended_size_usd.toFixed(0)} · conf {Math.round(trade.confidence * 100)}%
      </div>
    </div>
  );
}

// ── Resolved trade row ────────────────────────────────────────────────────────

function ResolvedRow({ trade }: { trade: SimTrade }) {
  const isWin = trade.outcome === 'WIN';
  const color = isWin ? '#4ade80' : '#94a3b8';
  const bg = isWin ? 'bg-[#0a1a0f]' : 'bg-surface';
  const pnl = trade.realized_pnl;

  return (
    <div className={`px-3 py-1.5 border-b border-border text-[11px] ${bg}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-bold text-[9px] tracking-widest" style={{ color }}>
          {isWin ? '▲ WIN' : '◌ UNK'}
        </span>
        <span className="text-[8px] font-bold px-1 border rounded" style={{ color: PLATFORM_COLOR[trade.platform_a] ?? '#888', borderColor: PLATFORM_COLOR[trade.platform_a] ?? '#888' }}>
          {trade.platform_a.slice(0, 4).toUpperCase()}
        </span>
        <span className="text-[8px] text-text-muted">↔</span>
        <span className="text-[8px] font-bold px-1 border rounded" style={{ color: PLATFORM_COLOR[trade.platform_b] ?? '#888', borderColor: PLATFORM_COLOR[trade.platform_b] ?? '#888' }}>
          {trade.platform_b.slice(0, 4).toUpperCase()}
        </span>
        <span className="ml-auto font-bold text-[10px]" style={{ color }}>
          {pnl !== null ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}` : '--'}
        </span>
      </div>
      <div className="text-text-primary truncate leading-tight">
        {trade.text_a || trade.market_a_id}
      </div>
      <div className="text-text-muted text-[9px] mt-0.5">
        entered {trade.entry_date} · spread {Math.round(trade.raw_spread * 100)}pp
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const [allTrades, setAllTrades] = useState<SimTrade[]>([]);
  const [pnlCurve, setPnlCurve] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [dateIdx, setDateIdx] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([api.getSimulationTrades(), api.getSimulationPnlCurve()])
      .then(([trades, curve]) => {
        setAllTrades(trades);
        setPnlCurve(curve);
        setDateIdx(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // All unique dates from the full P&L curve (one per calendar day)
  const allDates = pnlCurve.map((p) => p.date);
  const selectedDate = allDates[dateIdx] ?? '';

  // Positions open on selectedDate: entry_date <= selectedDate < exit_date
  const openPositions = allTrades.filter(
    (t) => t.entry_date <= selectedDate && t.exit_date > selectedDate
  );
  // New today: entered on selectedDate
  const newToday = new Set(
    allTrades.filter((t) => t.entry_date === selectedDate).map((t) => t.signal_id)
  );
  // Resolved on selectedDate
  const resolvedToday = allTrades.filter((t) => t.exit_date === selectedDate);
  // Cumulative resolved trades up to and including selectedDate
  const resolvedAll = allTrades.filter((t) => t.exit_date <= selectedDate);

  const currentPnl = pnlCurve[dateIdx]?.cumulative_pnl ?? 0;
  const wins = resolvedAll.filter((t) => t.outcome === 'WIN').length;
  const unknowns = resolvedAll.filter((t) => t.outcome === 'UNKNOWN').length;
  const totalPnl = resolvedAll.reduce((s, t) => s + (t.realized_pnl ?? 0), 0);

  const tick = useCallback(() => {
    setDateIdx((prev) => {
      if (prev >= allDates.length - 1) { setPlaying(false); return prev; }
      return prev + 1;
    });
  }, [allDates.length]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(tick, Math.max(30, 500 / speed));
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, tick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING SIMULATION…</span>
      </div>
    );
  }
  if (error) return <div className="p-5 text-red text-xs tracking-wider">⚠ {error}</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0 flex-wrap">
        <span className="text-[10px] text-text-muted tracking-[3px]">SIMULATION</span>

        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-3 py-1 text-xs tracking-widest border rounded transition-colors ${
            playing ? 'border-orange text-orange bg-orange/10' : 'border-green text-green hover:bg-green/10'
          }`}
        >
          {playing ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        <button
          onClick={() => { setPlaying(false); setDateIdx(0); }}
          className="px-2 py-1 text-xs tracking-widest border border-border text-text-muted hover:text-text-secondary rounded"
        >
          ↺
        </button>

        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                speed === s ? 'border-orange text-orange' : 'border-border text-text-muted'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-32 flex items-center gap-2">
          <input
            type="range" min={0} max={Math.max(allDates.length - 1, 0)} value={dateIdx}
            onChange={(e) => { setDateIdx(Number(e.target.value)); setPlaying(false); }}
            className="flex-1 accent-orange cursor-pointer"
          />
          <span className="text-[10px] text-text-secondary tracking-wider w-24 shrink-0">{selectedDate || '--'}</span>
        </div>

        <div className="flex gap-3 text-[10px] tracking-wider shrink-0">
          <span className="text-text-muted"><span className="text-orange font-bold">{openPositions.length}</span> OPEN</span>
          <span className="text-green">▲ {wins} WIN</span>
          <span className="text-text-muted">◌ {unknowns} UNK</span>
          <span className={`font-bold ${totalPnl >= 0 ? 'text-green' : 'text-red'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── P&L Chart ─────────────────────────────────────────────────────── */}
      <div className="px-4 pt-2 shrink-0">
        <PnlChart curve={pnlCurve} currentDate={selectedDate} />
      </div>

      {/* ── Main panels ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden gap-0 px-4 pt-2 pb-3 gap-3">

        {/* LEFT: Open positions ─────────────────────────────────────────── */}
        <div className="flex flex-col border border-border overflow-hidden" style={{ width: '340px', minWidth: '260px' }}>
          <div className="px-3 py-1.5 border-b border-border shrink-0 flex items-center justify-between bg-surface">
            <span className="text-[9px] text-text-muted tracking-widest">OPEN POSITIONS</span>
            <span className="text-[10px] text-orange font-bold">{openPositions.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {openPositions.length === 0 ? (
              <div className="p-3 text-text-muted text-[10px] tracking-widest">NO OPEN POSITIONS</div>
            ) : (
              // Sort: new entries first, then by days remaining ascending
              [...openPositions]
                .sort((a, b) => {
                  const aN = newToday.has(a.signal_id) ? 0 : 1;
                  const bN = newToday.has(b.signal_id) ? 0 : 1;
                  if (aN !== bN) return aN - bN;
                  return a.exit_date.localeCompare(b.exit_date);
                })
                .map((t) => (
                  <PositionRow
                    key={t.signal_id}
                    trade={t}
                    currentDate={selectedDate}
                    isNew={newToday.has(t.signal_id)}
                  />
                ))
            )}
          </div>
        </div>

        {/* RIGHT: Today's activity + resolved history ──────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden gap-3">

          {/* Today's activity */}
          <div className="flex border border-border overflow-hidden shrink-0" style={{ maxHeight: '50%' }}>

            {/* Entered today */}
            <div className="flex flex-col flex-1 border-r border-border overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border shrink-0 bg-surface flex items-center justify-between">
                <span className="text-[9px] text-text-muted tracking-widest">ENTERED TODAY</span>
                <span className="text-[10px] text-green font-bold">{newToday.size}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {newToday.size === 0 ? (
                  <div className="p-3 text-text-muted text-[10px] tracking-widest">NONE</div>
                ) : (
                  allTrades
                    .filter((t) => t.entry_date === selectedDate)
                    .map((t) => (
                      <div key={t.signal_id} className="px-3 py-1.5 border-b border-border text-[11px] bg-[#071a10]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[8px] text-green font-bold tracking-widest">+ ENTER</span>
                          <span className="text-[8px] font-bold px-1 border rounded" style={{ color: PLATFORM_COLOR[t.platform_a] ?? '#888', borderColor: PLATFORM_COLOR[t.platform_a] ?? '#888' }}>
                            {t.platform_a.slice(0, 4).toUpperCase()}
                          </span>
                          <span className="text-text-muted text-[8px]">↔</span>
                          <span className="text-[8px] font-bold px-1 border rounded" style={{ color: PLATFORM_COLOR[t.platform_b] ?? '#888', borderColor: PLATFORM_COLOR[t.platform_b] ?? '#888' }}>
                            {t.platform_b.slice(0, 4).toUpperCase()}
                          </span>
                          <span className="ml-auto text-[9px] text-orange">exp +${t.expected_profit.toFixed(0)}</span>
                        </div>
                        <div className="text-text-primary truncate leading-tight">{t.text_a || t.market_a_id}</div>
                        <div className="text-text-muted text-[9px] mt-0.5">
                          spread {Math.round(t.raw_spread * 100)}pp · ${t.recommended_size_usd.toFixed(0)} · exits {t.exit_date}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Resolved today */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border shrink-0 bg-surface flex items-center justify-between">
                <span className="text-[9px] text-text-muted tracking-widest">RESOLVED TODAY</span>
                <span className="text-[10px] font-bold" style={{ color: resolvedToday.length > 0 ? '#4ade80' : '#64748b' }}>
                  {resolvedToday.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {resolvedToday.length === 0 ? (
                  <div className="p-3 text-text-muted text-[10px] tracking-widest">NONE</div>
                ) : (
                  resolvedToday.map((t) => <ResolvedRow key={t.signal_id} trade={t} />)
                )}
              </div>
            </div>
          </div>

          {/* All resolved history */}
          <div className="flex flex-col flex-1 border border-border overflow-hidden">
            <div className="px-3 py-1.5 border-b border-border shrink-0 bg-surface flex items-center justify-between">
              <span className="text-[9px] text-text-muted tracking-widest">RESOLVED HISTORY</span>
              <span className={`text-[10px] font-bold ${currentPnl >= 0 ? 'text-green' : 'text-red'}`}>
                CUM {currentPnl >= 0 ? '+' : ''}${currentPnl.toFixed(2)}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {[...resolvedAll].reverse().map((t) => <ResolvedRow key={t.signal_id} trade={t} />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
