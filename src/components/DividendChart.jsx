import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { formatCurrency } from '../utils/dividendCalc';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#e879f9', '#f472b6', '#fb7185', '#f87171',
  '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8',
  '#60a5fa', '#818cf8', '#a5b4fc', '#c4b5fd',
];

export default function DividendChart({ stocks, period }) {
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

  return (
    <div className="chart-container">
      <h3 className="chart-title">
        Dividend Income by Stock ({period.charAt(0).toUpperCase() + period.slice(1)})
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <XAxis
            dataKey="ticker"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value, _name, props) =>
              [formatCurrency(value, props.payload.currency), 'Dividend']
            }
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="amount"
              position="top"
              style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              formatter={(v) => `$${v.toFixed(0)}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
