/**
 * DRIP Tracker — calculates and records actual dividend reinvestment purchases
 * using real payment dates (payMonths + payDay) per stock.
 *
 * Each stock in dripState tracks:
 *   - enabled: boolean
 *   - log: array of { date, dividendAmount, sharesPurchased, priceAtPurchase, paymentDate }
 *   - lastDripDate: ISO date string — baseline from which to count new payments
 *
 * Positions are current as of 2026-03-11, so that is the default baseline.
 */

const DRIP_KEY = 'dividend_tracker_drip';
const BASELINE_DATE = '2026-03-11';

/** How many payments per year for each frequency */
const PAYMENTS_PER_YEAR = {
  monthly: 12,
  quarterly: 4,
  'semi-annual': 2,
  annual: 1,
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
 * Get all payment dates for a stock that fall between afterDate and today.
 * Uses payMonths (array of months 1-12) and payDay (day of month).
 * Returns array of Date objects in chronological order.
 */
export function getPaymentDatesSince(stock, afterDateStr) {
  const { payMonths, payDay, payFrequency } = stock;
  if (!payMonths || payMonths.length === 0 || payFrequency === 'none') return [];

  const after = new Date(afterDateStr || BASELINE_DATE);
  const now = new Date();
  const dates = [];

  // Iterate year by year from the year of afterDate to current year
  for (let year = after.getFullYear(); year <= now.getFullYear(); year++) {
    for (const month of payMonths) {
      const payDate = new Date(year, month - 1, payDay || 1);
      // Must be strictly after the baseline and not in the future
      if (payDate > after && payDate <= now) {
        dates.push(payDate);
      }
    }
  }

  return dates.sort((a, b) => a - b);
}

/**
 * Count pending payments for a stock since its lastDripDate (or baseline).
 */
export function getPendingPayments(stock, lastDripDate) {
  return getPaymentDatesSince(stock, lastDripDate || BASELINE_DATE).length;
}

/**
 * Get the pending payment dates for display purposes.
 */
export function getPendingPaymentDates(stock, lastDripDate) {
  return getPaymentDatesSince(stock, lastDripDate || BASELINE_DATE);
}

/**
 * Calculate DRIP purchase for a single stock for N payment periods.
 * Returns { dividendAmount, sharesPurchased, priceAtPurchase, periods } or null.
 */
export function calcDripPurchase(stock, periods = 1) {
  const { dividendPerShare, shares, price, payFrequency } = stock;

  if (!dividendPerShare || !price || price <= 0 || !payFrequency || payFrequency === 'none') {
    return null;
  }
  if (periods <= 0) return null;

  const paymentsPerYear = PAYMENTS_PER_YEAR[payFrequency] || 4;
  const divPerPayment = dividendPerShare / paymentsPerYear;

  // Compound: each period's DRIP shares earn dividends in subsequent periods
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
 * Calculate a manual DRIP purchase given a dividend amount and price.
 */
export function calcManualDripPurchase(dividendAmount, price) {
  if (!dividendAmount || !price || price <= 0) return null;
  return {
    sharesPurchased: dividendAmount / price,
    dividendAmount,
    priceAtPurchase: price,
  };
}
