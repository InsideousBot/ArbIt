import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Ticker from './components/Ticker';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import SignalsPage from './pages/SignalsPage';
import MarketsPage from './pages/MarketsPage';
import SimulationPage from './pages/SimulationPage';
import { api } from './lib/api';
import type { AppConfig, ArbitrageSignal, SignalsStats } from './lib/types';

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [stats, setStats] = useState<SignalsStats | null>(null);
  const [minSpread, setMinSpread] = useState(3);
  const [minConfidence, setMinConfidence] = useState(70);

  useEffect(() => {
    api.getConfig()
      .then(setConfig)
      .catch(() => {});

    // Fetch signals for ticker display
    const fetchForTicker = () => {
      api.getSignals(0, 0, 50, 'profit')
        .then(setSignals)
        .catch(() => {});
      api.getSignalsStats()
        .then(setStats)
        .catch(() => {});
    };
    fetchForTicker();
    const interval = setInterval(fetchForTicker, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#08090c',
        overflow: 'hidden',
      }}
    >
      <Ticker signals={signals} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          stats={stats}
          minSpread={minSpread}
          onMinSpread={setMinSpread}
          minConfidence={minConfidence}
          onMinConfidence={setMinConfidence}
          config={config}
        />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <TabBar
            signalCount={signals.length}
            isLive={config?.db_status === 'connected'}
          />
          <main style={{ flex: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/signals" replace />} />
              <Route
                path="/signals"
                element={
                  <SignalsPage
                    minSpread={minSpread}
                    minConfidence={minConfidence}
                  />
                }
              />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
