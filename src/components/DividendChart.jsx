import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { formatCurrency } from '../utils/dividendCalc';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#e879f9', '#f472b6', '#fb7185', '#f87171',
  '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8',
  '#60a5fa', '#818cf8', '#a5b4fc', '#c4b5fd',
];

function ClickableTick({ x, y, payload, onTickerClick }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="var(--text-dim)"
        fontSize={11}
        transform="rotate(-45)"
        style={{ cursor: 'pointer' }}
        onClick={() => onTickerClick(payload.value)}
        onMouseOver={(e) => { e.target.style.fill = 'var(--accent)'; }}
        onMouseOut={(e) => { e.target.style.fill = 'var(--text-dim)'; }}
      >
        {payload.value}
      </text>
    </g>
  );
}

export default function DividendChart({ stocks, period, onTickerClick }) {
  const data = stocks
    .filter(s => (s.dividends?.[period] || 0) > 0)
    .sort((a, b) => (b.dividends?.[period] || 0) - (a.dividends?.[period] || 0))
    .map(s => ({
      ticker: s.ticker,
      amount: parseFloat((s.dividends?.[period] || 0).toFixed(2)),
      currency: s.currency,
    }));

  if (data.length === 0) {
    return <div className="chart-empty">No dividend data to display</div>;
  }

  const handleBarClick = (entry) => {
    if (entry?.ticker && onTickerClick) onTickerClick(entry.ticker);
  };

  const chartSummary = data.map(d => `${d.ticker}: ${formatCurrency(d.amount, d.currency)}`).join(', ');

  return (
    <div className="chart-container" role="img" aria-label={`${period} dividend income chart. ${chartSummary}`}>
      <h2 className="chart-title">
        Dividend Income by Stock ({period.charAt(0).toUpperCase() + period.slice(1)})
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <XAxis
            dataKey="ticker"
            tick={<ClickableTick onTickerClick={onTickerClick} />}
            height={60}
          />
          <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-bright)' }}
            formatter={(value, _name, props) =>
              [formatCurrency(value, props.payload.currency), 'Dividend']
            }
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="amount"
              position="top"
              style={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 600 }}
              formatter={(v) => `$${v.toFixed(0)}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
