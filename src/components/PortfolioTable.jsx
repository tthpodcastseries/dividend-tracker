import { formatCurrency, formatPercent } from '../utils/dividendCalc';

export default function PortfolioTable({ stocks, period, onRemove }) {
  // Sort alphabetically by ticker
  const sorted = [...stocks].sort((a, b) => a.ticker.localeCompare(b.ticker));

  return (
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(stock => (
            <tr key={stock.ticker} className={stock.loading ? 'loading-row' : ''}>
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
              <td>
                <button className="remove-btn" onClick={() => onRemove(stock.ticker)} title="Remove">
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
