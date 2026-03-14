import { useState, useEffect, useCallback } from 'react';
import { defaultPortfolio, getApiTicker, nonDividendTickers } from '../utils/defaultPortfolio';
import { fetchDividendData } from '../utils/api';
import { calcDividends } from '../utils/dividendCalc';
import { loadDripState, saveDripState, getPendingPayments, calcDripPurchase } from '../utils/dripTracker';

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
    if (saved) {
      // Merge saved data with defaults to pick up any new fields (e.g. price, payFrequency)
      const defaultMap = {};
      for (const d of defaultPortfolio) defaultMap[d.ticker] = d;
      return saved.map(s => ({
        ...s,
        price: s.price || defaultMap[s.ticker]?.price || 0,
        payFrequency: s.payFrequency || defaultMap[s.ticker]?.payFrequency || 'quarterly',
      }));
    }
    return defaultPortfolio.map(s => ({
      ...s,
      dividendPerShare: s.dividendPerShare || 0,
      dividendYield: s.dividendYield || 0,
      dividends: calcDividends(s.dividendPerShare || 0, s.shares),
      loading: false,
      error: null,
    }));
  });

  const [dripState, setDripState] = useState(() => loadDripState());

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

  // Persist DRIP state
  useEffect(() => {
    saveDripState(dripState);
  }, [dripState]);

  const toggleDrip = useCallback((ticker) => {
    setDripState(prev => {
      const current = prev[ticker] || { enabled: false, log: [], lastDripDate: null };
      return { ...prev, [ticker]: { ...current, enabled: !current.enabled } };
    });
  }, []);

  const applyDrip = useCallback(() => {
    const now = new Date().toISOString();
    const newDripState = { ...dripState };
    const results = [];

    setStocks(prev => prev.map(stock => {
      const state = newDripState[stock.ticker];
      if (!state?.enabled) return stock;

      const periods = getPendingPayments(stock.payFrequency, state.lastDripDate);
      if (periods <= 0) return stock;

      const purchase = calcDripPurchase(stock, periods);
      if (!purchase) return stock;

      // Record the DRIP transaction
      const logEntry = {
        date: now,
        dividendAmount: purchase.dividendAmount,
        sharesPurchased: purchase.sharesPurchased,
        priceAtPurchase: purchase.priceAtPurchase,
        periods: purchase.periods,
        sharesBefore: stock.shares,
        sharesAfter: stock.shares + purchase.sharesPurchased,
      };

      newDripState[stock.ticker] = {
        ...state,
        lastDripDate: now,
        log: [...(state.log || []), logEntry],
      };

      results.push({ ticker: stock.ticker, ...logEntry });

      // Update shares and recalculate dividends
      const newShares = stock.shares + purchase.sharesPurchased;
      return {
        ...stock,
        shares: newShares,
        dividends: calcDividends(stock.dividendPerShare, newShares),
      };
    }));

    setDripState(newDripState);
    return results;
  }, [dripState, stocks]);

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
    dripState,
    toggleDrip,
    applyDrip,
  };
}
