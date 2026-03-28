import type { AppConfig } from '../lib/types';

interface StatusBarProps {
  config: AppConfig | null;
  error: boolean;
}

export default function StatusBar({ config, error }: StatusBarProps) {
  const dbColor =
    config?.db_status === 'connected' ? 'text-green' :
    config?.db_status === 'disconnected' ? 'text-amber' : 'text-red';

  const dbLabel =
    config?.db_status === 'connected' ? 'CONNECTED' :
    config?.db_status === 'disconnected' ? 'DISCONNECTED' :
    error ? 'ERROR' : '--';

  return (
    <footer className="flex items-center gap-6 h-7 px-4 border-t border-border bg-bg shrink-0 text-[11px] font-mono tracking-wider">
      <span className="text-text-muted">
        MODEL: <span className="text-text-secondary">{config?.embedding_model ?? '--'}</span>
      </span>
      <span className="text-text-muted">
        THRESHOLD: <span className="text-text-secondary">{config?.similarity_threshold ?? '--'}</span>
      </span>
      <span className="text-text-muted">
        DB: <span className={dbColor}>{dbLabel}</span>
      </span>
      <span className="text-text-muted">
        MARKETS: <span className="text-text-secondary">{config?.markets?.join(' · ') ?? '--'}</span>
      </span>
    </footer>
  );
}
