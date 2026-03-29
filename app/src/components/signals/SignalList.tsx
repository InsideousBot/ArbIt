import { useState } from 'react';
import type { ArbitrageSignal } from '../../lib/types';
import SignalRow from './SignalRow';

type Filter = 'ALL' | 'HIGH EV' | 'HIGH CONF';

interface SignalListProps {
  signals: ArbitrageSignal[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const EMPTY_MESSAGES: Record<Filter, string> = {
  ALL: 'NO SIGNALS — pipeline has not run yet',
  'HIGH EV': 'NO HIGH-EV SIGNALS',
  'HIGH CONF': 'NO HIGH-CONFIDENCE SIGNALS',
};

export default function SignalList({ signals, loading, error, selectedId, onSelect }: SignalListProps) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered =
    filter === 'HIGH EV'
      ? signals.filter((s) => s.expected_profit >= 10)
      : filter === 'HIGH CONF'
      ? signals.filter((s) => s.confidence >= 0.8)
      : signals;

  const FilterBtn = ({ f }: { f: Filter }) => (
    <button
      onClick={() => setFilter(f)}
      className={`px-2 py-0.5 text-[10px] tracking-wider rounded border transition-colors ${
        filter === f
          ? 'border-orange text-orange bg-orange/10'
          : 'border-border text-text-muted hover:text-text-secondary'
      }`}
    >
      {f}
    </button>
  );

  return (
    <div className="flex flex-col h-full border-r border-border" style={{ width: '320px', minWidth: '280px' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-[10px] text-text-muted tracking-widest">RANKED BY EV ▾</span>
        <div className="flex gap-1">
          <FilterBtn f="ALL" />
          <FilterBtn f="HIGH EV" />
          <FilterBtn f="HIGH CONF" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-3 py-3 border-b border-border animate-pulse">
              <div className="h-3 bg-surface rounded w-3/4 mb-2" />
              <div className="h-2 bg-surface rounded w-1/2" />
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-red text-xs tracking-wider">
            ⚠ FETCH ERROR — {error}
            <button className="block mt-2 text-orange underline" onClick={() => window.location.reload()}>
              RETRY
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-text-muted text-xs tracking-wider">{EMPTY_MESSAGES[filter]}</div>
        ) : (
          filtered.map((signal) => (
            <SignalRow
              key={signal.pair_id}
              signal={signal}
              selected={signal.pair_id === selectedId}
              onClick={() => onSelect(signal.pair_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
