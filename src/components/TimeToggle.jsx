import { PERIODS, getPeriodLabel } from '../utils/dividendCalc';

export default function TimeToggle({ period, onChange }) {
  return (
    <div className="time-toggle" role="group" aria-label="Time period">
      {PERIODS.map(p => (
        <button
          key={p}
          className={`toggle-btn ${p === period ? 'active' : ''}`}
          onClick={() => onChange(p)}
          aria-pressed={p === period}
        >
          {getPeriodLabel(p)}
        </button>
      ))}
    </div>
  );
}
