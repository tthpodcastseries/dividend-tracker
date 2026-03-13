/**
 * DRIP (Dividend Reinvestment Plan) projection calculator.
 *
 * For each stock that pays dividends, simulate monthly reinvestment:
 *   1. Each month, compute dividend income = (annualDivPerShare / 12) × shares
 *   2. Buy fractional shares = dividendIncome / currentPrice
 *   3. Add new shares to total → next month earns more dividends
 *
 * Returns a year-by-year projection array.
 */

/**
 * Project DRIP growth for a single stock over N years.
 * @param {number} shares      – starting share count
 * @param {number} divPerShare – annual dividend per share (current)
 * @param {number} price       – current share price
 * @param {number} years       – projection horizon
 * @param {number} divGrowth   – annual dividend growth rate (e.g. 0.03 = 3%)
 * @returns {{ year, shares, annualDividend, newSharesThisYear, totalValue }[]}
 */
export function projectDripStock(shares, divPerShare, price, years = 10, divGrowth = 0) {
  if (!divPerShare || !price || price <= 0) return [];

  const results = [];
  let currentShares = shares;
  let currentDiv = divPerShare;

  for (let y = 1; y <= years; y++) {
    let newSharesThisYear = 0;

    // Simulate month-by-month reinvestment
    for (let m = 0; m < 12; m++) {
      const monthlyDiv = (currentDiv * currentShares) / 12;
      const fractionalShares = monthlyDiv / price;
      currentShares += fractionalShares;
      newSharesThisYear += fractionalShares;
    }

    const annualDividend = currentDiv * currentShares;

    results.push({
      year: y,
      shares: currentShares,
      divPerShare: currentDiv,
      annualDividend,
      monthlyDividend: annualDividend / 12,
      newSharesThisYear,
      totalValue: currentShares * price,
    });

    // Apply dividend growth for next year
    currentDiv *= (1 + divGrowth);
  }

  return results;
}

/**
 * Project DRIP growth for the entire portfolio.
 * Returns year-by-year totals grouped by currency,
 * plus per-stock detail.
 */
export function projectDripPortfolio(stocks, years = 10, divGrowth = 0) {
  const perStock = {};
  const yearlyTotals = {}; // { year: { USD: { dividend, value }, CAD: { ... } } }

  for (const stock of stocks) {
    const dps = stock.dividendPerShare || 0;
    const price = stock.price || 0;
    if (!dps || !price) continue;

    const projection = projectDripStock(stock.shares, dps, price, years, divGrowth);
    perStock[stock.ticker] = {
      ...stock,
      projection,
    };

    for (const row of projection) {
      if (!yearlyTotals[row.year]) yearlyTotals[row.year] = {};
      const cur = stock.currency || 'USD';
      if (!yearlyTotals[row.year][cur]) {
        yearlyTotals[row.year][cur] = { annualDividend: 0, monthlyDividend: 0, totalValue: 0 };
      }
      yearlyTotals[row.year][cur].annualDividend += row.annualDividend;
      yearlyTotals[row.year][cur].monthlyDividend += row.monthlyDividend;
      yearlyTotals[row.year][cur].totalValue += row.totalValue;
    }
  }

  // Also compute "no DRIP" baseline for comparison
  const noDripTotals = {};
  for (let y = 1; y <= years; y++) {
    noDripTotals[y] = {};
    for (const stock of stocks) {
      const dps = stock.dividendPerShare || 0;
      const price = stock.price || 0;
      if (!dps || !price) continue;
      const cur = stock.currency || 'USD';
      if (!noDripTotals[y][cur]) {
        noDripTotals[y][cur] = { annualDividend: 0, totalValue: 0 };
      }
      const currentDiv = dps * Math.pow(1 + divGrowth, y - 1);
      noDripTotals[y][cur].annualDividend += currentDiv * stock.shares;
      noDripTotals[y][cur].totalValue += stock.shares * price;
    }
  }

  return { perStock, yearlyTotals, noDripTotals };
}
