import type { CandidatePair } from '../../lib/types';

interface StatsBarProps {
  candidates: CandidatePair[];
  lastRun: string | null;
  loading: boolean;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col px-4 border-r border-border last:border-r-0 justify-center">
      <span className={`text-sm font-bold tracking-wider ${color}`}>{value}</span>
      <span className="text-[10px] text-text-muted tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

export default function StatsBar({ candidates, lastRun, loading }: StatsBarProps) {
  const dash = '--';
  const count = candidates.length;
  const highConf = candidates.filter((c) => c.similarity_score >= 0.90).length;
  const negCount = candidates.filter((c) => c.has_potential_negation).length;
  const topScore = count > 0 ? Math.max(...candidates.map((c) => c.similarity_score)).toFixed(3) : dash;
  const bestSpread =
    count > 0
      ? `${Math.round(Math.max(...candidates.map((c) => c.price_spread)) * 100)}pp`
      : dash;
  const lastRunFormatted = lastRun
    ? new Date(lastRun).toLocaleTimeString('en-US', { hour12: false })
    : dash;

  if (loading) {
    return (
      <div className="flex items-center h-10 px-4 border-b border-border bg-surface shrink-0">
        <span className="text-text-muted text-xs tracking-widest animate-pulse">LOADING...</span>
      </div>
    );
  }

  return (
    <div className="flex items-stretch h-10 border-b border-border bg-surface shrink-0">
      <Stat label="CANDIDATES" value={String(count)} color="text-orange" />
      <Stat label="HIGH CONF ≥0.90" value={String(highConf)} color="text-green" />
      <Stat label="NEGATION ▲" value={String(negCount)} color="text-red" />
      <Stat label="TOP SCORE" value={topScore} color="text-orange" />
      <Stat label="BEST SPREAD" value={bestSpread} color="text-green" />
      <Stat label="LAST RUN" value={lastRunFormatted} color="text-text-secondary" />
    </div>
  );
}
