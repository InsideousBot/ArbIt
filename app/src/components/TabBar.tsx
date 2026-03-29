import { NavLink } from 'react-router-dom';

interface TabBarProps {
  signalCount: number;
  isLive: boolean;
}

export default function TabBar({ signalCount, isLive }: TabBarProps) {
  const tabs = [
    { label: 'Opportunity Feed', to: '/signals', count: signalCount },
    { label: 'Matches Explorer', to: '/markets', count: null },
    { label: 'Simulation', to: '/simulation', count: null },
  ];

  return (
    <header
      className="flex items-stretch shrink-0"
      style={{ height: '44px', borderBottom: '1px solid #1a1d2e', background: '#09090d' }}
    >
      {/* Tabs */}
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 18px',
            borderRight: '1px solid #1a1d2e',
            borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
            background: isActive ? 'rgba(79,70,229,0.07)' : 'transparent',
            color: isActive ? '#e2e8f0' : '#4a5568',
            fontSize: '11px',
            letterSpacing: '0.05em',
            fontFamily: 'IBM Plex Mono, monospace',
            fontWeight: isActive ? '500' : '400',
            textDecoration: 'none',
            transition: 'color 0.15s, background 0.15s',
            cursor: 'pointer',
            position: 'relative',
            whiteSpace: 'nowrap',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.4), transparent)',
                  }}
                />
              )}
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: isActive ? '#4f46e5' : '#374151',
                    background: isActive ? 'rgba(79,70,229,0.15)' : '#1a1d2e',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* Right cluster */}
      <div
        className="ml-auto flex items-center gap-4 px-5"
        style={{ borderLeft: '1px solid #1a1d2e' }}
      >
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span
            style={{
              fontSize: '9px',
              color: isLive ? '#22c55e' : '#4a5568',
              letterSpacing: '0.2em',
            }}
          >
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}
