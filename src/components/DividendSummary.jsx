import { formatCurrency, getPeriodLabel, PERIODS } from '../utils/dividendCalc';

export default function DividendSummary({ totals }) {
  const currencies = Object.keys(totals);

  return (
    <div className="summary-grid">
      {PERIODS.map(period => (
        <div key={period} className="summary-card">
          <h3>{getPeriodLabel(period)}</h3>
          {currencies.map(cur => (
            <div key={cur} className="summary-amount">
              <span className="currency-tag">{cur}</span>
              <span className="amount">{formatCurrency(totals[cur]?.[period] || 0, cur)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
