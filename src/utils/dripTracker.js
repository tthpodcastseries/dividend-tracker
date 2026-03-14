/**
 * DRIP Tracker — calculates and records actual dividend reinvestment purchases.
 *
 * Each stock tracks:
 *   - dripEnabled: boolean
 *   - dripLog: array of { date, dividendAmount, sharesPurchased, priceAtPurchase }
 *   - lastDripDate: ISO date string of last applied DRIP
 *
 * Payment frequencies determine how many payments have occurred since lastDripDate.
 */

const DRIP_KEY = 'dividend_tracker_drip';

/** How many payments per year for each frequency */
const PAYMENTS_PER_YEAR = {
  monthly: 12,
  quarterly: 4,
  'semi-annual': 2,
  annual: 1,
  none: 0,
};

/** Months between payments */
const MONTHS_BETWEEN = {
  monthly: 1,
  quarterly: 3,
  'semi-annual': 6,
  annual: 12,
  none: 0,
};

/**
 * Load DRIP state from localStorage.
 * Returns { [ticker]: { enabled, log, lastDripDate } }
 */
export function loadDripState() {
  try {
    const raw = localStorage.getItem(DRIP_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export function saveDripState(state) {
  localStorage.setItem(DRIP_KEY, JSON.stringify(state));
}

/**
 * Calculate the number of dividend payments that have occurred since lastDripDate.
 * If no lastDripDate, returns 1 (first-time application = 1 period).
 */
export function getPendingPayments(payFrequency, lastDripDate) {
  if (!payFrequency || payFrequency === 'none') return 0;

  const monthsBetween = MONTHS_BETWEEN[payFrequency] || 3;

  if (!lastDripDate) return 1; // First time — apply one period

  const last = new Date(lastDripDate);
  const now = new Date();

  // Count how many full payment periods have passed
  const monthsElapsed =
    (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());

  return Math.floor(monthsElapsed / monthsBetween);
}

/**
 * Calculate DRIP purchase for a single stock for N payment periods.
 * Returns { dividendAmount, sharesPurchased, priceAtPurchase } or null if nothing to apply.
 */
export function calcDripPurchase(stock, periods = 1) {
  const { dividendPerShare, shares, price, payFrequency } = stock;

  if (!dividendPerShare || !price || price <= 0 || !payFrequency || payFrequency === 'none') {
    return null;
  }
  if (periods <= 0) return null;

  const paymentsPerYear = PAYMENTS_PER_YEAR[payFrequency] || 4;
  // Dividend per payment = annualDiv / paymentsPerYear
  const divPerPayment = dividendPerShare / paymentsPerYear;

  // Total dividend for all pending periods (compounding: each period adds shares)
  let currentShares = shares;
  let totalDividend = 0;
  let totalNewShares = 0;

  for (let i = 0; i < periods; i++) {
    const dividend = divPerPayment * currentShares;
    const newShares = dividend / price;
    totalDividend += dividend;
    totalNewShares += newShares;
    currentShares += newShares;
  }

  return {
    dividendAmount: totalDividend,
    sharesPurchased: totalNewShares,
    priceAtPurchase: price,
    periods,
  };
}

/**
 * Get a summary of pending DRIP for all enabled stocks.
 */
export function getPendingDripSummary(stocks, dripState) {
  const pending = [];

  for (const stock of stocks) {
    const state = dripState[stock.ticker];
    if (!state?.enabled) continue;

    const periods = getPendingPayments(stock.payFrequency, state.lastDripDate);
    if (periods <= 0) continue;

    const purchase = calcDripPurchase(stock, periods);
    if (!purchase) continue;

    pending.push({
      ticker: stock.ticker,
      currency: stock.currency,
      ...purchase,
    });
  }

  return pending;
}
