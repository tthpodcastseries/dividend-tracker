import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from './hooks/usePortfolio';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import AddStock from './components/AddStock';
import TimeToggle from './components/TimeToggle';
import DividendSummary from './components/DividendSummary';
import PortfolioTable from './components/PortfolioTable';
import DividendChart from './components/DividendChart';
import DripProjection from './components/DripProjection';
import StockChartModal from './components/StockChartModal';
import { clearDividendCache } from './utils/api';
import { clearQuoteCache } from './utils/quotes';
import './App.css';

export default function App() {
  const {
    stocks,
    apiKey,
    setApiKey,
    fetching,
    fetchAllDividends,
    fetchAllQuotes,
    quotesUpdatedAt,
    recurringBuyLog,
    recurringBuyResults,
    clearRecurringBuyResults,
    addStock,
    removeStock,
    totals,
    dripState,
    toggleDrip,
    applyDrip,
    applyManualDrip,
    sellShares,
    salesLog,
  } = usePortfolio();

  const [period, setPeriod] = useState('monthly');
  const [showApiModal, setShowApiModal] = useState(false);
  const [chartTicker, setChartTicker] = useState(null);

  const handleTickerClick = (ticker) => {
    setChartTicker(ticker);
  };

  const handleCloseChart = useCallback(() => setChartTicker(null), []);
  const handleCloseApiModal = useCallback(() => setShowApiModal(false), []);
  const chartStock = chartTicker ? stocks.find(s => s.ticker === chartTicker) : null;

  // Auto-fetch on launch when API key is available
  useEffect(() => {
    if (apiKey) {
      fetchAllDividends();
    }
  }, [apiKey]);

  const handleSaveKey = (key) => {
    setApiKey(key);
    setShowApiModal(false);
  };

  const handleRefresh = () => {
    clearDividendCache();
    clearQuoteCache();
    fetchAllQuotes(true);
    if (apiKey) fetchAllDividends();
  };

  return (
    <div className="app">
      {showApiModal && <ApiKeyInput onSave={handleSaveKey} onClose={handleCloseApiModal} />}
      {chartStock && (
        <StockChartModal
          ticker={chartStock.ticker}
          currency={chartStock.currency}
          name={chartStock.fetchedName || chartStock.name}
          onClose={handleCloseChart}
        />
      )}

      <Header totals={totals} period={period} stockCount={stocks.length} />

      <main>
      <nav className="toolbar" aria-label="Portfolio controls">
        <TimeToggle period={period} onChange={setPeriod} />
        <div className="toolbar-right">
          {quotesUpdatedAt && (
            <span className="quote-status" role="status">
              Prices as of {new Date(quotesUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <AddStock onAdd={addStock} />
          <button className="refresh-btn" onClick={handleRefresh} title="Fetch latest prices & dividend data">
            Refresh Data
          </button>
          <button className="key-btn" onClick={() => setShowApiModal(true)} title="Change API key">
            API Key
          </button>
        </div>
      </nav>

      {fetching && <div className="fetching-bar" role="status" aria-live="polite">Fetching dividend data...</div>}

      {recurringBuyResults && (
        <div className="drip-results-banner" role="status">
          <strong>Weekly buys applied</strong>
          {recurringBuyResults.map((p, i) => (
            <span key={i} className="sell-result-item">
              {p.date}: {p.ticker} +{p.shares.toFixed(4)} @ {new Intl.NumberFormat('en-CA', { style: 'currency', currency: p.currency }).format(p.price)}
            </span>
          ))}
          <button className="banner-dismiss" onClick={clearRecurringBuyResults} aria-label="Dismiss">&times;</button>
        </div>
      )}

      <DividendSummary totals={totals} activePeriod={period} />
      <DividendChart stocks={stocks} period={period} onTickerClick={handleTickerClick} />
      <PortfolioTable
        stocks={stocks}
        period={period}
        onRemove={removeStock}
        dripState={dripState}
        onToggleDrip={toggleDrip}
        onApplyDrip={applyDrip}
        onManualDrip={applyManualDrip}
        onSell={sellShares}
        salesLog={salesLog}
        recurringBuyLog={recurringBuyLog}
        onTickerClick={handleTickerClick}
      />
      <DripProjection stocks={stocks} />
      </main>
    </div>
  );
}
