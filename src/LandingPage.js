import React, { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [mode, setMode] = useState('portal'); // 'portal', 'beginner', 'developer'
  const containerRef = useRef(null);

  // Beginner Scene States
  const [demand, setDemand] = useState(50);
  const [roiDeposit, setRoiDeposit] = useState(10000);
  const [roiRate, setRoiRate] = useState(10);
  const [roiYears, setRoiYears] = useState(10);
  const [stockAlloc, setStockAlloc] = useState(60);
  const [crashSimulating, setCrashSimulating] = useState(false);
  const [crashResult, setCrashResult] = useState(null);
  const [leverage, setLeverage] = useState(1);
  const [marketMove, setMarketMove] = useState(5);
  const [inflationRate, setInflationRate] = useState(5);
  const [inflationYears, setInflationYears] = useState(10);

  // Developer Scene States
  const [replayAttack, setReplayAttack] = useState(false);
  const [handshakeLogs, setHandshakeLogs] = useState([]);
  const [handshakeLoading, setHandshakeLoading] = useState(false);
  const [wssPackets, setWssPackets] = useState([]);
  const [httpRequests, setHttpRequests] = useState([]);
  const [selectedGeo, setSelectedGeo] = useState('tokyo');
  const [backoffJitter, setBackoffJitter] = useState(true); // true = backoff + jitter, false = fixed
  const [backoffLogs, setBackoffLogs] = useState([]);
  const [backoffSimulating, setBackoffSimulating] = useState(false);
  const [hmacSecret, setHmacSecret] = useState('');

  // 1. Simulate real-time data packets for WSS vs HTTP scene
  useEffect(() => {
    if (mode !== 'developer') return;

    // WebSocket stream packets (continuous high-frequency ticks)
    const wssInterval = setInterval(() => {
      setWssPackets(prev => {
        const next = [
          {
            timestamp: new Date().toLocaleTimeString(),
            size: '2 bytes',
            latency: `${(10 + Math.random() * 8).toFixed(1)}ms`,
            payload: `{"price":${(45200 + Math.random() * 50).toFixed(2)}}`
          },
          ...prev
        ];
        return next.slice(0, 5);
      });
    }, 150);

    // HTTP polling requests (flashes every 1.5 seconds)
    const httpInterval = setInterval(() => {
      setHttpRequests(prev => {
        const next = [
          {
            timestamp: new Date().toLocaleTimeString(),
            method: 'GET',
            path: '/v1/ticker',
            size: '1.2 KB headers',
            latency: `${(140 + Math.random() * 60).toFixed(1)}ms`
          },
          ...prev
        ];
        return next.slice(0, 3);
      });
    }, 1500);

    return () => {
      clearInterval(wssInterval);
      clearInterval(httpInterval);
    };
  }, [mode]);

  // Handle scrolling navigation within tracks
  const handleScrollTo = (index) => {
    if (containerRef.current) {
      const targetSection = containerRef.current.children[index];
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleEnterMode = (selectedMode) => {
    setMode(selectedMode);
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }, 50);
  };

  // Run Beginner diversification simulation
  const runCrashSimulation = () => {
    setCrashSimulating(true);
    setCrashResult(null);
    setTimeout(() => {
      const stocks = stockAlloc;
      const bonds = Math.round((100 - stockAlloc) * 0.6);
      const gold = 100 - stocks - bonds;

      // Crash dynamics: Stocks plummet 45%, Bonds rise 5%, Gold rises 8%
      const delta = Math.round((stocks * -45 + bonds * 5 + gold * 8) / 100);
      setCrashResult({ stocks, bonds, gold, delta });
      setCrashSimulating(false);
    }, 1200);
  };

  // Run Developer Handshake API Request
  const runHandshake = () => {
    setHandshakeLoading(true);
    setHandshakeLogs([`$ curl -X POST https://api.finclub.cc/v1/transfer \\`]);
    
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(3, 10);
    
    setTimeout(() => {
      setHandshakeLogs(prev => [
        ...prev,
        `  -H "X-Timestamp: ${replayAttack ? timestamp - 300 : timestamp}" \\`,
        `  -H "X-Nonce: ${replayAttack ? 'reused_nonce_f89d' : nonce}"`,
        `Connecting to api.finclub.cc (18.204.12.92) on port 443...`,
        `TLS 1.3 Handshake completed successfully.`,
      ]);
    }, 400);

    setTimeout(() => {
      if (replayAttack) {
        setHandshakeLogs(prev => [
          ...prev,
          `HTTP/1.1 403 Forbidden`,
          `Content-Type: application/json`,
          `Cache-Control: no-cache`,
          `{`,
          `  "error": "REPLAY_ATTACK_DETECTED",`,
          `  "message": "Timestamp delta is 300s (limit: 15s) or Nonce has been reused."`,
          `}`
        ]);
      } else {
        setHandshakeLogs(prev => [
          ...prev,
          `HTTP/1.1 200 OK`,
          `Content-Type: application/json`,
          `{`,
          `  "status": "success",`,
          `  "transaction_id": "tx_${Math.random().toString(36).substring(2, 11)}",`,
          `  "timestamp": ${timestamp}`,
          `}`
        ]);
      }
      setHandshakeLoading(false);
    }, 1000);
  };

  // Run Developer Exponential Backoff simulation
  const runBackoffSimulation = () => {
    setBackoffSimulating(true);
    setBackoffLogs([`[15:44:00] ALERT: Upstream Payment Gateway returned 500 Internal Server Error.`]);

    const runAttempt = (attempt) => {
      if (attempt > 4) {
        setBackoffLogs(prev => [...prev, `[15:44:28] SUCCESS: Connection re-established. Traffic recovered.`]);
        setBackoffSimulating(false);
        return;
      }

      // Calculate time: base 2^attempt
      const base = Math.pow(2, attempt);
      const jitterVal = backoffJitter ? Number((Math.random() * 0.8).toFixed(2)) : 0;
      const delay = base + jitterVal;

      setTimeout(() => {
        setBackoffLogs(prev => [
          ...prev,
          `[15:44:${(12 + base).toString().padStart(2, '0')}] Attempt #${attempt}: Failed (503 Service Unavailable).` +
          ` Retrying in ${delay.toFixed(2)}s (base ${base}s${backoffJitter ? ` + jitter ${jitterVal}s` : ''})`
        ]);
        runAttempt(attempt + 1);
      }, delay * 500); // speed up simulation slightly for better UX
    };

    setTimeout(() => runAttempt(1), 800);
  };

  return (
    <div style={styles.pageContainer}>
      <style>{animations}</style>

      {/* PORTAL / SPLIT SCREEN (Scene 0) */}
      {mode === 'portal' && (
        <div style={styles.portalContainer}>
          {/* Left Side: Beginner */}
          <div 
            onClick={() => handleEnterMode('beginner')} 
            style={styles.portalLeft}
            className="portal-pane"
          >
            <div style={styles.portalContent}>
              <div style={styles.portalBadge}>🌱 LEARN WEALTH</div>
              <h2 style={styles.portalTitle}>Explore</h2>
              <p style={styles.portalText}>
                Demystify financial concepts without the spreadsheets. Learn compounding, risk management, and market pricing through high-energy visual tools.
              </p>
              <button style={styles.portalBtnBeginner}>Get Started →</button>
            </div>
          </div>

          {/* Right Side: Developer */}
          <div 
            onClick={() => handleEnterMode('developer')} 
            style={styles.portalRight}
            className="portal-pane"
          >
            <div style={styles.portalContent}>
              <div style={styles.portalBadgeDev}>⚡ API GATEWAY</div>
              <h2 style={styles.portalTitleDev}>Dev Stack</h2>
              <p style={styles.portalTextDev}>
                Production sandbox pipelines. Explore security, real-time data streaming, global edge latencies, and high-density financial infrastructure.
              </p>
              <button style={styles.portalBtnDeveloper}>Connect Console →</button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLING TRACKS */}
      {mode !== 'portal' && (
        <div style={styles.trackWrapper}>
          {/* Subtle exit back to portal */}
          <button onClick={() => setMode('portal')} style={styles.exitBtn}>
            ← Exit to Portal
          </button>

          <div ref={containerRef} className="snap-container">
            
            {/* BEGINNER TRACK */}
            {mode === 'beginner' && (
              <>
                {/* Scene 1: Trend Dynamics */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicator}>Scene 01 / 06</span>
                      <h2 style={styles.sceneTitle}>Trend Dynamics</h2>
                      <p style={styles.sceneDesc}>
                        Asset prices aren't magic. They respond to a simple tug-of-war between <strong>Buyers (Demand)</strong> and <strong>Sellers (Supply)</strong>.
                      </p>
                      <p style={styles.sceneExplanation}>
                        When buying pressure increases, demand outpaces supply, driving the price upward. Adjust the slider to see how price and volume indicators react.
                      </p>
                      <div style={styles.sliderContainer}>
                        <label style={styles.sliderLabel}>
                          <span>Sellers (Supply)</span>
                          <span>Buyers (Demand)</span>
                        </label>
                        <input 
                          type="range" 
                          min="10" 
                          max="90" 
                          value={demand} 
                          onChange={(e) => setDemand(Number(e.target.value))}
                          style={styles.rangeInput}
                        />
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCard}>
                        <h3 style={styles.cardHeader}>Market Value Trend</h3>
                        
                        {/* Real Stock Market Line Chart Simulation */}
                        {(() => {
                          const chartColor = demand > 50 ? '#ccff00' : demand < 50 ? '#ff5555' : '#8b949e';
                          // Dynamic final coordinate Y based on demand slider (10 to 90 range)
                          const targetY = 100 - (demand - 10) * 0.95; // higher demand -> lower Y (which is higher up on viewport coords)
                          
                          return (
                            <div style={styles.chartWrapper}>
                              <svg viewBox="0 0 240 120" style={styles.svgChart}>
                                <defs>
                                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColor} stopOpacity="0.25" />
                                    <stop offset="100%" stopColor={chartColor} stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                
                                {/* Grid Lines */}
                                <line x1="10" y1="25" x2="230" y2="25" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="10" y1="55" x2="230" y2="55" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="10" y1="85" x2="230" y2="85" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="65" y1="10" x2="65" y2="110" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="120" y1="10" x2="120" y2="110" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="175" y1="10" x2="175" y2="110" stroke="#1f293d" strokeWidth="1" strokeDasharray="3,3" />
                                
                                {/* Gradient Under-fill */}
                                <path 
                                  d={`M 10 110 L 10 80 L 40 75 L 75 92 L 110 60 L 145 74 L 180 50 L 210 85 L 230 ${targetY} L 230 110 Z`} 
                                  fill="url(#chartGradient)"
                                  style={{ transition: 'd 0.15s ease-out' }}
                                />
                                
                                {/* Line Path */}
                                <path 
                                  d={`M 10 80 L 40 75 L 75 92 L 110 60 L 145 74 L 180 50 L 210 85 L 230 ${targetY}`} 
                                  fill="none" 
                                  stroke={chartColor} 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round"
                                  className="chart-line"
                                  style={{ transition: 'd 0.15s ease-out' }}
                                />
                                
                                {/* Pulsing final node */}
                                <circle 
                                  cx="230" 
                                  cy={targetY} 
                                  r="4.5" 
                                  fill={chartColor} 
                                  className="pulse-dot" 
                                  style={{ transition: 'cy 0.15s ease-out' }}
                                />
                              </svg>
                            </div>
                          );
                        })()}

                        <div style={styles.priceTicker}>
                          <span>Live Estimate:</span>
                          <span style={{
                            color: demand > 50 ? '#ccff00' : demand < 50 ? '#ff5555' : '#f0f6fc',
                            fontWeight: '800'
                          }}>
                            ₹{Math.round(150 + (demand - 50) * 1.8)}
                          </span>
                        </div>
                        <div style={styles.indicatorText}>
                          {demand > 50 ? '🌱 Bullish: Demand Excess' : demand < 50 ? '🔴 Bearish: Supply Excess' : 'Equilibrium'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(1)} style={styles.nextArrow}>Scroll Down ↓</button>
                </section>

                {/* Scene 2: ROI Calculator */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicator}>Scene 02 / 06</span>
                      <h2 style={styles.sceneTitle}>ROI & Compounding</h2>
                      <p style={styles.sceneDesc}>
                        How does money grow over time? <strong>ROI (Return on Investment)</strong> measures gains. Compounding multiplies it.
                      </p>
                      <p style={styles.sceneExplanation}>
                        When you reinvest interest gains, they begin earning interest on themselves. This creates exponential growth over long horizons.
                      </p>
                      
                      <div style={styles.slidersBlock}>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Initial Deposit</span>
                            <span style={styles.limeVal}>₹{roiDeposit.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="5000" max="100000" step="5000" value={roiDeposit} 
                            onChange={(e) => setRoiDeposit(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Annual Yield (%)</span>
                            <span style={styles.limeVal}>{roiRate}%</span>
                          </div>
                          <input 
                            type="range" min="4" max="24" step="1" value={roiRate} 
                            onChange={(e) => setRoiRate(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Time Horizon</span>
                            <span style={styles.limeVal}>{roiYears} Years</span>
                          </div>
                          <input 
                            type="range" min="1" max="30" step="1" value={roiYears} 
                            onChange={(e) => setRoiYears(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCard}>
                        <h3 style={styles.cardHeader}>Compounded Projections</h3>
                        {(() => {
                          const totalVal = Math.round(roiDeposit * Math.pow(1 + roiRate / 100, roiYears));
                          const profit = totalVal - roiDeposit;
                          const yieldPercent = Math.round((profit / roiDeposit) * 100);
                          
                          // Dynamic bar height sizing calculation with a safe ceiling scale (max height 80px)
                          // Base height is 20px (representing deposit); compound growth stretches it up to 80px max.
                          const minBarHeight = 20;
                          const maxBarHeight = 80;
                          const dynamicHeight = Math.min(
                            minBarHeight + (yieldPercent / 400) * (maxBarHeight - minBarHeight),
                            maxBarHeight
                          );

                          return (
                            <div style={styles.calcResults}>
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabel}>Total Invested:</span>
                                <span style={styles.resultValue}>₹{roiDeposit.toLocaleString()}</span>
                              </div>
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabel}>Compounded Gains:</span>
                                <span style={{...styles.resultValue, color: '#ccff00'}}>+₹{profit.toLocaleString()}</span>
                              </div>
                              <div style={styles.divider} />
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabelTotal}>Future Portfolio:</span>
                                <span style={styles.resultValueTotal}>₹{totalVal.toLocaleString()}</span>
                              </div>
                              
                              <div style={styles.graphPreview}>
                                <div style={{
                                  ...styles.growthBar, 
                                  height: '20px', 
                                  backgroundColor: '#30363d'
                                }}>
                                  <span style={styles.barMiniLabel}>Seed</span>
                                </div>
                                <div style={{
                                  ...styles.growthBar, 
                                  height: `${dynamicHeight}px`, 
                                  backgroundColor: '#ccff00',
                                  boxShadow: '0 0 15px rgba(204, 255, 0, 0.2)',
                                  transition: 'height 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                                }}>
                                  <span style={{...styles.barMiniLabel, color: '#0b0f19'}}>+{yieldPercent}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(2)} style={styles.nextArrow}>Scroll Down ↓</button>
                </section>

                {/* Scene 3: Risk Diversification */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicator}>Scene 03 / 06</span>
                      <h2 style={styles.sceneTitle}>Risk Allocation</h2>
                      <p style={styles.sceneDesc}>
                        Diversification is the ultimate safeguard. Systemic crashes hit specific assets differently.
                      </p>
                      <p style={styles.sceneExplanation}>
                        Bonds and Gold often move counter to Stocks. By splitting your money, you protect yourself from catastrophic market failures.
                      </p>

                      <div style={styles.sliderControl}>
                        <div style={styles.sliderHeader}>
                          <span>High-Risk Stocks Ratio</span>
                          <span style={styles.limeVal}>{stockAlloc}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={stockAlloc} 
                          onChange={(e) => {
                            setStockAlloc(Number(e.target.value));
                            setCrashResult(null);
                          }}
                          style={styles.rangeInput}
                        />
                      </div>
                      
                      <button 
                        onClick={runCrashSimulation} 
                        style={styles.simulationBtn}
                        disabled={crashSimulating}
                      >
                        {crashSimulating ? 'Simulating Crash...' : '⚡ Trigger Market Crash'}
                      </button>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCard}>
                        <h3 style={styles.cardHeader}>Asset Mix Preview</h3>
                        <div style={styles.allocLegend}>
                          <span style={styles.badgeStocks}>Stocks: {stockAlloc}%</span>
                          <span style={styles.badgeBonds}>Bonds: {Math.round((100 - stockAlloc) * 0.6)}%</span>
                          <span style={styles.badgeGold}>Gold: {100 - stockAlloc - Math.round((100 - stockAlloc) * 0.6)}%</span>
                        </div>

                        {crashResult ? (
                          <div style={styles.simulationReport}>
                            <h4 style={styles.reportTitle}>Market Shock Output:</h4>
                            <div style={{
                              ...styles.performanceAlert,
                              borderColor: crashResult.delta < -20 ? '#ff5555' : '#ccff00',
                              backgroundColor: crashResult.delta < -20 ? 'rgba(255, 85, 85, 0.05)' : 'rgba(204, 255, 0, 0.05)'
                            }}>
                              <span style={styles.reportText}>Portfolio Performance:</span>
                              <span style={{
                                ...styles.reportValue,
                                color: crashResult.delta < -20 ? '#ff5555' : '#ccff00'
                              }}>{crashResult.delta}%</span>
                            </div>
                            <p style={styles.reportContext}>
                              {crashResult.delta < -20 
                                ? "Critical Loss. Your heavy stock concentration offered no fallback buffers."
                                : "Buffered. Non-correlated hedges (Bonds/Gold) absorbed the stocks drop."
                              }
                            </p>
                          </div>
                        ) : (
                          <div style={styles.awaitingSim}>
                            Awaiting market event... Click the trigger to run.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(3)} style={styles.nextArrow}>Scroll Down ↓</button>
                </section>

                {/* Scene 4: Leverage & Liquidity */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicator}>Scene 04 / 06</span>
                      <h2 style={styles.sceneTitle}>Leverage Limits</h2>
                      <p style={styles.sceneDesc}>
                        Leverage means borrowing money to trade larger volumes. It multiplies outcomes both ways.
                      </p>
                      <p style={styles.sceneExplanation}>
                        At <strong>10x leverage</strong>, a tiny 10% move against you results in a <strong>100% loss</strong>—complete liquidation.
                      </p>

                      <div style={styles.slidersBlock}>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Leverage Multiplier</span>
                            <span style={styles.limeVal}>{leverage}x</span>
                          </div>
                          <input 
                            type="range" min="1" max="10" step="1" value={leverage} 
                            onChange={(e) => setLeverage(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Market Movement</span>
                            <span style={styles.limeVal}>{marketMove}%</span>
                          </div>
                          <input 
                            type="range" min="-15" max="15" step="1" value={marketMove} 
                            onChange={(e) => setMarketMove(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCard}>
                        <h3 style={styles.cardHeader}>Liquidation Boundary</h3>
                        {(() => {
                          const netYield = leverage * marketMove;
                          const isLiquidated = netYield <= -100;

                          return (
                            <div style={styles.leverageMonitor}>
                              <div style={styles.gaugeContainer}>
                                <div style={{
                                  ...styles.gaugeFilled,
                                  width: `${Math.min(Math.max(netYield + 100, 0), 200) / 2}%`,
                                  backgroundColor: isLiquidated ? '#ff5555' : netYield >= 0 ? '#ccff00' : '#ff9900'
                                }} />
                              </div>
                              <div style={styles.gaugeLabels}>
                                <span>-100% (Wiped Out)</span>
                                <span>0%</span>
                                <span>+100%</span>
                              </div>

                              <div style={{
                                ...styles.outcomeCard,
                                borderColor: isLiquidated ? '#ff5555' : '#30363d'
                              }}>
                                <div style={styles.outcomeRow}>
                                  <span>Asset Position:</span>
                                  <span>{marketMove >= 0 ? `+${marketMove}%` : `${marketMove}%`}</span>
                                </div>
                                <div style={styles.outcomeRow}>
                                  <span>Leveraged Return:</span>
                                  <span style={{
                                    color: isLiquidated ? '#ff5555' : netYield >= 0 ? '#ccff00' : '#ff9900',
                                    fontWeight: '800'
                                  }}>
                                    {isLiquidated ? 'LIQUIDATED (-100%)' : `${netYield >= 0 ? '+' : ''}${netYield}%`}
                                  </span>
                                </div>
                              </div>

                              {leverage >= 6 && !isLiquidated && (
                                <div style={styles.leverageWarning}>
                                  ⚠️ HIGH RISK: A small market dip will trigger automatic liquidation.
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(4)} style={styles.nextArrow}>Scroll Down ↓</button>
                </section>

                {/* Scene 5: Inflation Erosion (NEW SCENE) */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicator}>Scene 05 / 06</span>
                      <h2 style={styles.sceneTitle}>Inflation Erosion</h2>
                      <p style={styles.sceneDesc}>
                        Inflation is the silent tax. Idle cash stored under a mattress loses purchasing power every single year.
                      </p>
                      <p style={styles.sceneExplanation}>
                        When prices rise, your cash stays the same numeric value, but buys fewer physical assets. Adjust average inflation rates and years to see cash melt:
                      </p>

                      <div style={styles.slidersBlock}>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Average Annual Inflation</span>
                            <span style={styles.limeVal}>{inflationRate}%</span>
                          </div>
                          <input 
                            type="range" min="2" max="12" step="0.5" value={inflationRate} 
                            onChange={(e) => setInflationRate(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                        <div style={styles.sliderControl}>
                          <div style={styles.sliderHeader}>
                            <span>Duration</span>
                            <span style={styles.limeVal}>{inflationYears} Years</span>
                          </div>
                          <input 
                            type="range" min="1" max="20" step="1" value={inflationYears} 
                            onChange={(e) => setInflationYears(Number(e.target.value))}
                            style={styles.rangeInput}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCard}>
                        <h3 style={styles.cardHeader}>Purchasing Power Impact</h3>
                        {(() => {
                          const baseCash = 10000;
                          const powerValue = Math.round(baseCash / Math.pow(1 + inflationRate / 100, inflationYears));
                          const difference = baseCash - powerValue;
                          const relativeScale = Math.max(0.45, powerValue / baseCash);

                          return (
                            <div style={styles.calcResults}>
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabel}>Starting Cash:</span>
                                <span style={styles.resultValue}>₹{baseCash.toLocaleString()}</span>
                              </div>
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabel}>Value Lost:</span>
                                <span style={{...styles.resultValue, color: '#ff5555'}}>-₹{difference.toLocaleString()}</span>
                              </div>
                              <div style={styles.divider} />
                              <div style={styles.resultRow}>
                                <span style={styles.resultLabelTotal}>Future Value:</span>
                                <span style={{...styles.resultValueTotal, color: '#ff9900'}}>₹{powerValue.toLocaleString()}</span>
                              </div>

                              <div style={styles.inflationVisualBox}>
                                {/* Shrinking Cart Icon SVG */}
                                <div style={{
                                  ...styles.cartContainer,
                                  transform: `scale(${relativeScale})`,
                                  transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                                }}>
                                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ccff00" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                  </svg>
                                  <span style={styles.cartIconLabel}>Buying Capacity</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(5)} style={styles.nextArrow}>Scroll Down ↓</button>
                </section>

                {/* Scene 6: Crossover Gateway */}
                <section className="snap-section">
                  <div style={styles.crossoverCard}>
                    <span style={styles.badgeStocks}>Milestone Completed</span>
                    <h2 style={styles.crossoverTitle}>Basics Demystified.</h2>
                    <p style={styles.crossoverDesc}>
                      You have learned how demand sets pricing, how compound yields accrue, how hedging mitigates risk, the lethal math of leverage, and how inflation melts idle capital.
                    </p>
                    <p style={styles.crossoverText}>
                      Ready for production engineering? Enter the developer tracks to see how code secures these pipelines.
                    </p>
                    <button 
                      onClick={() => handleEnterMode('developer')} 
                      style={styles.crossoverBtn}
                    >
                      Connect Console →
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* DEVELOPER TRACK */}
            {mode === 'developer' && (
              <>
                {/* Scene 1: API Handshake & Header Auth */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicatorDev}>Module 01 / 05</span>
                      <h2 style={styles.sceneTitleDev}>Replay Prevention</h2>
                      <p style={styles.sceneDesc}>
                        HTTP endpoints are public. Attackers can capture a valid transfer request and re-send it (a replay attack).
                      </p>
                      <p style={styles.sceneExplanation}>
                        We secure pipelines by verifying a timestamp header (max 15s latency) and a single-use token (Nonce) tracked in memory.
                      </p>

                      <div style={styles.interactiveControlsDev}>
                        <label style={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={replayAttack} 
                            onChange={(e) => setReplayAttack(e.target.checked)} 
                            style={styles.checkboxInput}
                          />
                          <span>Simulate Replay Attack (5-minute old header)</span>
                        </label>

                        <button 
                          onClick={runHandshake} 
                          style={styles.devConsoleBtn}
                          disabled={handshakeLoading}
                        >
                          {handshakeLoading ? 'Executing Header Handshake...' : '$ Run Curl Request'}
                        </button>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.terminalWindow}>
                        <div style={styles.terminalHeader}>
                          <div style={styles.termDots}>
                            <span style={{...styles.termDot, backgroundColor: '#ff5555'}} />
                            <span style={{...styles.termDot, backgroundColor: '#f1fa8c'}} />
                            <span style={{...styles.termDot, backgroundColor: '#50fa7b'}} />
                          </div>
                          <span style={styles.terminalTitle}>gateway_headers.sh</span>
                        </div>
                        <div style={styles.terminalBody}>
                          {handshakeLogs.length === 0 ? (
                            <p style={styles.termPlaceholder}>Run Curl Request to generate trace...</p>
                          ) : (
                            handshakeLogs.map((log, index) => (
                              <p key={index} style={{
                                ...styles.termLine,
                                color: log.includes('200 OK') ? '#50fa7b' : log.includes('403 Forbidden') ? '#ff5555' : '#addb67'
                              }}>{log}</p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(1)} style={styles.nextArrowDev}>Next Module ↓</button>
                </section>

                {/* Scene 2: WSS Streaming vs. HTTP Polling */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicatorDev}>Module 02 / 05</span>
                      <h2 style={styles.sceneTitleDev}>WSS vs HTTP Polling</h2>
                      <p style={styles.sceneDesc}>
                        High-frequency streams demand socket optimization. HTTP polling incurs heavy network slippage.
                      </p>
                      <p style={styles.sceneExplanation}>
                        WebSockets open a single persistent TCP connection. Standard HTTP GET requests require repeated TLS handshakes and socket bindings.
                      </p>

                      <div style={styles.sideComparison}>
                        <div style={styles.compBox}>
                          <h4 style={styles.compBoxTitle}>HTTP Polling</h4>
                          <div style={styles.latencyLabel}>Latency: ~180ms</div>
                          <div style={styles.sizeLabel}>Header Cost: 1.2 KB / hit</div>
                        </div>
                        <div style={styles.compBoxActive}>
                          <h4 style={styles.compBoxTitleDev}>Persistent WSS</h4>
                          <div style={styles.latencyLabelDev}>Latency: ~12ms</div>
                          <div style={styles.sizeLabelDev}>Payload Cost: 2 bytes / packet</div>
                        </div>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.splitTerminalContainer}>
                        {/* WSS Live Shell */}
                        <div style={styles.miniTerminal}>
                          <div style={styles.miniTermHeader}>wss://stream.finclub.cc</div>
                          <div style={styles.miniTermBody}>
                            {wssPackets.map((pkt, i) => (
                              <div key={i} style={styles.wssPacketLine}>
                                <span style={styles.timestampSpan}>[{pkt.timestamp}]</span>
                                <span style={styles.badgeWss}>WSS</span>
                                <span style={styles.latencySpan}>{pkt.latency}</span>
                                <code>{pkt.payload}</code>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* HTTP Log Shell */}
                        <div style={styles.miniTerminal}>
                          <div style={styles.miniTermHeader}>HTTP REST Polls</div>
                          <div style={styles.miniTermBody}>
                            {httpRequests.map((req, i) => (
                              <div key={i} style={styles.httpReqLine}>
                                <span style={styles.timestampSpan}>[{req.timestamp}]</span>
                                <span style={styles.badgeHttp}>{req.method}</span>
                                <code>{req.path}</code>
                                <span style={styles.overheadSpan}>({req.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(2)} style={styles.nextArrowDev}>Next Module ↓</button>
                </section>

                {/* Scene 3: Geo-Routing & Jitter */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicatorDev}>Module 03 / 05</span>
                      <h2 style={styles.sceneTitleDev}>Geo-Routing latency</h2>
                      <p style={styles.sceneDesc}>
                        Server physical location dictates connection speed. Latency delays cause execution slippage.
                      </p>
                      <p style={styles.sceneExplanation}>
                        By routing traffic to serverless edge nodes near the client, we minimize network hops. Pick an active edge location to simulate slippage rates:
                      </p>

                      <div style={styles.geoSelectors}>
                        {['tokyo', 'frankfurt', 'london', 'oregon'].map((geo) => (
                          <button 
                            key={geo} 
                            onClick={() => setSelectedGeo(geo)}
                            style={{
                              ...styles.geoButton,
                              borderColor: selectedGeo === geo ? '#ccff00' : '#30363d',
                              backgroundColor: selectedGeo === geo ? '#1f293d' : '#161b22',
                              color: selectedGeo === geo ? '#ccff00' : '#8b949e'
                            }}
                          >
                            {geo.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCardDev}>
                        <h3 style={styles.cardHeaderDev}>Edge Node Performance</h3>
                        {(() => {
                          const nodes = {
                            tokyo: { ping: 8, hops: 2, slippage: 0.02, desc: "Local database replica node matches client region instantly." },
                            frankfurt: { ping: 145, hops: 12, slippage: 0.45, desc: "Transcontinental route limits packet speed via fibre delays." },
                            london: { ping: 110, hops: 9, slippage: 0.32, desc: "Atlantic underwater routing increases transaction latency." },
                            oregon: { ping: 190, hops: 14, slippage: 0.65, desc: "Pacific packet travel creates significant queue slippage." }
                          };
                          const data = nodes[selectedGeo];

                          return (
                            <div style={styles.nodeStats}>
                              <div style={styles.statsRow}>
                                <span>Gateway Ping RTT:</span>
                                <span style={styles.statsValueDev}>{data.ping} ms</span>
                              </div>
                              <div style={styles.statsRow}>
                                <span>Network Hops:</span>
                                <span style={styles.statsValueDev}>{data.hops} hops</span>
                              </div>
                              <div style={styles.statsRow}>
                                <span>Estimated Price Slippage:</span>
                                <span style={{
                                  ...styles.statsValueDev,
                                  color: data.slippage > 0.3 ? '#ff5555' : '#ccff00'
                                }}>{(data.slippage * 100).toFixed(2)}%</span>
                              </div>
                              <div style={styles.nodeDescCard}>
                                {data.desc}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(3)} style={styles.nextArrowDev}>Next Module ↓</button>
                </section>

                {/* Scene 4: Retry Backoff with Jitter */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicatorDev}>Module 04 / 05</span>
                      <h2 style={styles.sceneTitleDev}>Exponential Jitter</h2>
                      <p style={styles.sceneDesc}>
                        When servers crash, client SDKs must avoid flooding them instantly upon recovery.
                      </p>
                      <p style={styles.sceneExplanation}>
                        We use exponential backoff (<code style={{color: '#ccff00'}}>T = 2^attempt</code>) padded with randomized jitter. This flattens peak load spikes.
                      </p>

                      <div style={styles.interactiveControlsDev}>
                        <label style={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={backoffJitter} 
                            onChange={(e) => {
                              setBackoffJitter(e.target.checked);
                              setBackoffLogs([]);
                            }} 
                            style={styles.checkboxInput}
                          />
                          <span>Inject Random Noise (Jitter)</span>
                        </label>

                        <button 
                          onClick={runBackoffSimulation} 
                          style={styles.devConsoleBtn}
                          disabled={backoffSimulating}
                        >
                          {backoffSimulating ? 'Simulating Fault Recovery...' : '⚡ Trigger Server Failure'}
                        </button>
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.terminalWindow}>
                        <div style={styles.terminalHeader}>
                          <div style={styles.termDots}>
                            <span style={{...styles.termDot, backgroundColor: '#ff5555'}} />
                            <span style={{...styles.termDot, backgroundColor: '#f1fa8c'}} />
                            <span style={{...styles.termDot, backgroundColor: '#50fa7b'}} />
                          </div>
                          <span style={styles.terminalTitle}>backoff_retry_stream.log</span>
                        </div>
                        <div style={styles.terminalBody}>
                          {backoffLogs.length === 0 ? (
                            <p style={styles.termPlaceholder}>Trigger server failure to trace retries...</p>
                          ) : (
                            backoffLogs.map((log, index) => (
                              <p key={index} style={{
                                ...styles.termLine,
                                color: log.includes('SUCCESS') ? '#50fa7b' : log.includes('ALERT') ? '#ff5555' : '#addb67',
                                fontFamily: 'monospace',
                                fontSize: '12px'
                              }}>{log}</p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleScrollTo(4)} style={styles.nextArrowDev}>Next Module ↓</button>
                </section>

                {/* Scene 5: HMAC-SHA256 Payload Signature Verification */}
                <section className="snap-section">
                  <div style={styles.layout2Col}>
                    <div style={styles.textCol}>
                      <span style={styles.stepIndicatorDev}>Module 05 / 05</span>
                      <h2 style={styles.sceneTitleDev}>Payload Validation</h2>
                      <p style={styles.sceneDesc}>
                        Securing webhooks. Since event notification hooks are public routes, receivers must authenticate signatures.
                      </p>
                      <p style={styles.sceneExplanation}>
                        We compute a symmetric signature hash using SHA256 against a shared secret key. Type the correct secret (<code style={{color: '#ccff00'}}>fin_sec_key_123</code>) to authenticate:
                      </p>

                      <div style={styles.inputControlDev}>
                        <label style={styles.inputLabelDev}>Symmetric Webhook Secret Key</label>
                        <input 
                          type="text" 
                          placeholder="Type webhook secret..." 
                          value={hmacSecret} 
                          onChange={(e) => setHmacSecret(e.target.value)} 
                          style={styles.textInputDev}
                        />
                      </div>
                    </div>
                    <div style={styles.visualCol}>
                      <div style={styles.interactiveCardDev}>
                        <h3 style={styles.cardHeaderDev}>HMAC HMAC-SHA256 Signature</h3>
                        
                        <div style={styles.codePayloadBox}>
                          <div style={styles.payloadHeader}>Webhook JSON Payload</div>
                          <pre style={styles.payloadPre}>
{`{
  "event": "charge.successful",
  "amount": 250000,
  "currency": "INR"
}`}
                          </pre>
                        </div>

                        <div style={styles.signatureResultBox}>
                          <div style={styles.sigTitle}>Generated Payload Hash:</div>
                          <code style={styles.sigCode}>
                            {hmacSecret === 'fin_sec_key_123' 
                              ? '4a8f9d0c2e379b8a5d11234c9cde882b5f7e8a9d0c2b' 
                              : hmacSecret.length > 0 
                                ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                                : '[Awaiting Secret Key]'
                            }
                          </code>

                          {hmacSecret === 'fin_sec_key_123' ? (
                            <div style={styles.verifSuccess}>
                              ✓ SIGNATURE VALID (200 OK)
                            </div>
                          ) : hmacSecret.length > 0 ? (
                            <div style={styles.verifFailed}>
                              ✗ INVALID SIGNATURE (401 Unauthorized)
                            </div>
                          ) : (
                            <div style={styles.verifPending}>
                              Enter key to run cryptographic validation.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Crossover Gateway to return to Explore */}
                  <div style={styles.devFinishFooter}>
                    <button 
                      onClick={() => handleEnterMode('beginner')} 
                      style={styles.crossoverBtnDev}
                    >
                      ← Return to Explore Track
                    </button>
                  </div>
                </section>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Pure CSS Animations for client runtime injection
// -------------------------------------------------------------
const animations = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes drawChartLine {
    from { stroke-dashoffset: 400; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes pulseOpacity {
    from { opacity: 0.4; }
    to { opacity: 1; }
  }
  .snap-container {
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    background-color: #0b0f19;
    color: #f0f6fc;
    width: 100vw;
  }
  .snap-section {
    height: 100vh;
    width: 100vw;
    scroll-snap-align: start;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 60px 40px;
  }
  .portal-pane {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
    box-sizing: border-box;
  }
  .portal-pane:hover {
    flex: 1.25;
  }
  .portal-pane:hover button {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(204, 255, 0, 0.4);
  }
  .chart-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: drawChartLine 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
  .pulse-dot {
    animation: pulseOpacity 1.2s infinite alternate;
  }
  .snap-container::-webkit-scrollbar {
    width: 6px;
  }
  .snap-container::-webkit-scrollbar-track {
    background: #0b0f19;
  }
  .snap-container::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 3px;
  }
  .snap-container::-webkit-scrollbar-thumb:hover {
    background: #ccff00;
  }
`;

// -------------------------------------------------------------
// Component Styles System using the Neon Ledger tokens
// -------------------------------------------------------------
const styles = {
  pageContainer: {
    backgroundColor: '#0b0f19',
    minHeight: '100vh',
    width: '100vw',
    color: '#f0f6fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    position: 'relative',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box'
  },
  portalContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#0b0f19'
  },
  portalLeft: {
    backgroundColor: '#0b0f19',
    borderRight: '1px solid #30363d',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  portalRight: {
    backgroundColor: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  portalContent: {
    maxWidth: '440px',
    textAlign: 'center',
    animation: 'fadeInUp 0.6s ease'
  },
  portalBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#ccff00',
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
    border: '1px solid rgba(204, 255, 0, 0.2)',
    padding: '6px 14px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  portalBadgeDev: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#50fa7b',
    backgroundColor: 'rgba(80, 250, 123, 0.05)',
    border: '1px solid rgba(80, 250, 123, 0.2)',
    padding: '6px 14px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  portalTitle: {
    fontSize: '44px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-1px'
  },
  portalTitleDev: {
    fontSize: '44px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
    fontFamily: 'monospace'
  },
  portalText: {
    fontSize: '15px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: '0 0 32px 0'
  },
  portalTextDev: {
    fontSize: '15px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
    fontFamily: 'monospace'
  },
  portalBtnBeginner: {
    backgroundColor: '#ccff00',
    color: '#0b0f19',
    border: 'none',
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },
  portalBtnDeveloper: {
    backgroundColor: '#50fa7b',
    color: '#0b0f19',
    border: 'none',
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontFamily: 'monospace'
  },
  trackWrapper: {
    position: 'relative',
    height: '100vh',
    width: '100vw'
  },
  exitBtn: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 100,
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    color: '#8b949e',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  layout2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    width: '100%',
    maxWidth: '1100px',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  textCol: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column'
  },
  stepIndicator: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ccff00',
    letterSpacing: '1px',
    marginBottom: '10px'
  },
  stepIndicatorDev: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#50fa7b',
    letterSpacing: '1px',
    marginBottom: '10px',
    fontFamily: 'monospace'
  },
  sceneTitle: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-1px'
  },
  sceneTitleDev: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
    fontFamily: 'monospace'
  },
  sceneDesc: {
    fontSize: '18px',
    color: '#f0f6fc',
    lineHeight: '1.5',
    margin: '0 0 12px 0'
  },
  sceneExplanation: {
    fontSize: '14px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: '0 0 30px 0',
    maxWidth: '480px'
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#8b949e',
    fontWeight: '600'
  },
  rangeInput: {
    width: '100%',
    height: '6px',
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '4px',
    outline: 'none',
    WebkitAppearance: 'none'
  },
  visualCol: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  interactiveCard: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '14px',
    padding: '30px',
    width: '100%',
    maxWidth: '440px',
    minHeight: '280px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'left'
  },
  interactiveCardDev: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '30px',
    width: '100%',
    maxWidth: '460px',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  cardHeader: {
    margin: '0 0 20px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cardHeaderDev: {
    margin: '0 0 20px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'monospace'
  },
  chartWrapper: {
    height: '110px',
    borderBottom: '2px solid #30363d',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  svgChart: {
    width: '100%',
    height: '100%',
    display: 'block'
  },
  priceTicker: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    padding: '12px 0',
    borderBottom: '1px solid #30363d'
  },
  indicatorText: {
    fontSize: '12px',
    color: '#8b949e',
    marginTop: '12px',
    fontWeight: '600'
  },
  slidersBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sliderControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#f0f6fc',
    fontWeight: '600'
  },
  limeVal: {
    color: '#ccff00',
    fontWeight: '700'
  },
  calcResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    justifyContent: 'center'
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  resultLabel: {
    color: '#8b949e'
  },
  resultValue: {
    fontWeight: '600'
  },
  divider: {
    height: '1px',
    backgroundColor: '#30363d',
    margin: '4px 0'
  },
  resultRowTotal: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  resultLabelTotal: {
    fontWeight: '700',
    color: '#f0f6fc'
  },
  resultValueTotal: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ccff00'
  },
  graphPreview: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-end',
    height: '80px',
    marginTop: '20px'
  },
  growthBar: {
    flex: 1,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700'
  },
  barMiniLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#8b949e'
  },
  simulationBtn: {
    backgroundColor: '#ccff00',
    color: '#0b0f19',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '24px',
    alignSelf: 'flex-start',
    transition: 'all 0.2s'
  },
  allocLegend: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  badgeStocks: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    border: '1px solid rgba(204, 255, 0, 0.2)',
    color: '#ccff00',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  badgeBonds: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'rgba(139, 148, 158, 0.08)',
    border: '1px solid rgba(139, 148, 158, 0.2)',
    color: '#8b949e',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  badgeGold: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'rgba(241, 250, 140, 0.08)',
    border: '1px solid rgba(241, 250, 140, 0.2)',
    color: '#f1fa8c',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  awaitingSim: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #30363d',
    borderRadius: '8px',
    color: '#8b949e',
    fontSize: '13px'
  },
  simulationReport: {
    animation: 'fadeInUp 0.3s ease'
  },
  reportTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    color: '#f0f6fc',
    fontWeight: '700'
  },
  performanceAlert: {
    border: '1px solid',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  reportText: {
    fontSize: '13px',
    fontWeight: '600'
  },
  reportValue: {
    fontSize: '20px',
    fontWeight: '800'
  },
  reportContext: {
    fontSize: '12px',
    color: '#8b949e',
    lineHeight: '1.5',
    margin: 0
  },
  leverageMonitor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  gaugeContainer: {
    height: '8px',
    backgroundColor: '#0b0f19',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '10px'
  },
  gaugeFilled: {
    height: '100%',
    transition: 'all 0.2s ease-out'
  },
  gaugeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#8b949e',
    fontWeight: '600'
  },
  outcomeCard: {
    backgroundColor: '#0b0f19',
    border: '1px solid #30363d',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  outcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  leverageWarning: {
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
    border: '1px solid rgba(255, 153, 0, 0.2)',
    color: '#ff9900',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  inflationVisualBox: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #30363d',
    borderRadius: '8px',
    backgroundColor: '#0b0f19',
    overflow: 'hidden',
    marginTop: '10px'
  },
  cartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  cartIconLabel: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#8b949e',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  crossoverCard: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '14px',
    padding: '50px',
    maxWidth: '560px',
    textAlign: 'center',
    animation: 'fadeInUp 0.6s ease'
  },
  crossoverTitle: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '16px 0 16px 0',
    letterSpacing: '-1px'
  },
  crossoverDesc: {
    fontSize: '16px',
    color: '#f0f6fc',
    lineHeight: '1.5',
    margin: '0 0 12px 0'
  },
  crossoverText: {
    fontSize: '14px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: '0 0 32px 0'
  },
  crossoverBtn: {
    backgroundColor: '#ccff00',
    color: '#0b0f19',
    border: 'none',
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  crossoverBtnDev: {
    backgroundColor: '#50fa7b',
    color: '#0b0f19',
    border: 'none',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'monospace'
  },
  nextArrow: {
    position: 'absolute',
    bottom: '30px',
    background: 'none',
    border: 'none',
    color: '#ccff00',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none'
  },
  nextArrowDev: {
    position: 'absolute',
    bottom: '30px',
    background: 'none',
    border: 'none',
    color: '#50fa7b',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'monospace'
  },
  terminalWindow: {
    backgroundColor: '#011627',
    border: '1px solid #30363d',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
    overflow: 'hidden',
    textAlign: 'left'
  },
  terminalHeader: {
    backgroundColor: '#0b0f19',
    padding: '12px 18px',
    borderBottom: '1px solid #30363d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  termDots: {
    display: 'flex',
    gap: '6px'
  },
  termDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  terminalTitle: {
    fontSize: '11px',
    color: '#8b949e',
    fontFamily: 'monospace'
  },
  terminalBody: {
    padding: '20px',
    minHeight: '220px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  termPlaceholder: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: '13px',
    margin: 0
  },
  termLine: {
    margin: '4px 0',
    fontFamily: 'Courier New, monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap'
  },
  interactiveControlsDev: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#8b949e',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkboxInput: {
    accentColor: '#50fa7b',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  devConsoleBtn: {
    backgroundColor: '#50fa7b',
    color: '#0b0f19',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontFamily: 'monospace',
    transition: 'all 0.2s'
  },
  sideComparison: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px'
  },
  compBox: {
    flex: 1,
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'left'
  },
  compBoxActive: {
    flex: 1,
    backgroundColor: '#161b22',
    border: '1px solid #50fa7b',
    boxShadow: '0 0 10px rgba(80, 250, 123, 0.1)',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'left'
  },
  compBoxTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    color: '#f0f6fc',
    fontWeight: '700'
  },
  compBoxTitleDev: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    color: '#50fa7b',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  latencyLabel: {
    fontSize: '14px',
    color: '#ff5555',
    fontWeight: '700',
    marginBottom: '4px'
  },
  latencyLabelDev: {
    fontSize: '14px',
    color: '#50fa7b',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: '4px'
  },
  sizeLabel: {
    fontSize: '11px',
    color: '#8b949e'
  },
  sizeLabelDev: {
    fontSize: '11px',
    color: '#8b949e',
    fontFamily: 'monospace'
  },
  splitTerminalContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '460px'
  },
  miniTerminal: {
    backgroundColor: '#011627',
    border: '1px solid #30363d',
    borderRadius: '8px',
    overflow: 'hidden',
    textAlign: 'left'
  },
  miniTermHeader: {
    backgroundColor: '#0b0f19',
    padding: '8px 14px',
    borderBottom: '1px solid #30363d',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#8b949e'
  },
  miniTermBody: {
    padding: '12px',
    height: '105px',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  wssPacketLine: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  timestampSpan: {
    color: '#64748b'
  },
  badgeWss: {
    color: '#50fa7b',
    fontWeight: '700',
    fontSize: '9px'
  },
  badgeHttp: {
    color: '#f1fa8c',
    fontWeight: '700',
    fontSize: '9px'
  },
  latencySpan: {
    color: '#addb67'
  },
  httpReqLine: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  overheadSpan: {
    color: '#ff5555'
  },
  geoSelectors: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  },
  geoButton: {
    padding: '12px 18px',
    borderRadius: '6px',
    border: '1px solid',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'monospace'
  },
  nodeStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  statsValueDev: {
    fontWeight: '700',
    color: '#50fa7b'
  },
  nodeDescCard: {
    backgroundColor: '#0b0f19',
    border: '1px solid #30363d',
    padding: '14px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#8b949e',
    lineHeight: '1.5',
    marginTop: '10px'
  },
  inputControlDev: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },
  inputLabelDev: {
    fontSize: '13px',
    color: '#8b949e',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  textInputDev: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '12px 16px',
    color: '#f0f6fc',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'monospace',
    transition: 'border-color 0.2s'
  },
  codePayloadBox: {
    backgroundColor: '#011627',
    border: '1px solid #30363d',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  payloadHeader: {
    backgroundColor: '#0b0f19',
    padding: '8px 14px',
    borderBottom: '1px solid #30363d',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#8b949e'
  },
  payloadPre: {
    margin: 0,
    padding: '16px',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
    color: '#50fa7b',
    lineHeight: '1.4'
  },
  signatureResultBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sigTitle: {
    fontSize: '12px',
    color: '#8b949e',
    fontFamily: 'monospace'
  },
  sigCode: {
    backgroundColor: '#0b0f19',
    border: '1px solid #30363d',
    padding: '12px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#addb67',
    wordBreak: 'break-all'
  },
  verifSuccess: {
    backgroundColor: 'rgba(80, 250, 123, 0.05)',
    border: '1px solid rgba(80, 250, 123, 0.2)',
    color: '#50fa7b',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(80, 250, 123, 0.1)',
    fontFamily: 'monospace'
  },
  verifFailed: {
    backgroundColor: 'rgba(255, 85, 85, 0.05)',
    border: '1px solid rgba(255, 85, 85, 0.2)',
    color: '#ff5555',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'monospace'
  },
  verifPending: {
    fontSize: '11px',
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  devFinishFooter: {
    position: 'absolute',
    bottom: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    left: 0
  }
};