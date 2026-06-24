import React, { useState } from 'react';

export default function SecurityPortal() {
  // Application Logs to simulate database collections and server responses
  const [database, setDatabase] = useState([]);
  const [serverLogs, setServerLogs] = useState([]);
  
  // Form input states
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [frontendError, setFrontendError] = useState('');

  // Handle standard input updates
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFrontendError('');
  };

  // --- SCENARIO A: THE VULNERABLE APPROACH (Bypassed by Attackers) ---
  const handleVulnerableSubmit = (e) => {
    e.preventDefault();
    
    // Frontend Validation Logic
    if (!formData.name || !formData.email.endsWith('.edu')) {
      setFrontendError('Frontend Block: You must provide a valid college (.edu) email address!');
      return;
    }

    // Simulate an unchecked frontend submission directly executing a write action
    const newRecord = {
      id: Math.random().toString(36).substr(2, 5),
      name: formData.name,
      email: formData.email,
      status: 'Registered (No Server Verification)'
    };

    setDatabase(prev => [newRecord, ...prev]);
    setServerLogs(prev => [`[WARN] Direct client-write accepted for user: ${formData.name}`, ...prev]);
    setFormData({ name: '', email: '' });
  };

  // SIMULATED HACK EXPLOIT: What happens when an attacker uses a script (or Postman/curl)
  const triggerBypassAttack = () => {
    setServerLogs(prev => ['[ATTACK] Injected automated script firing raw HTTP POST requests to backend endpoint directly...', ...prev]);
    
    // Generating 5 fast dummy entries skipping browser validation entirely
    const attacks = [
      { name: 'Fake User 1', email: 'hacker@attacker.com' },
      { name: 'Fake User 2', email: 'scam@botnet.org' },
      { name: 'Anonymous User', email: 'bypass@exploit.net' },
    ];

    attacks.forEach((fakeUser, index) => {
      setTimeout(() => {
        const hackedRecord = {
          id: `HACK-${index}`,
          name: fakeUser.name,
          email: fakeUser.email,
          status: '⚠️ Bypassed & Registered (Unsecured Backend)'
        };
        setDatabase(prev => [hackedRecord, ...prev]);
        setServerLogs(prev => [`[CRITICAL] Backend vulnerability exploited! Raw payload injected without gateway token verification for: ${fakeUser.name}`, ...prev]);
      }, index * 400);
    });
  };

  // --- SCENARIO B: THE SECURE MITIGATION ARCHITECTURE ---
  const handleSecureSubmit = (e) => {
    e.preventDefault();

    // 1. Client-side attempts request
    setServerLogs(prev => [`[INFO] Registration request received for verification parsing...`, ...prev]);

    // 2. Simulated Strict Server-Side Payload Validation Checks
    if (!formData.name || !formData.email.endsWith('.edu')) {
      setServerLogs(prev => [`[SECURITY REJECTION] Server-side validation failed. Payload structure rejected. Processing terminated.`, ...prev]);
      alert('Server Security Error: Request structure validation failed. Email signature invalid.');
      return;
    }

    // 3. Simulate Secure Webhook Verification Loop
    setServerLogs(prev => [
      `[WEBHOOK VERIFICATION] Re-computing cryptographic HMAC signature...`,
      `[WEBHOOK MATCH] Cryptographic signature matches. Payment payload origin confirmed. Verified via token check.`,
      `[SUCCESS] Safe database commit authorized.`,
      ...prev
    ]);

    const securedRecord = {
      id: Math.random().toString(36).substr(2, 5),
      name: formData.name,
      email: formData.email,
      status: '🔒 Securely Verified (Server-Enforced)'
    };

    setDatabase(prev => [securedRecord, ...prev]);
    setFormData({ name: '', email: '' });
  };

  const clearSystemData = () => {
    setDatabase([]);
    setServerLogs([]);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.badge}>SYSTEM SECURITY ARCHITECTURE</span>
        <h1 style={styles.title}>The Registration Loophole & Fix Sandbox</h1>
        <p style={styles.subtitle}>
          Understand how attackers ignore beautiful user interfaces to inject data directly into databases, and learn the architectural patterns required to stop them permanently.
        </p>
      </header>

      <div style={styles.workspaceGrid}>
        {/* LEFT COLUMN: INTERACTIVE FORM FORMS */}
        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Registration Interface</h2>
          <form style={styles.form}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="John Doe" 
              style={styles.input} 
            />

            <label style={styles.label}>College Email (Must end in .edu)</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="student@college.edu" 
              style={styles.input} 
            />

            {frontendError && <div style={styles.errorText}>{frontendError}</div>}

            <div style={styles.btnGroup}>
              <button onClick={handleVulnerableSubmit} style={{...styles.actionBtn, backgroundColor: '#ff5555', color: '#fff'}}>
                Submit (Vulnerable Form Architecture)
              </button>
              <button onClick={handleSecureSubmit} style={{...styles.actionBtn, backgroundColor: '#ccff00', color: '#0b0f19'}}>
                Submit (Secure Verified Architecture)
              </button>
            </div>
          </form>

          <div style={styles.attackDivider}>
            <span style={styles.dividerText}>SIMULATE AN ATTACK PIPELINE</span>
          </div>

          <button onClick={triggerBypassAttack} style={styles.exploitBtn}>
            🚨 Execute Exploit Script (Bypass Frontend Interface Completely)
          </button>
        </div>

        {/* RIGHT COLUMN: LIVE BACKEND STATE RUNTIME MONITOR */}
        <div style={styles.card}>
          <div style={styles.panelHeaderRow}>
            <h2 style={styles.sectionHeading}>System Live Sandbox Logs</h2>
            <button onClick={clearSystemData} style={styles.clearBtn}>Clear Logs</button>
          </div>
          <div style={styles.terminal}>
            {serverLogs.length === 0 ? (
              <span style={styles.emptyText}>System idle. Submit form items or deploy exploit simulation to view telemetry...</span>
            ) : (
              serverLogs.map((log, index) => (
                <div key={index} style={{
                  ...styles.logLine,
                  color: log.includes('CRITICAL') || log.includes('ATTACK') ? '#ff5555' : log.includes('SUCCESS') ? '#50fa7b' : '#ccff00'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>

          <h2 style={{...styles.sectionHeading, marginTop: '24px'}}>Database Registry (`UserTable`)</h2>
          <div style={styles.dbTableContainer}>
            {database.length === 0 ? (
              <span style={styles.emptyText}>Database empty. No registration transactions committed yet.</span>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email Source</th>
                    <th style={styles.th}>Status Block</th>
                  </tr>
                </thead>
                <tbody>
                  {database.map(user => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.td}>{user.id}</td>
                      <td style={{...styles.td, fontWeight: '600'}}>{user.name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={{
                        ...styles.td, 
                        color: user.status.includes('⚠️') ? '#ff5555' : user.status.includes('🔒') ? '#50fa7b' : '#f1fa8c'
                      }}>{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Low-flash monochrome dark styles with sharp red/green system diagnostics indicators
const styles = {
  container: {
    backgroundColor: '#0b0f19',
    minHeight: '100vh',
    color: '#f0f6fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 40px auto',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ff5555',
    letterSpacing: '1.5px',
    backgroundColor: 'rgba(255, 85, 85, 0.08)',
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 85, 85, 0.2)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginTop: '16px',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: 0,
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'left',
  },
  panelHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  clearBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #30363d',
    color: '#8b949e',
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sectionHeading: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#f0f6fc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    color: '#8b949e',
    marginBottom: '6px',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0b0f19',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '10px',
    color: '#f0f6fc',
    fontSize: '14px',
    marginBottom: '16px',
    outline: 'none',
  },
  errorText: {
    color: '#ff5555',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionBtn: {
    padding: '12px',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
  attackDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    fontSize: '11px',
    color: '#ff5555',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  exploitBtn: {
    width: '100%',
    backgroundColor: 'rgba(255, 85, 85, 0.05)',
    border: '1px dashed #ff5555',
    color: '#ff5555',
    padding: '14px',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  terminal: {
    backgroundColor: '#011627',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '16px',
    height: '180px',
    overflowY: 'auto',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  logLine: {
    marginBottom: '6px',
    textAlign: 'left',
  },
  dbTableContainer: {
    backgroundColor: '#0b0f19',
    border: '1px solid #30363d',
    borderRadius: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #30363d',
    backgroundColor: '#161b22',
  },
  th: {
    padding: '10px 12px',
    color: '#8b949e',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid #21262d',
  },
  td: {
    padding: '10px 12px',
    color: '#c9d1d9',
  },
};