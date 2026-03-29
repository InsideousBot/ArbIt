import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Ticker from './components/Ticker';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import SignalsPage from './pages/SignalsPage';
import MarketsPage from './pages/MarketsPage';
import ExecutionLogPage from './pages/ExecutionLogPage';
import SimulationPage from './pages/SimulationPage';
import { api } from './lib/api';
import type { AppConfig, ArbitrageSignal, SignalsStats, ExecutedTrade } from './lib/types';

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [stats, setStats] = useState<SignalsStats | null>(null);
  const [minSpread, setMinSpread] = useState(3);
  const [minConfidence, setMinConfidence] = useState(70);

  // Simulation-derived sidebar stats (year-in-review numbers)
  const [simTotalPnl, setSimTotalPnl] = useState(0);
  const [simSuccessRate, setSimSuccessRate] = useState(0);

  // Executed trades log
  const [executedTrades, setExecutedTrades] = useState<ExecutedTrade[]>([]);

  const addExecutedTrade = useCallback((trade: ExecutedTrade) => {
    setExecutedTrades((prev) => [...prev, trade]);
  }, []);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});

    // Ticker signals (refresh every 30s)
    const fetchTicker = () => {
      api.getSignals(0, 0, 50, 'profit').then(setSignals).catch(() => {});
      api.getSignalsStats().then(setStats).catch(() => {});
    };
    fetchTicker();
    const tickerInterval = setInterval(fetchTicker, 30_000);

    // Simulation stats for sidebar — fetch once on mount
    Promise.all([api.getSimulationTrades(), api.getSimulationPnlCurve()])
      .then(([trades, curve]) => {
        const wins = trades.filter((t) => t.outcome === 'WIN').length;
        setSimSuccessRate(trades.length > 0 ? (wins / trades.length) * 100 : 0);
        const last = curve[curve.length - 1];
        setSimTotalPnl(last?.cumulative_pnl ?? 0);
      })
      .catch(() => {});

    return () => clearInterval(tickerInterval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#08090c', overflow: 'hidden' }}>
      <Ticker signals={signals} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          stats={stats}
          totalPnl={simTotalPnl}
          successRate={simSuccessRate}
          minSpread={minSpread}
          onMinSpread={setMinSpread}
          minConfidence={minConfidence}
          onMinConfidence={setMinConfidence}
          config={config}
        />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <TabBar
            signalCount={signals.length}
            executionCount={executedTrades.length}
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
                    onExecute={addExecutedTrade}
                  />
                }
              />
              <Route path="/markets" element={<MarketsPage />} />
              <Route
                path="/execution"
                element={<ExecutionLogPage trades={executedTrades} />}
              />
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
