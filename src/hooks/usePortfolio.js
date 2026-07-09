import { useState, useEffect, useCallback, useRef } from 'react';
import { defaultPortfolio, getApiTicker, nonDividendTickers, removedTickers } from '../utils/defaultPortfolio';
import { fetchDividendData } from '../utils/api';
import { calcDividends } from '../utils/dividendCalc';
import { loadDripState, saveDripState, getPendingPayments, calcDripPurchase, calcManualDripPurchase } from '../utils/dripTracker';
import { fetchQuotes, QUOTE_REFRESH_MS } from '../utils/quotes';
import { applyPendingRecurringBuys, reconcileRecurringShares, loadRecurringState } from '../utils/recurringBuys';

const PORTFOLIO_KEY = 'dividend_tracker_portfolio';
const API_KEY_KEY = 'dividend_tracker_api_key';
const SALES_KEY = 'dividend_tracker_sales';
const DATA_VERSION_KEY = 'dividend_tracker_data_version';
const CURRENT_DATA_VERSION = 5; // Bump this when defaultPortfolio prices/shares change

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
    const savedVersion = parseInt(localStorage.getItem(DATA_VERSION_KEY) || '0', 10);
    const needsSync = savedVersion < CURRENT_DATA_VERSION;

    if (saved) {
      // Merge saved data with defaults to pick up any new fields (e.g. price, payFrequency)
      const defaultMap = {};
      for (const d of defaultPortfolio) defaultMap[d.ticker] = d;
      const merged = saved
        // On version bump, drop positions sold since the last sync
        .filter(s => !(needsSync && removedTickers.has(s.ticker)))
        .map(s => {
          const def = defaultMap[s.ticker] || {};
          return {
            ...s,
            // On version bump, sync prices, shares, and buy price from defaults
            price: needsSync && def.price ? def.price : (s.price || def.price || 0),
            shares: needsSync && def.shares ? def.shares : s.shares,
            buyPrice: needsSync && def.buyPrice ? def.buyPrice : (s.buyPrice || def.buyPrice || 0),
            payFrequency: s.payFrequency || def.payFrequency || 'quarterly',
            payMonths: s.payMonths || def.payMonths || [],
            payDay: s.payDay || def.payDay || 1,
          };
        });
      if (needsSync) {
        // Add default positions the saved portfolio doesn't have yet
        const have = new Set(merged.map(s => s.ticker));
        for (const d of defaultPortfolio) {
          if (!have.has(d.ticker)) {
            merged.push({
              ...d,
              dividendPerShare: d.dividendPerShare || 0,
              dividendYield: d.dividendYield || 0,
              dividends: calcDividends(d.dividendPerShare || 0, d.shares),
              loading: false,
              error: null,
            });
          }
        }
        merged.sort((a, b) => a.ticker.localeCompare(b.ticker));
        localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
      }
      // Fold in any recurring-buy shares logged but not yet applied
      return reconcileRecurringShares(merged);
    }
    localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
    return reconcileRecurringShares(defaultPortfolio.map(s => ({
      ...s,
      dividendPerShare: s.dividendPerShare || 0,
      dividendYield: s.dividendYield || 0,
      dividends: calcDividends(s.dividendPerShare || 0, s.shares),
      loading: false,
      error: null,
    })));
  });

  const [dripState, setDripState] = useState(() => loadDripState());

  // Sales log: { [ticker]: [{ date, sharesSold, salePrice, avgCostAtSale, realizedPL, sharesBefore, sharesAfter }] }
  const [salesLog, setSalesLog] = useState(() => {
    try {
      const raw = localStorage.getItem(SALES_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  });

  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_KEY) || '');
  const [fetching, setFetching] = useState(false);
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState(null);

  // Ref mirror so the quote poller doesn't need stocks in its deps
  // (which would reset the interval on every price update)
  const stocksRef = useRef(stocks);
  useEffect(() => { stocksRef.current = stocks; }, [stocks]);

  // Fetch live prices for all holdings (single batched request)
  const fetchAllQuotes = useCallback(async (force = false) => {
    const result = await fetchQuotes(stocksRef.current, force);
    if (!result?.quotes) return;
    setStocks(prev => prev.map(s => {
      const q = result.quotes[s.ticker];
      if (!q?.price) return s;
      return { ...s, price: q.price, prevClose: q.prevClose };
    }));
    setQuotesUpdatedAt(result.fetchedAt);
  }, []);

  // Live prices: fetch on load, poll while the tab is visible,
  // and refresh immediately when the tab regains focus
  useEffect(() => {
    fetchAllQuotes();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') fetchAllQuotes();
    }, QUOTE_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchAllQuotes();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAllQuotes]);

  // Recurring weekly buys: back-fill any Mondays since the last catch-up
  const [recurringBuyLog, setRecurringBuyLog] = useState(() => loadRecurringState().log || []);
  const [recurringBuyResults, setRecurringBuyResults] = useState(null);
  const clearRecurringBuyResults = useCallback(() => setRecurringBuyResults(null), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await applyPendingRecurringBuys();
      if (cancelled || !result?.purchases?.length) return;
      setStocks(prev => reconcileRecurringShares(prev));
      setRecurringBuyLog(loadRecurringState().log || []);
      setRecurringBuyResults(result.purchases);
    })();
    return () => { cancelled = true; };
  }, []);

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

      const periods = getPendingPayments(stock, state.lastDripDate);
      if (periods <= 0) return stock;

      const purchase = calcDripPurchase(stock, periods);
      if (!purchase) return stock;

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

  const applyManualDrip = useCallback((ticker, dividendAmount, price, date) => {
    const purchase = calcManualDripPurchase(dividendAmount, price);
    if (!purchase) return null;

    const now = date || new Date().toISOString();

    setStocks(prev => prev.map(stock => {
      if (stock.ticker !== ticker) return stock;
      const newShares = stock.shares + purchase.sharesPurchased;
      return {
        ...stock,
        shares: newShares,
        dividends: calcDividends(stock.dividendPerShare, newShares),
      };
    }));

    setDripState(prev => {
      const state = prev[ticker] || { enabled: true, log: [], lastDripDate: null };
      const stockData = stocks.find(s => s.ticker === ticker);
      const logEntry = {
        date: now,
        dividendAmount: purchase.dividendAmount,
        sharesPurchased: purchase.sharesPurchased,
        priceAtPurchase: purchase.priceAtPurchase,
        periods: 0, // manual
        sharesBefore: stockData?.shares || 0,
        sharesAfter: (stockData?.shares || 0) + purchase.sharesPurchased,
        manual: true,
      };
      return {
        ...prev,
        [ticker]: {
          ...state,
          enabled: true,
          lastDripDate: now,
          log: [...(state.log || []), logEntry],
        },
      };
    });

    return purchase;
  }, [stocks]);

  // Persist sales log
  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(salesLog));
  }, [salesLog]);

  const sellShares = useCallback((ticker, sharesSold, salePrice, avgCost, date) => {
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock || sharesSold <= 0 || sharesSold > stock.shares) return null;

    const realizedPL = (salePrice - avgCost) * sharesSold;
    const logEntry = {
      date: date || new Date().toISOString(),
      sharesSold,
      salePrice,
      avgCostAtSale: avgCost,
      realizedPL,
      sharesBefore: stock.shares,
      sharesAfter: stock.shares - sharesSold,
    };

    // Update share count
    setStocks(prev => prev.map(s => {
      if (s.ticker !== ticker) return s;
      const newShares = s.shares - sharesSold;
      return {
        ...s,
        shares: newShares,
        dividends: calcDividends(s.dividendPerShare, newShares),
      };
    }));

    // Add to sales log
    setSalesLog(prev => ({
      ...prev,
      [ticker]: [...(prev[ticker] || []), logEntry],
    }));

    return logEntry;
  }, [stocks]);

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
    fetchAllQuotes,
    quotesUpdatedAt,
    recurringBuyLog,
    recurringBuyResults,
    clearRecurringBuyResults,
    addStock,
    removeStock,
    updateShares,
    totals,
    dripState,
    toggleDrip,
    applyDrip,
    applyManualDrip,
    sellShares,
    salesLog,
  };
}
