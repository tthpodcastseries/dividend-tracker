import { formatCurrency } from '../utils/dividendCalc';

export default function Header({ totals, period, stockCount }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Dividend Tracker</h1>
        <p className="subtitle">
          Portfolio Dividend Income Dashboard
          {stockCount > 0 && <span className="holdings-badge">{stockCount} holdings</span>}
        </p>
      </div>
      <div className="header-right">
        {Object.entries(totals).map(([currency, amounts]) => (
          amounts.annual > 0 && (
            <div key={currency} className="header-total-pill">
              <span className="header-total-label">{currency} {period}</span>
              <span className="header-total-value">{formatCurrency(amounts[period], currency)}</span>
            </div>
          )
        ))}
      </div>
    </header>
  );
}
