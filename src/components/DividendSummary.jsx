import { formatCurrency, getPeriodLabel, PERIODS } from '../utils/dividendCalc';

// Approximate USD → CAD exchange rate (update as needed)
const USD_TO_CAD = 1.44;

export default function DividendSummary({ totals, activePeriod }) {
  const currencies = Object.keys(totals);

  return (
    <div className="summary-grid">
      {PERIODS.map(period => {
        // Calculate combined total in CAD
        const cadAmount = totals['CAD']?.[period] || 0;
        const usdAmount = totals['USD']?.[period] || 0;
        const totalCad = cadAmount + (usdAmount * USD_TO_CAD);
        const isActive = period === activePeriod;

        return (
          <div key={period} className={`summary-card${isActive ? ' summary-card-active' : ''}`}>
            <h2>{getPeriodLabel(period)}</h2>
            {currencies.map(cur => (
              <div key={cur} className="summary-amount">
                <span className="currency-tag">{cur}</span>
                <span className="amount">{formatCurrency(totals[cur]?.[period] || 0, cur)}</span>
              </div>
            ))}
            <div className="summary-total" title={`Approx. total at ${USD_TO_CAD} USD/CAD`}>
              <span className="currency-tag total-tag">TOTAL</span>
              <span className="amount total-amount">{formatCurrency(totalCad, 'CAD')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
