export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0096, currency: 'USD', account: 'LIRA', dividendPerShare: 1.04, dividendYield: 0.0041, price: 252.00 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 197.00 },
  { ticker: 'BCE', name: 'BCE Inc', shares: 202, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.75, dividendYield: 0.0488, price: 35.85 },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 101, currency: 'CAD', account: 'LIRA', dividendPerShare: 4.40, dividendYield: 0.0441, price: 99.80 },
  { ticker: 'BTC', name: 'Bitcoin', shares: 0.000585, currency: 'CAD', account: 'Crypto', dividendPerShare: 0, dividendYield: 0, price: 115000 },
  { ticker: 'BYAH', name: 'Park Ha Biological Technology', shares: 20, currency: 'USD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.50 },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 27.50 },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.42, dividendYield: 0.0021, price: 148.00 },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 100.8062, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.48, dividendYield: 0.0496, price: 9.68 },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3000, currency: 'CAD', account: 'LIRA', dividendPerShare: 0, dividendYield: 0, price: 0.04 },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', shares: 50, currency: 'USD', account: 'LIRA', dividendPerShare: 0.92, dividendYield: 0.0248, price: 37.10 },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 100, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.94, dividendYield: 0.0391, price: 49.60 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 0.2157, currency: 'USD', account: 'LIRA', dividendPerShare: 7.28, dividendYield: 0.0109, price: 563.00 },
  { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend ETF', shares: 3.149, currency: 'USD', account: 'LIRA', dividendPerShare: 1.96, dividendYield: 0.0424, price: 46.20 },
  { ticker: 'SPYI', name: 'Neos S&P 500 High Income ETF', shares: 6.2482, currency: 'USD', account: 'LIRA', dividendPerShare: 6.26, dividendYield: 0.1217, price: 51.43 },
  { ticker: 'WEN', name: "Wendy's Co (Class A)", shares: 100, currency: 'USD', account: 'LIRA', dividendPerShare: 0.56, dividendYield: 0.0778, price: 7.20 },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 100.5654, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.96, dividendYield: 0.0337, price: 28.50 },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 252, currency: 'CAD', account: 'LIRA', dividendPerShare: 0.70, dividendYield: 0.0288, price: 24.30 },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 20.894, currency: 'CAD', account: 'LIRA', dividendPerShare: 1.26, dividendYield: 0.0584, price: 21.57 },
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
