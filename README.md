# Trade-Guard: Financial Safety & Behavioral Trade Intelligence Platform

Trade-Guard is a full-stack financial safety system designed to calculate position risk, execute what-if market scenario simulations, provide one-click safer position sizing (Loss Shield), analyze behavioral trading patterns (revenge trading, FOMO, overtrading, size escalation), and generate quiet, structured LLM risk insights with deterministic offline fallbacks.

Built with a **Light Fintech Visual System** inspired by Apple Health, Linear, and Stripe.

---

## Key Features

- **Live Trade Safety Analyzer**: Dynamic calculation of position exposure, max capital at risk, risk-to-reward ratio, and leverage risk score (0-100).
- **Cause → Effect Visual Diffs**: Dynamic preview of how quantity or stop-loss adjustments immediately impact potential loss, exposure, and risk score (`Quantity 50 → 30`, `Loss ₹7,100 → ₹4,260`, `Risk 74 → 51`).
- **Loss Shield**: One-click safer position optimizer that mutates inputs to strictly cap total account drawdown at target threshold (e.g. 2%).
- **What-If Scenario Matrix**: Interactive stress testing across market price shocks (-20% to +20%), volatility expansion, and slippage.
- **Behavioral Intelligence & Trading DNA**: Rule-based quantification of Revenge Score, FOMO Score, Overtrading Score, and Escalation Anomaly with archetype profiling derived from historical trade logs.
- **Quiet LLM Context Analyst**: Generates factual risk explanations using Gemini/OpenAI API. Operates with automatic deterministic financial engine fallback when offline or without API keys.
- **Full Database Persistence & Synthetic Data**: PostgreSQL schema with automated database seeding of 25+ realistic trade logs and portfolio stats.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(Optional: Add `LLM_API_KEY` for Gemini/OpenAI. The app runs seamlessly without keys using deterministic financial explanations).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Architecture

The PostgreSQL schema is defined in `db/schema.sql` and includes:
- `users`, `portfolios`, `positions`
- `trades`, `trade_journal`
- `risk_assessments`, `risk_alerts`
- `behavioral_signals`, `scenario_simulations`, `ai_interactions`, `market_data`

The embedded database layer (`lib/database.ts`) automatically seeds synthetic trades and portfolio state on initial launch.
To re-seed or reset the database at any time, click **"Reset Demo Data"** in the top navigation or POST to `/api/seed`.

---

## Project Structure

```
Trade-Guard/
├── app/
│   ├── api/             # Next.js API Routes (Portfolio, Trades, Risk, What-If, Behavioral, AI)
│   ├── globals.css      # Tailwind & Light Fintech tokens
│   ├── layout.tsx       # Root layout with Inter font
│   └── page.tsx         # Main application dashboard
├── components/          # React components (Analyzer, WhatIf, LossShield, DNA, Journal)
├── db/
│   └── schema.sql       # PostgreSQL DDL schema definition
├── lib/
│   ├── database.ts      # Database persistence & adapter layer
│   ├── riskEngine.ts    # Deterministic financial math engine
│   ├── behavioralEngine.ts # Behavioral intelligence & DNA generator
│   ├── whatIfEngine.ts  # Stress test scenario engine
│   ├── lossShieldEngine.ts # Safer position sizing optimizer
│   ├── llmService.ts    # LLM integration & fallback interpreter
│   └── seed.ts          # Synthetic realistic trade dataset
├── .env.example
├── package.json
└── README.md
```
