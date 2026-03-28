import { useEffect, useRef, useState } from 'react';
import type { CandidatePair } from '../lib/types';
import { api } from '../lib/api';
import StatsBar from '../components/signals/StatsBar';
import SignalList from '../components/signals/SignalList';
import SignalDetail from '../components/signals/SignalDetail';

export default function SignalsPage() {
  const [candidates, setCandidates] = useState<CandidatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchCandidates() {
    try {
      const data = await api.getCandidates();
      setCandidates(data);
      setError(null);
      setSelectedId((prev) => {
        if (prev && data.some((c) => c.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCandidates();
    api.getConfig().then((cfg) => setLastRun(cfg.last_run)).catch(() => {});
    intervalRef.current = setInterval(fetchCandidates, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const selectedPair = candidates.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full">
      <StatsBar candidates={candidates} lastRun={lastRun} loading={loading} />
      <div className="flex flex-1 overflow-hidden">
        <SignalList
          candidates={candidates}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <SignalDetail pair={loading ? null : selectedPair} />
      </div>
    </div>
  );
}
