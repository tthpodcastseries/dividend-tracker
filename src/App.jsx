import { useState, useEffect } from 'react';
import { usePortfolio } from './hooks/usePortfolio';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import AddStock from './components/AddStock';
import TimeToggle from './components/TimeToggle';
import DividendSummary from './components/DividendSummary';
import PortfolioTable from './components/PortfolioTable';
import DividendChart from './components/DividendChart';
import DripProjection from './components/DripProjection';
import { clearDividendCache } from './utils/api';
import './App.css';

export default function App() {
  const {
    stocks,
    apiKey,
    setApiKey,
    fetching,
    fetchAllDividends,
    addStock,
    removeStock,
    totals,
    dripState,
    toggleDrip,
    applyDrip,
  } = usePortfolio();

  const [period, setPeriod] = useState('monthly');
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    if (apiKey && stocks.some(s => s.loading)) {
      fetchAllDividends();
    }
  }, [apiKey]);

  const handleSaveKey = (key) => {
    setApiKey(key);
    setShowApiModal(false);
  };

  const handleRefresh = () => {
    clearDividendCache();
    localStorage.removeItem('dividend_tracker_portfolio');
    window.location.reload();
  };

  return (
    <div className="app">
      {showApiModal && <ApiKeyInput onSave={handleSaveKey} />}

      <Header totals={totals} period={period} stockCount={stocks.length} />

      <div className="toolbar">
        <TimeToggle period={period} onChange={setPeriod} />
        <div className="toolbar-right">
          <AddStock onAdd={addStock} />
          <button className="refresh-btn" onClick={handleRefresh} title="Clear cache & refresh">
            Refresh Data
          </button>
          <button className="key-btn" onClick={() => setShowApiModal(true)} title="Change API key">
            API Key
          </button>
        </div>
      </div>

      {fetching && <div className="fetching-bar">Fetching dividend data...</div>}

      <DividendSummary totals={totals} activePeriod={period} />
      <DividendChart stocks={stocks} period={period} />
      <PortfolioTable
        stocks={stocks}
        period={period}
        onRemove={removeStock}
        dripState={dripState}
        onToggleDrip={toggleDrip}
        onApplyDrip={applyDrip}
      />
      <DripProjection stocks={stocks} />
    </div>
  );
}
