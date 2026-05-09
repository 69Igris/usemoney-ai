# UseMoney FIRE Calculator — Redesigned

A redesigned FIRE (Financial Independence, Retire Early) calculator with an AI-powered chat assistant. Built as an internship assignment for UseMoney.

## What's new vs the reference

1. **Chat-driven UX** — Every action available in the form (set parameters, manage assets, edit expenses, save/load/compare scenarios) can also be performed via natural language chat. The chat uses Groq's `llama-3.3-70b-versatile` model with function calling.
2. **Scenario comparison** — Overlay multiple saved scenarios on the wealth projection chart side-by-side.
3. **Refined visual hierarchy** — KPI cards weighted by importance, cleaner spacing, removed market ticker noise from the planning page.
4. **Persistent state** — Scenarios and parameters survive page refreshes via localStorage.

## Tech stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (radix-nova style, neutral base, Radix primitives)
- **State:** Zustand v5 with persist middleware
- **Charts:** Recharts
- **Animation:** Framer Motion (chat panel transitions only)
- **AI:** Groq SDK with `llama-3.3-70b-versatile`, native tool/function calling
- **Icons:** lucide-react

## Architecture

```
User input → Chat Rail → POST /api/chat
                         ↓
                  Groq API (with tool schemas)
                         ↓
                  tool_calls returned
                         ↓
              Client executor → Zustand store
                                      ↓
                              UI re-renders (chart, KPIs, panels)
                                      ↓
                  Second /api/chat call with tool results
                                      ↓
                  Final natural-language reply
```

Pure functions for FIRE math live in `src/lib/fire/calculations.ts`. The math is decoupled from React, the store, and the UI — the same `computeFireResult()` powers the chart, KPI cards, and the `useFireResult` hook. The LLM receives a snapshot of the raw state (parameters, assets, expenses, saved scenario names) in its system prompt and decides which tools to call; tool execution and store mutation happen entirely client-side.

## Setup

```bash
git clone <this repo>
cd my-app
npm install
cp .env.example .env.local
# Edit .env.local and add your Groq API key
npm run dev
```

Visit http://localhost:3000 — redirects to `/fire`.

## Environment variables

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a key at https://console.groq.com/keys (free tier covers this app comfortably).

## Demo script

For the interview, here's a 3-minute demo flow:

1. Show default state (~₹8 Cr FIRE Number, ~13 years to FIRE)
2. Drag retirement age slider to 45 → chart redraws live, KPIs update
3. Open chat. Type: "what if I save 200k per month?" → tool call fires, savings updates, chart steepens, assistant explains
4. Type: "add Crypto at 10% with 18% return" → asset card appears, total goes red
5. Type: "save this as Aggressive plan" → scenario saved
6. Reset, modify slightly, save as "Conservative plan"
7. Click Compare button → check both → Apply → chart shows both overlaid

## Modeling notes

- Compounding is annual, end-of-year. Industry calculators sometimes use monthly compounding which can shift FIRE date by 1-2 years.
- FIRE Number = inflation-adjusted annual expenses at retirement / SWR
- Savings increment is applied year-over-year on the monthly savings amount
- All numbers are in INR; formatted with Indian numbering (lakh / crore) for amounts ≥ ₹1 lakh

## Trade-offs

- Chat history is not persisted across sessions (intentional — fresh context each session)
- Math is computed client-side (instant feedback, no backend complexity, but not auditable server-side)
- LLM tool calls are executed client-side against the Zustand store directly (simpler than a separate state server, but means the API key handles only LLM calls, not state mutation)
- No actual broker connection (mocked — see questionnaire trust answer for how I'd build this)

## What's NOT done (out of scope)

- Mobile responsive (chat rail should become bottom drawer < 1024px wide)
- Animated number counters on KPI changes
- Cmd+K keyboard shortcut to focus chat input
- Real broker connection
- Multi-currency support
