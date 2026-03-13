export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0096, currency: 'USD', account: 'LIRA', dividendPerShare: 1.04, dividendYield: 0.0041 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0 },
  { ticker: 'BCE', name: 'BCE Inc', shares: 202, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.75, dividendYield: 0.0488 },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 101, currency: 'CAD', account: 'LIRA', dividendPerShare: 4.40, dividendYield: 0.0441 },
  { ticker: 'BTC', name: 'Bitcoin', shares: 0.000585, currency: 'CAD', account: 'Crypto', dividendPerShare: 0, dividendYield: 0 },
  { ticker: 'BYAH', name: 'Park Ha Biological Technology', shares: 20, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0 },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0 },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.42, dividendYield: 0.0021 },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 100.8062, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.48, dividendYield: 0.0496 },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3000, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0 },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0.92, dividendYield: 0.0248 },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.94, dividendYield: 0.0391 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 0.2157, currency: 'USD', account: 'LIRA', dividendPerShare: 7.28, dividendYield: 0.0109 },
  { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend ETF', shares: 3.149, currency: 'USD', account: 'LIRA', dividendPerShare: 1.96, dividendYield: 0.0424 },
  { ticker: 'SPYI', name: 'Neos S&P 500 High Income ETF', shares: 6.2482, currency: 'USD', account: 'LIRA', dividendPerShare: 6.26, dividendYield: 0.1217 },
  { ticker: 'WEN', name: "Wendy's Co (Class A)", shares: 100, currency: 'USD', account: 'LIRA', dividendPerShare: 0.56, dividendYield: 0.0778 },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 100.5654, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.96, dividendYield: 0.0337 },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 252, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.70, dividendYield: 0.0288 },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 20.894, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.26, dividendYield: 0.0584 },
];

// Canadian tickers that need .TO suffix for Alpha Vantage
const canadianTickers = new Set([
  'BCE', 'BNS', 'CGL', 'DOL', 'FIE', 'FLT', 'MFC', 'XBB', 'XEG', 'ZWC'
]);

// Tickers that don't pay dividends
export const nonDividendTickers = new Set(['BTC', 'CGL', 'AMZN', 'BYAH', 'FLT']);

export function getApiTicker(ticker, currency) {
  if (ticker === 'BTC') return null; // No API lookup for crypto
  if (canadianTickers.has(ticker) || (currency === 'CAD' && !['FXI', 'SPY', 'SPYD', 'SPYI'].includes(ticker))) {
    return `${ticker}.TO`;
  }
  return ticker;
}
