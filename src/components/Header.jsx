import { formatCurrency } from '../utils/dividendCalc';

export default function Header({ totals, period }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Dividend Tracker</h1>
        <p className="subtitle">Portfolio Dividend Income Dashboard</p>
      </div>
      <div className="header-right">
        {Object.entries(totals).map(([currency, amounts]) => (
          amounts.annual > 0 && (
            <div key={currency} className="header-total">
              <span className="header-total-label">{currency} {period}</span>
              <span className="header-total-value">{formatCurrency(amounts[period], currency)}</span>
            </div>
          )
        ))}
      </div>
    </header>
  );
}
