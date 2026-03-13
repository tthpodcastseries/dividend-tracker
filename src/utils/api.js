const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(ticker) {
  return `div_cache_${ticker}`;
}

function getCachedData(ticker) {
  try {
    const raw = localStorage.getItem(getCacheKey(ticker));
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(getCacheKey(ticker));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedData(ticker, data) {
  localStorage.setItem(getCacheKey(ticker), JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
}

export async function fetchDividendData(apiTicker, apiKey) {
  // Check cache first
  const cached = getCachedData(apiTicker);
  if (cached) return cached;

  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${apiTicker}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.Note || json['Information']) {
      // Rate limited
      return { error: 'rate_limited' };
    }

    if (!json.Symbol) {
      return { error: 'not_found', dividendPerShare: 0, dividendYield: 0, name: '' };
    }

    const data = {
      dividendPerShare: parseFloat(json.DividendPerShare) || 0,
      dividendYield: parseFloat(json.DividendYield) || 0,
      name: json.Name || '',
      exchange: json.Exchange || '',
      currency: json.Currency || '',
    };

    setCachedData(apiTicker, data);
    return data;
  } catch {
    return { error: 'fetch_failed' };
  }
}

export function clearDividendCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('div_cache_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
