import { PERIODS, getPeriodLabel } from '../utils/dividendCalc';

export default function TimeToggle({ period, onChange }) {
  return (
    <div className="time-toggle">
      {PERIODS.map(p => (
        <button
          key={p}
          className={`toggle-btn ${p === period ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {getPeriodLabel(p)}
        </button>
      ))}
    </div>
  );
}
