import { NavLink } from 'react-router-dom';

interface TabBarProps {
  candidateCount: number;
  isLive: boolean;
}

export default function TabBar({ candidateCount, isLive }: TabBarProps) {
  const tabs = [
    { label: 'SIGNALS', to: '/signals' },
    { label: 'SIMULATION', to: '/simulation' },
    { label: 'MARKETS', to: '/markets' },
    { label: 'PIPELINE', to: '/pipeline' },
  ];

  return (
    <header className="flex items-stretch h-12 border-b border-border bg-bg shrink-0">
      <div className="flex items-center px-4 border-r border-border">
        <span className="text-orange font-bold tracking-[4px] text-sm">ARBX</span>
      </div>

      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex items-center px-4 border-r border-border text-xs tracking-widest transition-colors ` +
            (isActive
              ? 'text-white border-b-2 border-b-orange bg-surface'
              : 'text-text-muted hover:text-text-secondary')
          }
        >
          {tab.label}
        </NavLink>
      ))}

      <div className="ml-auto flex items-center gap-3 px-4">
        <span className={`text-xs ${isLive ? 'text-green animate-pulse' : 'text-text-muted'}`}>
          ● LIVE
        </span>
        {candidateCount > 0 && (
          <span className="text-xs text-orange tracking-widest">{candidateCount} CANDIDATES</span>
        )}
      </div>
    </header>
  );
}
