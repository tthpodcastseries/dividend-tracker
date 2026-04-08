// payMonths: which months (1-12) dividends are paid; payDay: approximate day of month
// buyPrice: opening price on Nov 14, 2025 (all positions opened that date)
// Source: Yahoo Finance historical chart API, fetched 2026-04-08
export const BUY_DATE = '2025-11-14';

export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0096, currency: 'USD', account: 'LIRA', dividendPerShare: 1.04, dividendYield: 0.0041, price: 257.84, buyPrice: 271.05, payFrequency: 'quarterly', payMonths: [2, 5, 8, 11], payDay: 15 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 221.09, buyPrice: 235.06, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'BCE', name: 'BCE Inc', shares: 202, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.75, dividendYield: 0.0488, price: 33.38, buyPrice: 32.29, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 15 },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 101, currency: 'CAD', account: 'LIRA', dividendPerShare: 4.40, dividendYield: 0.0441, price: 97.94, buyPrice: 93.85, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 27 },
  { ticker: 'BYAH', name: 'Park Ha Biological Technology', shares: 20, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 1.05, buyPrice: 13.05, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 36.34, buyPrice: 31.41, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.42, dividendYield: 0.0021, price: 177.48, buyPrice: 194.61, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 10 },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 101.2182, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.48, dividendYield: 0.0496, price: 9.97, buyPrice: 9.78, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 25 },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3000, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.71, buyPrice: 0.52, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 101.0422, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.94, dividendYield: 0.0391, price: 50.27, buyPrice: 48.54, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 19 },
  { ticker: 'SPYI', name: 'Neos S&P 500 High Income ETF', shares: 14.8778, currency: 'USD', account: 'LIRA', dividendPerShare: 6.26, dividendYield: 0.1217, price: 50.74, buyPrice: 51.84, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 7 },
  { ticker: 'WEN', name: "Wendy's Co (Class A)", shares: 101.9563, currency: 'USD', account: 'LIRA', dividendPerShare: 0.56, dividendYield: 0.0778, price: 6.97, buyPrice: 8.70, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 17 },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 100.8534, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.96, dividendYield: 0.0337, price: 28.06, buyPrice: 28.56, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 5 },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 253.606, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.70, dividendYield: 0.0288, price: 25.82, buyPrice: 19.14, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 31 },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 34.9449, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.26, dividendYield: 0.0584, price: 21.79, buyPrice: 20.09, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 8 },
];

// Canadian tickers that need .TO suffix for Alpha Vantage
const canadianTickers = new Set([
  'BCE', 'BNS', 'CGL', 'DOL', 'FIE', 'MFC', 'XBB', 'XEG', 'ZWC'
]);

// TSX Venture Exchange tickers (use .V suffix instead of .TO)
const ventureTickers = new Set(['FLT']);

// Tickers that don't pay dividends
export const nonDividendTickers = new Set(['CGL', 'AMZN', 'BYAH', 'FLT']);

export function getApiTicker(ticker, currency) {
  if (ventureTickers.has(ticker)) return `${ticker}.V`;
  if (canadianTickers.has(ticker) || (currency === 'CAD' && !['SPYI'].includes(ticker))) {
    return `${ticker}.TO`;
  }
  return ticker;
}
