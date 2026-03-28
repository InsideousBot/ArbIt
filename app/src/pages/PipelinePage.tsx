import { useEffect, useRef, useState } from 'react';
import type { PipelineStatus } from '../lib/types';
import { api } from '../lib/api';
import PipelineGrid from '../components/pipeline/PipelineGrid';
import PipelineLog from '../components/pipeline/PipelineLog';

export default function PipelinePage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchStatus() {
    try {
      const data = await api.getPipelineStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <span className="text-[10px] text-text-muted tracking-[3px]">PIPELINE STATUS</span>
        <div className="flex items-center gap-6">
          {status?.last_run && (
            <span className="text-[10px] text-text-secondary tracking-wider">
              LAST RUN: {new Date(status.last_run).toLocaleTimeString('en-US', { hour12: false })}
            </span>
          )}
          {status?.total_runtime_ms ? (
            <span className="text-[10px] text-text-muted tracking-wider">
              TOTAL: {(status.total_runtime_ms / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="p-5 text-red text-xs tracking-wider">
          ⚠ CANNOT REACH PIPELINE STATUS ENDPOINT — {error}
        </div>
      ) : (
        <>
          <PipelineGrid status={status} loading={loading} />
          <PipelineLog logs={status?.logs ?? []} />
        </>
      )}
    </div>
  );
}
