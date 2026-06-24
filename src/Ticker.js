import React, { useState, useEffect, useRef, memo } from 'react';

const TickerRow = memo(({ symbol, name, price, change }) => {
  const isPositive = change >= 0;

  return (
    <div style={styles.row}>
      <div style={styles.assetInfo}>
        <span style={styles.symbol}>{symbol}</span>
        <span style={styles.name}>{name}</span>
      </div>
      <div style={styles.priceInfo}>
        <span style={styles.price}>${price.toFixed(2)}</span>
        <span style={{
          ...styles.change,
          color: isPositive ? '#50fa7b' : '#ff5555' // Clean, standard green/red indicators
        }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
});

TickerRow.displayName = 'TickerRow';
// prices assumed may/ may not be accurate done solely to demostrate the assignments requirements
export default function Ticker() {
  const [displayData, setDisplayData] = useState({
    BTC: { name: 'Bitcoin', price: 64250.00, change: 1.25 },
    ETH: { name: 'Ethereum', price: 3450.00, change: -0.45 },
    SOL: { name: 'Solana', price: 142.50, change: 4.82 },
    AAPL: { name: 'Apple Inc.', price: 175.20, change: 0.15 },
    NVDA: { name: 'NVIDIA Corp.', price: 875.00, change: -2.31 },
  });

  const dataBufferRef = useRef({ ...displayData });
  const updateTimerRef = useRef(null);

  useEffect(() => {
    const mockDataStream = setInterval(() => {
      const symbols = ['BTC', 'ETH', 'SOL', 'AAPL', 'NVDA'];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      const currentAsset = dataBufferRef.current[randomSymbol];
      const priceChangePercent = (Math.random() - 0.49) * 0.8; // Random market movement
      const newPrice = currentAsset.price * (1 + priceChangePercent / 100);
      const newChange = currentAsset.change + priceChangePercent;

      dataBufferRef.current[randomSymbol] = {
        ...currentAsset,
        price: newPrice,
        change: newChange
      };
    }, 100);

    updateTimerRef.current = setInterval(() => {
      setDisplayData({ ...dataBufferRef.current });
    }, 300);

    return () => {
      clearInterval(mockDataStream);
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Live Trading Feed</h2>
          <p style={styles.subtitle}>UI Updates batched to 300ms | Data stream 100ms</p>
        </div>
        <div style={styles.statusContainer}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>LIVE</span>
        </div>
      </div>

      <div style={styles.list}>
        {Object.entries(displayData).map(([symbol, data]) => (
          <TickerRow
            key={symbol}
            symbol={symbol}
            name={data.name}
            price={data.price}
            change={data.change}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #30363d',
    paddingBottom: '15px',
    marginBottom: '10px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#f0f6fc',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '11px',
    color: '#8b949e',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#21262d',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #30363d',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#238636',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#238636',
    letterSpacing: '0.5px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #21262d',
  },
  assetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  symbol: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f0f6fc',
  },
  name: {
    fontSize: '12px',
    color: '#8b949e',
  },
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  price: {
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'Courier New, monospace',
    color: '#f0f6fc',
  },
  change: {
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'Courier New, monospace',
  },
};