import { useState, useEffect, useCallback } from 'react';
import { defaultPortfolio, getApiTicker, nonDividendTickers } from '../utils/defaultPortfolio';
import { fetchDividendData } from '../utils/api';
import { calcDividends } from '../utils/dividendCalc';

const PORTFOLIO_KEY = 'dividend_tracker_portfolio';
const API_KEY_KEY = 'dividend_tracker_api_key';

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function savePortfolio(portfolio) {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
}

export function usePortfolio() {
  const [stocks, setStocks] = useState(() => {
    const saved = loadPortfolio();
    return saved || defaultPortfolio.map(s => ({
      ...s,
      dividendPerShare: s.dividendPerShare || 0,
      dividendYield: s.dividendYield || 0,
      dividends: calcDividends(s.dividendPerShare || 0, s.shares),
      loading: false,
      error: null,
    }));
  });

  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_KEY) || '');
  const [fetching, setFetching] = useState(false);

  const setApiKey = useCallback((key) => {
    localStorage.setItem(API_KEY_KEY, key);
    setApiKeyState(key);
  }, []);

  // Save portfolio whenever it changes
  useEffect(() => {
    savePortfolio(stocks);
  }, [stocks]);

  // Fetch dividend data for all stocks
  const fetchAllDividends = useCallback(async () => {
    if (!apiKey) return;
    setFetching(true);

    const updated = [...stocks];
    for (let i = 0; i < updated.length; i++) {
      const stock = updated[i];

      if (nonDividendTickers.has(stock.ticker)) {
        updated[i] = {
          ...stock,
          dividendPerShare: 0,
          dividendYield: 0,
          dividends: { annual: 0, monthly: 0, weekly: 0, daily: 0 },
          loading: false,
          error: null,
        };
        continue;
      }

      const apiTicker = getApiTicker(stock.ticker, stock.currency);
      if (!apiTicker) {
        updated[i] = { ...stock, loading: false };
        continue;
      }

      const data = await fetchDividendData(apiTicker, apiKey);

      if (data.error === 'rate_limited') {
        // Stop fetching, keep what we have
        updated[i] = { ...stock, loading: false, error: 'Rate limited — cached data will be used next time' };
        // Mark remaining as not loading
        for (let j = i + 1; j < updated.length; j++) {
          if (updated[j].loading) updated[j] = { ...updated[j], loading: false, error: 'rate_limited' };
        }
        break;
      }

      if (data.error) {
        updated[i] = { ...stock, loading: false, error: data.error };
        continue;
      }

      const dividends = calcDividends(data.dividendPerShare, stock.shares);
      updated[i] = {
        ...stock,
        dividendPerShare: data.dividendPerShare,
        dividendYield: data.dividendYield,
        dividends,
        loading: false,
        error: null,
        fetchedName: data.name,
      };
    }

    setStocks(updated);
    setFetching(false);
  }, [apiKey, stocks]);

  const addStock = useCallback((ticker, name, shares, currency, account = 'LIRA') => {
    setStocks(prev => {
      if (prev.some(s => s.ticker.toUpperCase() === ticker.toUpperCase())) return prev;
      return [...prev, {
        ticker: ticker.toUpperCase(),
        name,
        shares: parseFloat(shares),
        currency,
        account,
        dividendPerShare: 0,
        dividendYield: 0,
        dividends: { annual: 0, monthly: 0, weekly: 0, daily: 0 },
        loading: true,
        error: null,
      }];
    });
  }, []);

  const removeStock = useCallback((ticker) => {
    setStocks(prev => prev.filter(s => s.ticker !== ticker));
  }, []);

  const updateShares = useCallback((ticker, newShares) => {
    setStocks(prev => prev.map(s => {
      if (s.ticker !== ticker) return s;
      const shares = parseFloat(newShares);
      const dividends = calcDividends(s.dividendPerShare, shares);
      return { ...s, shares, dividends };
    }));
  }, []);

  // Totals by period
  const totals = stocks.reduce(
    (acc, s) => {
      // Group by currency
      const cur = s.currency || 'USD';
      if (!acc[cur]) acc[cur] = { daily: 0, weekly: 0, monthly: 0, annual: 0 };
      acc[cur].daily += s.dividends?.daily || 0;
      acc[cur].weekly += s.dividends?.weekly || 0;
      acc[cur].monthly += s.dividends?.monthly || 0;
      acc[cur].annual += s.dividends?.annual || 0;
      return acc;
    },
    {}
  );

  return {
    stocks,
    apiKey,
    setApiKey,
    fetching,
    fetchAllDividends,
    addStock,
    removeStock,
    updateShares,
    totals,
  };
}
