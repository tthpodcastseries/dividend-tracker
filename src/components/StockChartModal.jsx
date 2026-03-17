import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../utils/focusTrap';

// Map tickers to TradingView symbol format
function getTradingViewSymbol(ticker, currency) {
  if (ticker === 'BTC') return 'BITSTAMP:BTCUSD';
  if (ticker === 'FLT') return 'TSXV:FLT';
  if (currency === 'CAD') return `TSX:${ticker}`;
  return ticker;
}

export default function StockChartModal({ ticker, currency, name, onClose }) {
  const containerRef = useRef(null);
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const symbol = getTradingViewSymbol(ticker, currency);

    // Clear any previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'America/Toronto',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#0f172a',
      gridColor: '#1e293b',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      range: '12M',
    });

    containerRef.current.appendChild(script);
  }, [ticker, currency]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal" ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="chart-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <h3 id="chart-modal-title">{ticker} - {name}</h3>
          <button className="chart-modal-close" onClick={onClose} aria-label="Close chart">&times;</button>
        </div>
        <div className="chart-modal-body" ref={containerRef}>
          <div className="chart-loading">Loading chart...</div>
        </div>
      </div>
    </div>
  );
}
