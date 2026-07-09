// Live quotes from Yahoo Finance (free, no API key).
// Yahoo blocks browser CORS, so requests go through a public CORS proxy
// with a fallback. All symbols are fetched in a single batched spark request.

const QUOTE_CACHE_KEY = 'quote_cache_v1';
const QUOTE_CACHE_TTL = 90 * 1000; // don't re-hit the proxy more than ~once/90s
export const QUOTE_REFRESH_MS = 2 * 60 * 1000;

const PROXIES = [
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// Yahoo symbol for a holding; all CAD tickers trade on the TSX (.TO)
export function getYahooSymbol(ticker, currency) {
  return currency === 'CAD' ? `${ticker}.TO` : ticker;
}

function loadCache() {
  try {
    const raw = localStorage.getItem(QUOTE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Fetch live quotes for all stocks in one request.
// Returns { [ticker]: { price, prevClose } } plus a fetchedAt timestamp,
// or null if every proxy failed (callers keep existing prices).
export async function fetchQuotes(stocks, force = false) {
  const cached = loadCache();
  if (!force && cached && Date.now() - cached.fetchedAt < QUOTE_CACHE_TTL) {
    return cached;
  }

  const symbolMap = {}; // yahoo symbol -> ticker
  for (const s of stocks) {
    symbolMap[getYahooSymbol(s.ticker, s.currency)] = s.ticker;
  }
  const symbols = Object.keys(symbolMap).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols}&range=1d&interval=15m`;

  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url));
      if (!res.ok) continue;
      const json = await res.json();
      const results = json?.spark?.result;
      if (!Array.isArray(results) || results.length === 0) continue;

      const quotes = {};
      for (const r of results) {
        const meta = r?.response?.[0]?.meta;
        const ticker = symbolMap[r.symbol];
        if (!ticker || !meta?.regularMarketPrice) continue;
        quotes[ticker] = {
          price: meta.regularMarketPrice,
          prevClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
        };
      }
      if (Object.keys(quotes).length === 0) continue;

      const payload = { quotes, fetchedAt: Date.now() };
      try {
        localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(payload));
      } catch { /* storage full — quotes still returned */ }
      return payload;
    } catch {
      // proxy down — try the next one
    }
  }

  // All proxies failed; serve stale cache if we have one
  return cached || null;
}

export function clearQuoteCache() {
  localStorage.removeItem(QUOTE_CACHE_KEY);
}
