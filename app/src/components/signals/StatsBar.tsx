import type { CandidatePair } from '../../lib/types';

interface StatsBarProps {
  candidates: CandidatePair[];
  lastRun: string | null;
  loading: boolean;
}

function Stat({
  label, value, sub, color, glowClass, borderColor
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  glowClass?: string;
  borderColor?: string;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 20px',
      borderRight: `1px solid #0f1428`,
      borderLeft: borderColor ? `2px solid ${borderColor}` : undefined,
      minWidth: '80px',
      gap: '2px',
    }}>
      <span
        className={glowClass}
        style={{
          fontSize: '22px',
          fontWeight: '600',
          color,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: '8px', color: '#2a3060', letterSpacing: '0.2em', fontWeight: '400' }}>
        {label}
        {sub && <span style={{ color: '#1a2040', marginLeft: '4px' }}>{sub}</span>}
      </span>
    </div>
  );
}

export default function StatsBar({ candidates, lastRun, loading }: StatsBarProps) {
  const dash = '--';
  const count = candidates.length;
  const highConf = candidates.filter(c => c.similarity_score >= 0.90).length;
  const negCount = candidates.filter(c => c.has_potential_negation).length;
  const topScore = count > 0 ? Math.max(...candidates.map(c => c.similarity_score)).toFixed(3) : dash;
  const bestSpread = count > 0
    ? `${Math.round(Math.max(...candidates.map(c => c.price_spread)) * 100)}`
    : dash;
  const lastRunStr = lastRun
    ? new Date(lastRun).toLocaleTimeString('en-US', { hour12: false })
    : dash;

  return (
    <div style={{
      display: 'flex',
      height: '52px',
      borderBottom: '1px solid #0f1428',
      background: 'linear-gradient(180deg, #070a14 0%, #060810 100%)',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Left accent */}
      <div style={{ width: '3px', background: 'linear-gradient(180deg, #ff6b35, rgba(255,107,53,0.2))', flexShrink: 0 }} />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ color: '#1a2040', fontSize: '9px', letterSpacing: '0.3em' }}>LOADING</span>
        </div>
      ) : (
        <>
          <Stat label="CANDIDATES" value={String(count)} color="#ff6b35" glowClass={count > 0 ? 'glow-orange' : ''} borderColor="#ff6b35" />
          <Stat label="HIGH CONF" sub="≥0.90" value={String(highConf)} color={highConf > 0 ? '#00e676' : '#1a2040'} glowClass={highConf > 0 ? 'glow-green' : ''} />
          <Stat label="NEGATION" value={String(negCount)} color={negCount > 0 ? '#ff3b3b' : '#1a2040'} glowClass={negCount > 0 ? 'glow-red' : ''} />

          <div style={{ width: '1px', background: '#1a2040', margin: '10px 0' }} />

          <Stat label="TOP SCORE" value={topScore} color={topScore !== dash ? '#ff6b35' : '#1a2040'} glowClass={topScore !== dash ? 'glow-orange' : ''} />
          <Stat label="BEST SPREAD" sub="pp" value={bestSpread !== dash ? `+${bestSpread}` : dash} color={bestSpread !== dash ? '#00e676' : '#1a2040'} glowClass={bestSpread !== dash ? 'glow-green' : ''} />
          <Stat label="LAST RUN" value={lastRunStr} color="#2a3060" />
        </>
      )}
    </div>
  );
}
