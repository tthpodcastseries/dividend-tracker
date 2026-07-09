// payMonths: which months (1-12) dividends are paid; payDay: approximate day of month
// buyPrice: average cost per share derived from brokerage total-return figures
// price: market price at last sync (July 8, 2026)
export const BUY_DATE = '2026-07-08';

export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0184, currency: 'USD', account: 'LIRA', dividendPerShare: 1.04, dividendYield: 0.0033, price: 313.21, buyPrice: 259.01, payFrequency: 'quarterly', payMonths: [2, 5, 8, 11], payDay: 15 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 242.73, buyPrice: 226.19, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 102.0573, currency: 'CAD', account: 'LIRA', dividendPerShare: 4.40, dividendYield: 0.0366, price: 120.32, buyPrice: 90.31, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 27 },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 31.05, buyPrice: 30.69, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'DFN', name: 'Dividend 15 Split Corp', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.20, dividendYield: 0.1338, price: 8.97, buyPrice: 8.80, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 10 },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15.0102, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.42, dividendYield: 0.0023, price: 186.25, buyPrice: 184.23, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 10 },
  { ticker: 'ECHI', name: 'Ninepoint Enhanced Canadian Highshares ETF', shares: 101.2939, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.32, dividendYield: 0.1101, price: 11.99, buyPrice: 12.24, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 15 },
  { ticker: 'ENB', name: 'Enbridge Inc', shares: 25, currency: 'CAD', account: 'LIRA', dividendPerShare: 3.77, dividendYield: 0.0483, price: 78.04, buyPrice: 77.74, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 1 },
  { ticker: 'EOSE', name: 'Eos Energy Enterprises Inc (Class A)', shares: 100, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 4.57, buyPrice: 8.03, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'EOSER', name: 'Eos Energy Enterprises Inc - Rights Exp 072126', shares: 100, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.0574, buyPrice: 0, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 102.3497, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.48, dividendYield: 0.0425, price: 11.30, buyPrice: 9.43, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 25 },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3500, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.59, buyPrice: 0.68, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 101.8915, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.94, dividendYield: 0.0333, price: 58.26, buyPrice: 46.46, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 19 },
  { ticker: 'SOFI', name: 'SoFi Technologies Inc', shares: 25, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 17.69, buyPrice: 15.38, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'SPCX', name: 'Space Exploration Technologies Corp', shares: 1, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 148.88, buyPrice: 135.00, payFrequency: 'none', payMonths: [], payDay: 0 },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 101.7246, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.96, dividendYield: 0.0343, price: 27.95, buyPrice: 28.40, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 5 },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 272.7931, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.70, dividendYield: 0.0274, price: 25.51, buyPrice: 18.83, payFrequency: 'quarterly', payMonths: [3, 6, 9, 12], payDay: 31 },
  { ticker: 'XEQT', name: 'iShares Core Equity ETF Portfolio', shares: 28.5, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.78, dividendYield: 0.0174, price: 44.89, buyPrice: 45.44, payFrequency: 'quarterly', payMonths: [1, 4, 7, 10], payDay: 7 },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 42.4609, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.26, dividendYield: 0.0562, price: 22.42, buyPrice: 21.63, payFrequency: 'monthly', payMonths: [1,2,3,4,5,6,7,8,9,10,11,12], payDay: 8 },
];

// Tickers removed from the portfolio in the July 8, 2026 sync (sold/closed positions)
export const removedTickers = new Set(['BCE', 'BTC', 'BYAH', 'FXI', 'SPY', 'SPYD', 'SPYI', 'WEN']);

// Tickers that don't pay dividends (skipped during API fetch)
export const nonDividendTickers = new Set(['AMZN', 'CGL', 'EOSE', 'EOSER', 'FLT', 'SOFI', 'SPCX']);

// All CAD holdings trade on the TSX and need the .TO suffix for Alpha Vantage
export function getApiTicker(ticker, currency) {
  if (currency === 'CAD') return `${ticker}.TO`;
  return ticker;
}
