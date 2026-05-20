# Trading Diary

A quantitative trading analytics platform for active day traders.
Built to answer three questions no existing journal can: *Is my edge real? 
When does it work? Am I actually improving?*

**Live demo:** [coming soon]

---

## The Problem

Every trading journal on the market starts at the trade. None of them 
capture what you *planned* to do before the session — which means they 
can never tell you whether you followed your process or just got lucky.

Trading Diary fixes this by connecting pre-market preparation → trade 
execution → outcome measurement in one workflow.

---

## Features

### Core
- **Trade Log** — manual entry + AI broker statement parser (Anthropic API vision model)
- **P&L Dashboard** — equity curve, win rate, profit factor, expectancy, 
  Sharpe ratio, max drawdown
- **Indicator Auto-Fetch** — RSI, MACD, and VWAP values pulled automatically 
  at exact trade timestamps via Polygon.io API
- **Pre-Market Prep Form** — log your bias, key levels, and planned setups 
  before each session

### Quantitative Edge
- **Edge Significance Test** — permutation test (10,000 iterations) determines 
  whether a setup's edge is statistically real or luck (p < 0.05 threshold)
- **Setup Breakdown** — P&L, win rate, and expectancy filtered by setup tag, 
  ticker, timeframe, and time of day

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS |
| Database + Auth | Supabase (Postgres + Google OAuth) |
| Market Data | Polygon.io API |
| AI Parser | Anthropic API (claude-sonnet-4) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Polygon.io API key (free tier)
- Anthropic API key

### Installation

```bash
git clone https://github.com/reevegohyz/summer26.git
cd trading-diary
npm install
```

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
POLYGON_API_KEY=your_polygon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

| Table | Key Fields |
|---|---|
| `users` | id, email, display_name |
| `prep_entries` | date, bias, key_levels, planned_setups, max_loss |
| `trades` | ticker, direction, entry/exit price, shares, setup_tag, pnl, rsi_at_entry, macd_at_entry, vwap_dev_at_entry |
| `daily_summaries` | date, total_pnl, num_trades, win_rate |

---

## Roadmap

- [x] Project scaffold + folder structure
- [ ] Supabase auth (Google OAuth)
- [ ] Trade log CRUD + P&L dashboard
- [ ] Polygon.io indicator auto-fetch
- [ ] Edge significance test (permutation testing)
- [ ] Pre-market prep form
- [ ] AI broker statement parser
- [ ] Vercel deployment
- [ ] ELO-style skill rating *(v2)*
- [ ] Conditions fingerprint *(v2)*
- [ ] Mistake fingerprint *(v2)*

---

## Author

**Reeve** — [LinkedIn](linkedin.com/in/reeve-goh-0817071a2)