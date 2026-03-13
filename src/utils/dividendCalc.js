export function calcDividends(annualDividendPerShare, shares) {
  const annual = annualDividendPerShare * shares;
  return {
    annual,
    monthly: annual / 12,
    weekly: annual / 52,
    daily: annual / 365,
  };
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export const PERIODS = ['daily', 'weekly', 'monthly', 'annual'];

export function getPeriodLabel(period) {
  return period.charAt(0).toUpperCase() + period.slice(1);
}
