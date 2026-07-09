// Recurring weekly purchases, applied automatically on app load.
// Each Monday the configured dollar amount buys fractional shares at that
// day's market price (first trading day on/after the Monday if it's a
// holiday), fetched from Yahoo's daily chart. Missed weeks are back-filled,
// so the app catches up even if it hasn't been opened in a while.
//
// Purchases are appended to a persistent log, and share counts are
// reconciled from that log (state.applied tracks how many logged shares
// have been folded into the portfolio). Reconciling is idempotent, so a
// crash or double-invoke between logging and applying can't lose or
// double-count shares.

import { fetchYahooJson, getYahooSymbol } from './quotes';
import { calcDividends } from './dividendCalc';

export const RECURRING_BUYS = [
  { ticker: 'XEG', currency: 'CAD', amount: 50 },
  { ticker: 'XEQT', currency: 'CAD', amount: 50 },
];

// Buys on/before this date are already reflected in the synced share counts
// (brokerage sync of July 8, 2026). Move this forward on the next full sync.
export const RECURRING_ANCHOR = '2026-07-08';

const STATE_KEY = 'recurring_buys_v1';

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadRecurringState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lastApplied: null, log: [], applied: {} };
}

function saveRecurringState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// Mondays strictly after `sinceDateStr`, up to and including today
export function getPendingMondays(sinceDateStr) {
  const todayStr = toDateStr(new Date());
  const d = new Date(`${sinceDateStr}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const mondays = [];
  while (toDateStr(d) <= todayStr) {
    if (d.getDay() === 1) mondays.push(toDateStr(d));
    d.setDate(d.getDate() + 1);
  }
  return mondays;
}

// Daily close prices for a symbol from `sinceDateStr` to now
async function fetchDailyBars(symbol, sinceDateStr) {
  const period1 = Math.floor(new Date(`${sinceDateStr}T00:00:00`).getTime() / 1000) - 86400;
  const period2 = Math.floor(Date.now() / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`;
  const json = await fetchYahooJson(url);
  const result = json?.chart?.result?.[0];
  if (!result) return null;
  const ts = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const bars = [];
  for (let i = 0; i < ts.length; i++) {
    if (closes[i] != null) bars.push({ date: toDateStr(new Date(ts[i] * 1000)), close: closes[i] });
  }
  return { bars, livePrice: result.meta?.regularMarketPrice ?? null };
}

// Price for a buy targeted at `dateStr`: first trading day on/after it
function priceOnOrAfter(data, dateStr) {
  const bar = data.bars.find(b => b.date >= dateStr);
  if (bar) return bar.close;
  // Target date is today but no daily bar yet — use the live price
  if (dateStr === toDateStr(new Date())) return data.livePrice;
  return null;
}

/**
 * Fold any logged-but-unapplied purchase shares into the stock list.
 * Idempotent: safe to call from state initializers and repeated renders.
 * Returns the same array instance when there is nothing to fold.
 */
export function reconcileRecurringShares(stocks) {
  const state = loadRecurringState();
  const logged = {};
  for (const p of state.log || []) {
    logged[p.ticker] = (logged[p.ticker] || 0) + p.shares;
  }
  const applied = state.applied || {};

  let changed = false;
  const next = stocks.map(s => {
    const delta = (logged[s.ticker] || 0) - (applied[s.ticker] || 0);
    if (delta <= 1e-9) return s;
    changed = true;
    const newShares = s.shares + delta;
    return { ...s, shares: newShares, dividends: calcDividends(s.dividendPerShare || 0, newShares) };
  });
  if (!changed) return stocks;

  saveRecurringState({ ...state, applied: { ...applied, ...logged } });
  return next;
}

let inFlight = null; // shared promise so concurrent callers get the same result

/**
 * Fetch prices and append any pending weekly buys to the log.
 * Returns { purchases: [{ ticker, currency, date, amount, price, shares }] }
 * or null when there is nothing new (or prices are unavailable).
 * Callers then fold shares in via reconcileRecurringShares.
 */
export function applyPendingRecurringBuys() {
  if (!inFlight) {
    inFlight = computePendingBuys().finally(() => { inFlight = null; });
  }
  return inFlight;
}

async function computePendingBuys() {
  const state = loadRecurringState();
  const since = state.lastApplied && state.lastApplied > RECURRING_ANCHOR
    ? state.lastApplied
    : RECURRING_ANCHOR;
  const mondays = getPendingMondays(since);
  if (mondays.length === 0) return null;

  // One history fetch per ticker covers every pending Monday
  const history = {};
  for (const buy of RECURRING_BUYS) {
    const data = await fetchDailyBars(getYahooSymbol(buy.ticker, buy.currency), mondays[0]);
    if (!data) return null; // proxies down — retry on next load
    history[buy.ticker] = data;
  }

  const already = new Set((state.log || []).map(p => `${p.date}|${p.ticker}`));
  const purchases = [];
  let lastApplied = state.lastApplied;
  for (const monday of mondays) {
    const weekPurchases = [];
    for (const buy of RECURRING_BUYS) {
      const price = priceOnOrAfter(history[buy.ticker], monday);
      if (!price) break; // no price yet — stop here, retry later
      if (already.has(`${monday}|${buy.ticker}`)) continue; // logged by another tab
      weekPurchases.push({
        ticker: buy.ticker,
        currency: buy.currency,
        date: monday,
        amount: buy.amount,
        price,
        shares: buy.amount / price,
      });
    }
    const priced = weekPurchases.length +
      RECURRING_BUYS.filter(b => already.has(`${monday}|${b.ticker}`)).length;
    if (priced < RECURRING_BUYS.length) break;
    purchases.push(...weekPurchases);
    lastApplied = monday;
  }
  if (purchases.length === 0) return null;

  // Re-read state to minimize the two-tabs race window before appending
  const fresh = loadRecurringState();
  const freshKeys = new Set((fresh.log || []).map(p => `${p.date}|${p.ticker}`));
  const newEntries = purchases.filter(p => !freshKeys.has(`${p.date}|${p.ticker}`));
  saveRecurringState({
    ...fresh,
    lastApplied: fresh.lastApplied && fresh.lastApplied > lastApplied ? fresh.lastApplied : lastApplied,
    log: [...(fresh.log || []), ...newEntries],
  });
  return newEntries.length ? { purchases: newEntries } : null;
}

export function clearRecurringState() {
  localStorage.removeItem(STATE_KEY);
}
