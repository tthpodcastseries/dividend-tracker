import { useState } from 'react';

export default function AddStock({ onAdd }) {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticker.trim() || !shares) return;
    onAdd(ticker.trim(), name.trim() || ticker.trim(), shares, currency);
    setTicker('');
    setName('');
    setShares('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button className="add-stock-btn" onClick={() => setOpen(true)}>
        + Add Stock
      </button>
    );
  }

  return (
    <form className="add-stock-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Ticker (e.g. AAPL)"
        aria-label="Ticker symbol"
        required
        autoFocus
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company name (optional)"
        aria-label="Company name"
      />
      <input
        type="number"
        step="any"
        min="0"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        placeholder="Shares"
        aria-label="Number of shares"
        required
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency">
        <option value="USD">USD</option>
        <option value="CAD">CAD</option>
      </select>
      <button type="submit">Add</button>
      <button type="button" className="cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
