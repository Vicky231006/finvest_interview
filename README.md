# High-Frequency Real-Time Price Ticker (Optimization Engine)

This project implements a high-frequency real-time mock-trading dashboard ticker optimized to handle data updates arriving every **100ms** without causing main-thread UI blocks, frame drops, or browser tab freezing.

## 🚨 The Core Problem: DOM Thrashing
When a data stream updates a standard React component state every 100ms, it forces React to initiate its reconciliation cycle, calculate the Virtual DOM diff, and commit changes to the actual DOM 10 times a second. 

If multiple assets are updating simultaneously:
1. The main execution thread becomes completely starved.
2. Micro-animations, charts, and user interaction inputs (clicks, scrolls) freeze because the event loop is blocked by continuous style recalculations and layout reflows.
3. The browser tab inevitably crashes or lags heavily.

---

## 🛠️ The Selected Architecture & Optimization Choices

To prevent UI degradation, this architecture deliberately decouples the **Data Ingestion Frequency (100ms)** from the **UI Rendering Frequency (300ms)** using three core performance design patterns:

### 1. High-Speed Mutable Data Buffering (`useRef`)
* **What was chosen:** Storing incoming WebSocket/stream packets inside a mutable React `useRef` object (`dataBufferRef.current`).
* **Why:** Modifying a React Ref mutates a reference in memory instantly. It skips the React lifecycle entirely, incurring a **0ms CPU render cost**. Pushing high-frequency updates straight to a component's local `useState` hook is an anti-pattern under these performance conditions; using a Ref treats the memory layer as a shock absorber.

### 2. Micro-Batched UI Flushes (`setInterval` / `requestAnimationFrame`)
* **What was chosen:** A decoupled internal clock running on a 300ms cycle that takes a shallow snapshot copy of the memory buffer and updates the visible React state all at once.
* **Why:** The human eye cannot process statistical visual numerical shifts at 100ms intervals anyway (it just looks like an illegible blur). Batching changes to a controlled 300ms window saves the browser from executing **66% of unnecessary layout re-paints**, providing a visually smooth, readable, and highly performant experience.

### 3. Strict Component Memoization (`React.memo`)
* **What was chosen:** Wrapping individual asset row items (`TickerRow`) in a structural shallow-comparison wrapper (`React.memo`).
* **Why:** When the batched state updates every 300ms, React's default behavior is to re-render *every single child component* in that list. By memoizing the rows, if a specific stock asset's price did not fluctuate during that particular 300ms window, its internal Virtual DOM tree bypasses evaluation completely. Only rows with actual delta shifts are recalculated.

---

## 📊 Approach Comparison

| Metric / Strategy | Naive Approach (Direct State Updates) | Optimized Approach (Buffered + Memoized) |
| :--- | :--- | :--- |
| **Data Capture** | Synchronous `useState` setter execution | Asynchronous mutable `useRef` allocation |
| **Render Frequency** | Immediate (Every 100ms per packet) | Controlled Batches (Every 300ms combined) |
| **DOM Interactions** | Constant layout thrashing / reflow cycles | Predictable, throttled UI updates |
| **Main Thread Status** | Starved / Blocked (Laggy UX) | Free & Liquid (Responsive UI) |
| **Scalability** | Crashes with more than 3-5 assets | Easily scales to dozens of concurrent rows |

---

## 🚀 How to Run and Verify Performance

1. **Install Dependencies:**
   ```bash
   npm install
    ```
2. **Start:**
   ```bash
   npm start
```
