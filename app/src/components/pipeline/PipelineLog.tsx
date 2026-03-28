interface PipelineLogProps {
  logs: string[];
}

export default function PipelineLog({ logs }: PipelineLogProps) {
  return (
    <div className="mx-5 mb-5 border border-border bg-[#040608] flex flex-col" style={{ height: '200px' }}>
      <div className="px-3 py-1 border-b border-border shrink-0">
        <span className="text-[9px] text-green tracking-widest">PIPELINE LOG</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        {logs.length === 0 ? (
          <span className="text-[10px] text-text-muted">PIPELINE HAS NOT RUN</span>
        ) : (
          logs.map((line, i) => (
            <span key={i} className="text-[10px] text-green leading-relaxed font-mono">{line}</span>
          ))
        )}
      </div>
    </div>
  );
}
