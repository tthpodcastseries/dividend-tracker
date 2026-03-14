import { useState, Fragment } from 'react';
import { formatCurrency, formatPercent } from '../utils/dividendCalc';
import { getPendingPayments, getPendingPaymentDates } from '../utils/dripTracker';

export default function PortfolioTable({ stocks, period, onRemove, dripState, onToggleDrip, onApplyDrip, onManualDrip }) {
  const [dripResults, setDripResults] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [manualForm, setManualForm] = useState(null); // { ticker } when open

  // Sort alphabetically by ticker
  const sorted = [...stocks].sort((a, b) => a.ticker.localeCompare(b.ticker));

  // Count stocks with pending DRIP (uses real payment dates)
  const pendingCount = sorted.filter(s => {
    const state = dripState[s.ticker];
    if (!state?.enabled) return false;
    return getPendingPayments(s, state.lastDripDate) > 0;
  }).length;

  const handleApplyDrip = () => {
    const results = onApplyDrip();
    if (results.length > 0) {
      setDripResults(results);
      setTimeout(() => setDripResults(null), 8000);
    }
  };

  const handleManualSubmit = (e, ticker, currency) => {
    e.preventDefault();
    const form = e.target;
    const dividendAmount = parseFloat(form.dividend.value);
    const price = parseFloat(form.price.value);
    const date = form.date.value ? new Date(form.date.value).toISOString() : undefined;

    if (!dividendAmount || !price) return;

    const result = onManualDrip(ticker, dividendAmount, price, date);
    if (result) {
      setManualForm(null);
      setDripResults([{
        ticker,
        sharesPurchased: result.sharesPurchased,
        dividendAmount: result.dividendAmount,
        priceAtPurchase: result.priceAtPurchase,
      }]);
      setTimeout(() => setDripResults(null), 8000);
    }
  };

  return (
    <>
    <div className="section-heading-row">
      <h3 className="section-heading">Portfolio Holdings</h3>
      {pendingCount > 0 && (
        <button className="apply-drip-btn" onClick={handleApplyDrip}>
          Apply DRIP ({pendingCount} pending)
        </button>
      )}
    </div>

    {dripResults && dripResults.length > 0 && (
      <div className="drip-results-banner">
        <strong>DRIP Applied!</strong>
        {dripResults.map(r => (
          <span key={r.ticker} className="drip-result-item">
            {r.ticker}: +{r.sharesPurchased.toFixed(4)} shares (${r.dividendAmount.toFixed(2)} reinvested @ ${r.priceAtPurchase.toFixed(2)})
          </span>
        ))}
      </div>
    )}

    <div className="table-wrapper">
      <table className="portfolio-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Company</th>
            <th className="right">Shares</th>
            <th className="right">Price</th>
            <th className="right">Div/Share</th>
            <th className="right">Yield</th>
            <th className="right">{period.charAt(0).toUpperCase() + period.slice(1)} Income</th>
            <th className="right">Annual Income</th>
            <th>Currency</th>
            <th className="center">DRIP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(stock => {
            const state = dripState[stock.ticker] || { enabled: false, log: [] };
            const hasDividend = stock.dividendPerShare > 0 && stock.price > 0;
            const pending = hasDividend && state.enabled
              ? getPendingPayments(stock, state.lastDripDate)
              : 0;
            const pendingDates = pending > 0
              ? getPendingPaymentDates(stock, state.lastDripDate)
              : [];
            const isLogExpanded = expandedLog === stock.ticker;
            const log = state.log || [];
            const isManualOpen = manualForm?.ticker === stock.ticker;

            return (
              <Fragment key={stock.ticker}>
                <tr className={stock.loading ? 'loading-row' : ''}>
                  <td className="ticker-cell">{stock.ticker}</td>
                  <td className="name-cell">{stock.fetchedName || stock.name}</td>
                  <td className="right">{stock.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                  <td className="right">
                    {stock.price ? formatCurrency(stock.price, stock.currency) : '—'}
                  </td>
                  <td className="right">
                    {stock.loading
                      ? '...'
                      : formatCurrency(stock.dividendPerShare, stock.currency)}
                  </td>
                  <td className="right">
                    {stock.loading ? '...' : stock.dividendYield ? formatPercent(stock.dividendYield) : '—'}
                  </td>
                  <td className="right income-cell">
                    {stock.loading
                      ? '...'
                      : formatCurrency(stock.dividends?.[period] || 0, stock.currency)}
                  </td>
                  <td className="right">
                    {stock.loading
                      ? '...'
                      : formatCurrency(stock.dividends?.annual || 0, stock.currency)}
                  </td>
                  <td className="currency-badge">{stock.currency}</td>
                  <td className="center drip-toggle-cell">
                    {hasDividend ? (
                      <>
                        <button
                          className={`drip-toggle ${state.enabled ? 'drip-on' : 'drip-off'}`}
                          onClick={() => onToggleDrip(stock.ticker)}
                          title={state.enabled ? 'DRIP enabled — click to disable' : 'Enable DRIP'}
                        >
                          {state.enabled ? 'ON' : 'OFF'}
                        </button>
                        {state.enabled && pending > 0 && (
                          <span
                            className="drip-pending-dot"
                            title={`${pending} payment(s) pending: ${pendingDates.map(d => d.toLocaleDateString('en-CA')).join(', ')}`}
                          ></span>
                        )}
                        {log.length > 0 && (
                          <button
                            className="drip-log-toggle"
                            onClick={() => setExpandedLog(isLogExpanded ? null : stock.ticker)}
                            title="View DRIP history"
                          >
                            {isLogExpanded ? '▼' : '▶'} {log.length}
                          </button>
                        )}
                        <button
                          className="drip-manual-btn"
                          onClick={() => setManualForm(isManualOpen ? null : { ticker: stock.ticker })}
                          title="Add manual DRIP entry"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <span className="drip-na">—</span>
                    )}
                  </td>
                  <td>
                    <button className="remove-btn" onClick={() => onRemove(stock.ticker)} title="Remove">
                      &times;
                    </button>
                  </td>
                </tr>

                {/* Manual DRIP entry form */}
                {isManualOpen && (
                  <tr className="drip-log-row">
                    <td colSpan={11}>
                      <form
                        className="manual-drip-form"
                        onSubmit={(e) => handleManualSubmit(e, stock.ticker, stock.currency)}
                      >
                        <span className="manual-drip-label">Manual DRIP for {stock.ticker}:</span>
                        <label>
                          <span>Date</span>
                          <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </label>
                        <label>
                          <span>Dividend ({stock.currency})</span>
                          <input type="number" name="dividend" step="0.01" min="0.01" required placeholder="0.00" />
                        </label>
                        <label>
                          <span>Price ({stock.currency})</span>
                          <input type="number" name="price" step="0.01" min="0.01" required defaultValue={stock.price} />
                        </label>
                        <button type="submit" className="manual-drip-submit">Add DRIP</button>
                        <button type="button" className="manual-drip-cancel" onClick={() => setManualForm(null)}>Cancel</button>
                      </form>
                    </td>
                  </tr>
                )}

                {/* DRIP transaction log */}
                {isLogExpanded && log.length > 0 && (
                  <tr className="drip-log-row">
                    <td colSpan={11}>
                      <div className="drip-log-container">
                        <table className="drip-log-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th className="right">Dividend</th>
                              <th className="right">Price</th>
                              <th className="right">Shares Purchased</th>
                              <th className="right">Shares Before</th>
                              <th className="right">Shares After</th>
                              <th>Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...log].reverse().map((entry, i) => (
                              <tr key={i}>
                                <td>{new Date(entry.date).toLocaleDateString('en-CA')}</td>
                                <td className="right green-text">
                                  {formatCurrency(entry.dividendAmount, stock.currency)}
                                </td>
                                <td className="right">
                                  {formatCurrency(entry.priceAtPurchase, stock.currency)}
                                </td>
                                <td className="right green-text">
                                  +{entry.sharesPurchased.toFixed(4)}
                                </td>
                                <td className="right">
                                  {entry.sharesBefore.toFixed(4)}
                                </td>
                                <td className="right">
                                  {entry.sharesAfter.toFixed(4)}
                                </td>
                                <td>
                                  <span className={`drip-type-badge ${entry.manual ? 'drip-type-manual' : 'drip-type-auto'}`}>
                                    {entry.manual ? 'Manual' : 'Auto'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
