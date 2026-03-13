export const defaultPortfolio = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10.0096, currency: 'USD', account: 'LIRA' },
  { ticker: 'AMZN', name: 'Amazon.com Inc', shares: 50, currency: 'USD', account: 'LIRA' },
  { ticker: 'BCE', name: 'BCE Inc', shares: 202, currency: 'CAD', account: 'LIRA' },
  { ticker: 'BNS', name: 'Bank of Nova Scotia', shares: 101, currency: 'CAD', account: 'LIRA' },
  { ticker: 'BTC', name: 'Bitcoin', shares: 0.000585, currency: 'CAD', account: 'Crypto' },
  { ticker: 'BYAH', name: 'Park Ha Biological Technology', shares: 20, currency: 'USD', account: 'LIRA' },
  { ticker: 'CGL', name: 'BlackRock iShares Gold Bullion ETF', shares: 100, currency: 'CAD', account: 'LIRA' },
  { ticker: 'DOL', name: 'Dollarama Inc', shares: 15, currency: 'CAD', account: 'LIRA' },
  { ticker: 'FIE', name: 'iShares Canadian Financial Mthly Income', shares: 100.8062, currency: 'CAD', account: 'LIRA' },
  { ticker: 'FLT', name: 'Volatus Aerospace Inc', shares: 3000, currency: 'CAD', account: 'LIRA' },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', shares: 50, currency: 'USD', account: 'LIRA' },
  { ticker: 'MFC', name: 'Manulife Financial Corporation', shares: 100, currency: 'CAD', account: 'LIRA' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 0.2157, currency: 'USD', account: 'LIRA' },
  { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend ETF', shares: 3.149, currency: 'USD', account: 'LIRA' },
  { ticker: 'SPYI', name: 'Neos S&P 500 High Income ETF', shares: 6.2482, currency: 'USD', account: 'LIRA' },
  { ticker: 'WEN', name: "Wendy's Co (Class A)", shares: 100, currency: 'USD', account: 'LIRA' },
  { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', shares: 100.5654, currency: 'CAD', account: 'LIRA' },
  { ticker: 'XEG', name: 'iShares S&P/TSX Capped Energy Index', shares: 252, currency: 'CAD', account: 'LIRA' },
  { ticker: 'ZWC', name: 'BMO Canadian High Dividend Covered Call', shares: 20.894, currency: 'CAD', account: 'LIRA' },
];

// Canadian tickers that need .TO suffix for Alpha Vantage
const canadianTickers = new Set([
  'BCE', 'BNS', 'CGL', 'DOL', 'FIE', 'FLT', 'MFC', 'XBB', 'XEG', 'ZWC'
]);

// Tickers that don't pay dividends
export const nonDividendTickers = new Set(['BTC', 'CGL']);

export function getApiTicker(ticker, currency) {
  if (ticker === 'BTC') return null; // No API lookup for crypto
  if (canadianTickers.has(ticker) || (currency === 'CAD' && !['FXI', 'SPY', 'SPYD', 'SPYI'].includes(ticker))) {
    return `${ticker}.TO`;
  }
  return ticker;
}
