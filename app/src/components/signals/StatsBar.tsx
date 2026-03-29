import type { SignalsStats } from '../../lib/types';

export type SignalsRankingMode = 'profit' | 'diverse';

interface StatsBarProps {
  stats: SignalsStats | null;
  loading: boolean;
  ranking?: SignalsRankingMode;
  onRankingChange?: (mode: SignalsRankingMode) => void;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col px-4 border-r border-border last:border-r-0 justify-center">
      <span className={`text-sm font-bold tracking-wider ${color}`}>{value}</span>
      <span className="text-[10px] text-text-muted tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

export default function StatsBar({ stats, loading, ranking, onRankingChange }: StatsBarProps) {
  const dash = '--';

  if (loading) {
    return (
      <div className="flex items-center justify-between h-10 px-4 border-b border-border bg-surface shrink-0 gap-2">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING...</span>
        {onRankingChange && ranking !== undefined && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-text-muted tracking-widest hidden sm:inline">RANK</span>
            <div className="flex rounded border border-border overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => onRankingChange('profit')}
                className={`px-2 py-1 tracking-wide ${
                  ranking === 'profit' ? 'bg-orange/20 text-orange' : 'text-text-muted'
                }`}
              >
                Best EV
              </button>
              <button
                type="button"
                onClick={() => onRankingChange('diverse')}
                className={`px-2 py-1 tracking-wide border-l border-border ${
                  ranking === 'diverse' ? 'bg-orange/20 text-orange' : 'text-text-muted'
                }`}
              >
                Diverse
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const totalEv = stats ? `$${stats.total_ev.toFixed(0)}` : dash;
  const topEv = stats ? `$${stats.top_ev.toFixed(2)}` : dash;
  const avgConf = stats ? `${(stats.avg_confidence * 100).toFixed(1)}%` : dash;
  const avgSpread = stats ? `${(stats.avg_spread * 100).toFixed(1)}pp` : dash;

  return (
    <div className="flex items-stretch h-10 border-b border-border bg-surface shrink-0">
      <Stat label="SIGNALS" value={String(total)} color="text-orange" />
      <Stat label="TOTAL EV" value={totalEv} color="text-green" />
      <Stat label="TOP EV" value={topEv} color="text-green" />
      <Stat label="AVG CONFIDENCE" value={avgConf} color="text-orange" />
      <Stat label="AVG SPREAD" value={avgSpread} color="text-text-secondary" />
      {onRankingChange && ranking !== undefined && (
        <div className="flex items-center gap-1 px-3 ml-auto border-l border-border">
          <span className="text-[10px] text-text-muted tracking-widest shrink-0 hidden sm:inline">
            RANK
          </span>
          <div className="flex rounded border border-border overflow-hidden text-[10px]">
            <button
              type="button"
              onClick={() => onRankingChange('profit')}
              className={`px-2 py-1 tracking-wide ${
                ranking === 'profit'
                  ? 'bg-orange/20 text-orange'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Best EV
            </button>
            <button
              type="button"
              onClick={() => onRankingChange('diverse')}
              className={`px-2 py-1 tracking-wide border-l border-border ${
                ranking === 'diverse'
                  ? 'bg-orange/20 text-orange'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Diverse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
