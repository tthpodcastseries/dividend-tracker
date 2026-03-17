// payMonths: which months (1-12) dividends are paid; payDay: approximate day of month
// buyPrice: closing price on Nov 14, 2025 (all positions opened that date)
export const BUY_DATE = '2025-11-14';

export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0096, currency: 'USD', account: 'LIRA', dividendPerShare: 1.04, dividendYield: 0.0041, price: 250.12, buyPrice: 272.95, payFrequency: 'quarterly', payMonths: [2, 5, 8, 11], payDay: 15 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 207.67, buyPrice: 237.58, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'BCE', name: 'BCE Inc', shares: 202, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.75, dividendYield: 0.0488, price: 35.03, buyPrice: 32.01, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 15 },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 101, currency: 'CAD', account: 'LIRA', dividendPerShare: 4.40, dividendYield: 0.0441, price: 94.38, buyPrice: 94.42, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 27 },
  { ticker: 'BTC', name: 'Bitcoin', shares: 0.000585, currency: 'CAD', account: 'Crypto', dividendPerShare: 0, dividendYield: 0, price: 100480, buyPrice: 132471, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'BYAH', name: 'Park Ha Biological Technology', shares: 20, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 1.22, buyPrice: 13.64, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 39.55, buyPrice: 31.58, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.42, dividendYield: 0.0021, price: 194.75, buyPrice: 194.93, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 10 },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 100.8062, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.48, dividendYield: 0.0496, price: 9.90, buyPrice: 9.52, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 25 },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3000, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.82, buyPrice: 0.54, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0.92, dividendYield: 0.0248, price: 36.35, buyPrice: 40.12, payFrequency: 'semi-annual', payMonths: [6, 12], payDay: 20 },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.94, dividendYield: 0.0391, price: 45.90, buyPrice: 48.30, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 19 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 0.2157, currency: 'USD', account: 'LIRA', dividendPerShare: 7.28, dividendYield: 0.0109, price: 662.29, buyPrice: 672.04, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 28 },
  { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend ETF', shares: 3.149, currency: 'USD', account: 'LIRA', dividendPerShare: 1.96, dividendYield: 0.0424, price: 45.80, buyPrice: 42.97, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 22 },
  { ticker: 'SPYI', name: 'Neos S&P 500 High Income ETF', shares: 6.2482, currency: 'USD', account: 'LIRA', dividendPerShare: 6.26, dividendYield: 0.1217, price: 50.53, buyPrice: 52.29, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 7 },
  { ticker: 'WEN', name: "Wendy's Co (Class A)", shares: 100, currency: 'USD', account: 'LIRA', dividendPerShare: 0.56, dividendYield: 0.0778, price: 7.17, buyPrice: 8.62, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 17 },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 100.5654, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.96, dividendYield: 0.0337, price: 27.94, buyPrice: 28.49, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 5 },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 252, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.70, dividendYield: 0.0288, price: 25.35, buyPrice: 19.14, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 31 },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 20.894, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.26, dividendYield: 0.0584, price: 21.38, buyPrice: 20.22, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 8 },
];

// Canadian tickers that need .TO suffix for Alpha Vantage
const canadianTickers = new Set([
  'BCE', 'BNS', 'CGL', 'DOL', 'FIE', 'MFC', 'XBB', 'XEG', 'ZWC'
]);

// TSX Venture Exchange tickers (use .V suffix instead of .TO)
const ventureTickers = new Set(['FLT']);

// Tickers that don't pay dividends
export const nonDividendTickers = new Set(['BTC', 'CGL', 'AMZN', 'BYAH', 'FLT']);

export function getApiTicker(ticker, currency) {
  if (ticker === 'BTC') return null; // No API lookup for crypto
  if (ventureTickers.has(ticker)) return `${ticker}.V`;
  if (canadianTickers.has(ticker) || (currency === 'CAD' && !['FXI', 'SPY', 'SPYD', 'SPYI'].includes(ticker))) {
    return `${ticker}.TO`;
  }
  return ticker;
}
