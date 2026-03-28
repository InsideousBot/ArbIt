import { useState } from 'react';
import type { CandidatePair } from '../../lib/types';
import SignalRow from './SignalRow';

type Filter = 'ALL' | '≥.90' | 'NEG';

interface SignalListProps {
  candidates: CandidatePair[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const EMPTY: Record<Filter, string> = {
  ALL: 'NO SIGNALS',
  '≥.90': 'NO HIGH-CONF SIGNALS',
  NEG: 'NO NEGATIONS',
};

export default function SignalList({ candidates, loading, error, selectedId, onSelect }: SignalListProps) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered =
    filter === '≥.90' ? candidates.filter(c => c.similarity_score >= 0.9) :
    filter === 'NEG'  ? candidates.filter(c => c.has_potential_negation) :
    candidates;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '300px',
      minWidth: '260px',
      borderRight: '1px solid #0f1428',
      background: '#060810',
      height: '100%',
    }}>
      {/* List header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        height: '32px',
        borderBottom: '1px solid #0a0d1a',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '8px', color: '#2a3060', letterSpacing: '0.25em' }}>
          RANKED BY SIM ▾
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['ALL', '≥.90', 'NEG'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '2px 8px',
                fontSize: '8px',
                letterSpacing: '0.1em',
                fontFamily: 'IBM Plex Mono, monospace',
                background: filter === f ? 'rgba(255,107,53,0.15)' : 'transparent',
                border: `1px solid ${filter === f ? '#ff6b35' : '#1a2040'}`,
                color: filter === f ? '#ff6b35' : '#2a3060',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 14px', borderBottom: '1px solid #0a0d1a' }}>
              <div style={{ height: '18px', background: '#0d1117', borderRadius: '2px', marginBottom: '6px', width: '60%', opacity: 0.5 + i * 0.1 }} />
              <div style={{ height: '10px', background: '#0a0e18', borderRadius: '2px', width: '85%' }} />
            </div>
          ))
        ) : error ? (
          <div style={{ padding: '20px 14px' }}>
            <div style={{ fontSize: '9px', color: '#ff3b3b', letterSpacing: '0.15em', marginBottom: '8px' }}>⚠ FETCH ERROR</div>
            <div style={{ fontSize: '9px', color: '#2a3060' }}>{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '20px 14px' }}>
            <div style={{ fontSize: '9px', color: '#1a2040', letterSpacing: '0.2em' }}>{EMPTY[filter]}</div>
            <div style={{ marginTop: '8px', fontSize: '8px', color: '#0f1428', letterSpacing: '0.1em' }}>
              {filter === 'ALL' ? 'pipeline has not run yet' : 'adjust filter'}
            </div>
          </div>
        ) : (
          filtered.map((pair, i) => (
            <SignalRow
              key={pair.id}
              pair={pair}
              selected={pair.id === selectedId}
              onClick={() => onSelect(pair.id)}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}
