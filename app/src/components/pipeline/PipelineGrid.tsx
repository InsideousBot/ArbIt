import type { PipelineStatus } from '../../lib/types';
import StepCard from './StepCard';

interface PipelineGridProps {
  status: PipelineStatus | null;
  loading: boolean;
}

export default function PipelineGrid({ status, loading }: PipelineGridProps) {
  if (loading) {
    return (
      <div className="flex gap-2 p-5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 border border-border rounded-sm h-28 animate-pulse bg-surface" />
        ))}
      </div>
    );
  }

  if (!status || status.steps.length === 0) {
    return <div className="p-5 text-text-muted text-xs tracking-widest">PIPELINE HAS NOT RUN</div>;
  }

  return (
    <div className="flex items-center gap-1 p-5">
      {status.steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-1 flex-1">
          <StepCard step={step} />
          {i < status.steps.length - 1 && (
            <span className="text-text-muted text-xs shrink-0">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
