import { useState, useMemo, Fragment } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { projectDripPortfolio, projectDripStock } from '../utils/dripCalc';
import { formatCurrency } from '../utils/dividendCalc';

export default function DripProjection({ stocks }) {
  const [years, setYears] = useState(10);
  const [divGrowth, setDivGrowth] = useState(0);
  const [expandedTicker, setExpandedTicker] = useState(null);

  const { perStock, yearlyTotals, noDripTotals } = useMemo(
    () => projectDripPortfolio(stocks, years, divGrowth / 100),
    [stocks, years, divGrowth]
  );

  // Build chart data for total portfolio dividend income (DRIP vs no-DRIP)
  const currencies = [...new Set(stocks.map(s => s.currency))];

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const row = { year: `Year ${y}` };
      for (const cur of currencies) {
        row[`drip_${cur}`] = yearlyTotals[y]?.[cur]?.annualDividend || 0;
        row[`noDrip_${cur}`] = noDripTotals[y]?.[cur]?.annualDividend || 0;
      }
      data.push(row);
    }
    return data;
  }, [yearlyTotals, noDripTotals, years, currencies]);

  // Dividend-paying stocks only, sorted by annual dividend
  const dripStocks = stocks
    .filter(s => s.dividendPerShare > 0 && s.price > 0)
    .sort((a, b) => (b.dividendPerShare * b.shares) - (a.dividendPerShare * a.shares));

  if (dripStocks.length === 0) {
    return (
      <div className="drip-section">
        <div className="drip-header">
          <h2><span aria-hidden="true">📈</span> DRIP Projection</h2>
          <p className="drip-subtitle">No dividend-paying stocks in portfolio. Add stocks with dividends to see DRIP projections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drip-section">
      <div className="drip-header">
        <h2><span aria-hidden="true">📈</span> DRIP Projection</h2>
        <p className="drip-subtitle">
          Dividend Reinvestment — see how reinvesting dividends compounds your returns
        </p>
      </div>

      <div className="drip-controls">
        <label>
          <span>Projection</span>
          <select value={years} onChange={e => setYears(Number(e.target.value))}>
            <option value={5}>5 Years</option>
            <option value={10}>10 Years</option>
            <option value={15}>15 Years</option>
            <option value={20}>20 Years</option>
            <option value={25}>25 Years</option>
            <option value={30}>30 Years</option>
          </select>
        </label>
        <label>
          <span>Dividend Growth</span>
          <select value={divGrowth} onChange={e => setDivGrowth(Number(e.target.value))}>
            <option value={0}>0% (flat)</option>
            <option value={2}>2% / year</option>
            <option value={3}>3% / year</option>
            <option value={5}>5% / year</option>
            <option value={7}>7% / year</option>
          </select>
        </label>
      </div>

      {/* Summary cards for final year */}
      <div className="drip-summary-grid">
        {currencies.map(cur => {
          const finalDrip = yearlyTotals[years]?.[cur];
          const finalNoDrip = noDripTotals[years]?.[cur];
          if (!finalDrip) return null;
          const gain = finalDrip.annualDividend - (finalNoDrip?.annualDividend || 0);
          return (
            <div key={cur} className="drip-summary-card">
              <h4>{cur} — Year {years}</h4>
              <div className="drip-stat">
                <span className="drip-stat-label">Annual Dividends (with DRIP)</span>
                <span className="drip-stat-value green">{formatCurrency(finalDrip.annualDividend, cur)}</span>
              </div>
              <div className="drip-stat">
                <span className="drip-stat-label">Monthly Income (with DRIP)</span>
                <span className="drip-stat-value green">{formatCurrency(finalDrip.monthlyDividend, cur)}</span>
              </div>
              <div className="drip-stat">
                <span className="drip-stat-label">Without DRIP</span>
                <span className="drip-stat-value dim">{formatCurrency(finalNoDrip?.annualDividend || 0, cur)}</span>
              </div>
              <div className="drip-stat">
                <span className="drip-stat-label">DRIP Advantage</span>
                <span className="drip-stat-value accent">+{formatCurrency(gain, cur)}/yr</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="chart-container" role="img" aria-label={`DRIP projection chart showing dividend income over ${years} years with and without reinvestment`}>
        <h3 className="chart-title">Annual Dividend Income - DRIP vs No DRIP</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => {
                const cur = name.includes('CAD') ? 'CAD' : 'USD';
                const label = name.startsWith('drip_') ? `DRIP (${cur})` : `No DRIP (${cur})`;
                return [formatCurrency(value, cur), label];
              }}
            />
            <Legend
              formatter={(value) => {
                const cur = value.includes('CAD') ? 'CAD' : 'USD';
                return value.startsWith('drip_') ? `With DRIP (${cur})` : `Without DRIP (${cur})`;
              }}
            />
            {currencies.map(cur => (
              <Area
                key={`drip_${cur}`}
                type="monotone"
                dataKey={`drip_${cur}`}
                stroke={cur === 'CAD' ? '#4ade80' : '#38bdf8'}
                fill={cur === 'CAD' ? 'rgba(74,222,128,0.15)' : 'rgba(56,189,248,0.15)'}
                strokeWidth={2}
              />
            ))}
            {currencies.map(cur => (
              <Area
                key={`noDrip_${cur}`}
                type="monotone"
                dataKey={`noDrip_${cur}`}
                stroke={cur === 'CAD' ? '#6b7280' : '#9ca3af'}
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="5 5"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-stock DRIP table */}
      <div className="drip-table-section">
        <h3 className="chart-title">Per-Stock DRIP Breakdown</h3>
        <div className="table-wrapper">
          <table className="portfolio-table drip-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th className="right">Shares Now</th>
                <th className="right">Price</th>
                <th className="right">Shares (Yr {years})</th>
                <th className="right">New Shares</th>
                <th className="right">Annual Div Now</th>
                <th className="right">Annual Div (Yr {years})</th>
                <th className="right">Growth</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dripStocks.map(stock => {
                const proj = perStock[stock.ticker];
                if (!proj) return null;
                const final = proj.projection[proj.projection.length - 1];
                if (!final) return null;
                const currentAnnual = stock.dividendPerShare * stock.shares;
                const growthPct = currentAnnual > 0 ? ((final.annualDividend / currentAnnual - 1) * 100) : 0;
                const isExpanded = expandedTicker === stock.ticker;

                return (
                  <Fragment key={stock.ticker}>
                    <tr
                      className="drip-row"
                      onClick={() => setExpandedTicker(isExpanded ? null : stock.ticker)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedTicker(isExpanded ? null : stock.ticker); } }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                    >
                      <td className="ticker-cell">
                        <span className="expand-icon" aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
                        {stock.ticker}
                      </td>
                      <td className="right">{stock.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td className="right">{formatCurrency(stock.price, stock.currency)}</td>
                      <td className="right">{final.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td className="right green-text">+{(final.shares - stock.shares).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td className="right">{formatCurrency(currentAnnual, stock.currency)}</td>
                      <td className="right income-cell">{formatCurrency(final.annualDividend, stock.currency)}</td>
                      <td className="right green-text">+{growthPct.toFixed(1)}%</td>
                      <td className="currency-badge">{stock.currency}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${stock.ticker}-detail`} className="drip-detail-row">
                        <td colSpan={9}>
                          <div className="drip-detail-grid">
                            <table className="drip-detail-table">
                              <thead>
                                <tr>
                                  <th>Year</th>
                                  <th className="right">Shares</th>
                                  <th className="right">New Shares</th>
                                  <th className="right">Div/Share</th>
                                  <th className="right">Annual Income</th>
                                  <th className="right">Monthly Income</th>
                                  <th className="right">Position Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {proj.projection.map(row => (
                                  <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td className="right">{row.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                    <td className="right green-text">+{row.newSharesThisYear.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                    <td className="right">{formatCurrency(row.divPerShare, stock.currency)}</td>
                                    <td className="right income-cell">{formatCurrency(row.annualDividend, stock.currency)}</td>
                                    <td className="right">{formatCurrency(row.monthlyDividend, stock.currency)}</td>
                                    <td className="right">{formatCurrency(row.totalValue, stock.currency)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
