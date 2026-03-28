import type { PipelineStep } from '../../lib/types';

interface StepCardProps {
  step: PipelineStep;
}

const STATUS_CONFIG = {
  done: { border: 'border-green', icon: '✓', iconColor: 'text-green', labelColor: 'text-green', bgTint: 'bg-[#001a00]' },
  active: { border: 'border-orange', icon: '●', iconColor: 'text-orange', labelColor: 'text-orange', bgTint: 'bg-[#1a0800]' },
  pending: { border: 'border-border', icon: '○', iconColor: 'text-text-muted', labelColor: 'text-text-muted', bgTint: '' },
  error: { border: 'border-red', icon: '✗', iconColor: 'text-red', labelColor: 'text-red', bgTint: 'bg-[#100808]' },
} as const;

export default function StepCard({ step }: StepCardProps) {
  const cfg = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.pending;
  const elapsedStr = step.elapsed_ms != null ? `${(step.elapsed_ms / 1000).toFixed(1)}s` : '--';

  return (
    <div className={`flex flex-col items-center justify-center border ${cfg.border} ${cfg.bgTint} p-3 rounded-sm flex-1`} style={{ minWidth: '90px' }}>
      <span className={`text-lg ${cfg.iconColor} ${step.status === 'active' ? 'animate-pulse' : ''}`}>
        {cfg.icon}
      </span>
      <span className="text-[9px] text-text-muted tracking-widest mt-1">
        {String(step.number).padStart(2, '0')}
      </span>
      <span className={`text-[10px] font-bold tracking-wider mt-1 text-center ${cfg.labelColor}`}>
        {step.short_label}
      </span>
      <span className={`text-[9px] tracking-widest mt-1 ${cfg.labelColor}`}>
        {step.status.toUpperCase()}
      </span>
      <span className="text-[9px] text-text-muted mt-1 text-center truncate max-w-full px-1">
        {step.status === 'error' && step.message ? step.message.slice(0, 20) : elapsedStr}
      </span>
    </div>
  );
}
