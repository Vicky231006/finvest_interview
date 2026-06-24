import React from 'react';
import Ticker from './Ticker';

function App() {
  return (
    <div style={appStyles.wrapper}>
      <div style={appStyles.metaPanel}>
        <h1 style={appStyles.mainTitle}>For the interview</h1>
        <p style={appStyles.badge}>System Assignment: Question 1</p>
      </div>
      <Ticker />
    </div>
  );
}

const appStyles = {
  wrapper: {
    backgroundColor: '#0d1117', // Clean GitHub-style dark background
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  metaPanel: {
    textAlign: 'center',
    marginBottom: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  mainTitle: {
    color: '#f0f6fc',
    fontSize: '22px',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  badge: {
    color: '#8b949e',
    fontSize: '13px',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};

export default App;