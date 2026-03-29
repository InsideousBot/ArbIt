interface PipelineLogProps {
  logs: string[];
}

export default function PipelineLog({ logs }: PipelineLogProps) {
  if (logs.length === 0) return null;

  return (
    <div className="mx-5 mb-5 border border-border bg-surface p-4">
      <span className="text-[9px] text-text-muted tracking-widest block mb-2">LOGS</span>
      <div className="flex flex-col gap-1">
        {logs.map((line, i) => (
          <span key={i} className="text-[10px] text-text-secondary font-mono">{line}</span>
        ))}
      </div>
    </div>
  );
}
