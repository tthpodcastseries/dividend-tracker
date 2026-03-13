import { useState } from 'react';

export default function ApiKeyInput({ onSave }) {
  const [key, setKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim()) onSave(key.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Alpha Vantage API Key</h2>
        <p>
          This app uses Alpha Vantage to fetch real dividend data.
          Get a free API key at{' '}
          <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noreferrer">
            alphavantage.co
          </a>
          {' '}(25 requests/day on the free tier).
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key..."
            autoFocus
          />
          <button type="submit" disabled={!key.trim()}>Save & Load Data</button>
        </form>
      </div>
    </div>
  );
}
