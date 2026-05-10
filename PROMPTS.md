# AI Prompts Log — UseMoney FIRE Calculator Assignment

**Tool used:** GitHub Copilot Chat (in VS Code) + Claude (for prompt engineering and architecture)
**Models:** GPT-4 / Claude Sonnet (via Copilot), Llama 3.3 70B (via Groq, in the running app)
**Date:** May 9-10, 2026

## Workflow note

I used Claude as a "tech lead" to plan architecture, decide tradeoffs, and write the actual prompts I sent to Copilot. Copilot did the file-level code generation. This split worked well — Claude has stronger reasoning for architectural decisions, Copilot has tighter integration with my IDE for multi-file edits.

Below are the major prompts sent to Copilot, in order.

---

## Prompt 1 — Project scaffold and dependencies

[paste the Prompt 1 content from the chat]

### Result
Next.js 14 + TS scaffolded. Installed zustand, recharts, framer-motion, groq-sdk, lucide-react, shadcn/ui (New York, Neutral, Radix, Nova preset). Dark mode enabled.

---

## Prompt 2 — Types and FIRE math

[paste Prompt 2]

### Result
Created src/lib/fire/{types,calculations,defaults}.ts. Pure function math layer. Verified with scripts/test-math.ts: FIRE Number ₹8.35 Cr from default inputs. Internal consistency verified at the corpus crossing point.

---

## Prompt 3 — Zustand store

[paste Prompt 3]

### Result
src/lib/store/fireStore.ts with persist middleware, all parameter setters, asset/expense CRUD, scenarios, chat. Verified actions, validation rejects bad input.

---

## Prompt 4 — Page shell, sidebar, topbar, layout

[paste Prompt 4]

### Result
Sidebar (matching reference design language), TopBar (minimal), ChatRailShell (collapsible), /fire route created with redirect from /.

---

## Prompt 5a — FIRE Hero KPIs and Scenario Bar

[paste Prompt 5a]

### Result
5 KPI cards live-bound to store. Scenario save/load/reset working. Hit an infinite loop bug because I'd used a selector that returned a fresh object on every render — fixed by subscribing to inputs and using useMemo.

---

## Prompt 5b — Wealth Projection Chart

[paste Prompt 5b]

### Result
Recharts dual-line chart. Blue corpus, orange dashed FIRE target. Retirement reference line. Custom tooltip.

---

## Prompt 5c — Parameters Panel

[paste Prompt 5c]

### Result
8 parameters with sliders + numeric inputs. Live updating chart and KPIs. Help text computed dynamically (e.g. "in 10 yrs: ₹X/mo").

---

## Prompt 5d — Asset Allocation + Expenses Table

[paste Prompt 5d]

### Result
Two-column grid for assets, table for expenses, both with add/edit/delete. Total% turns red if asset allocation ≠ 100%.

---

## Prompt 6 — Chat Rail UI (no LLM yet)

[paste Prompt 6]

### Result
Messages list, quick action chips, input with Enter-to-send. Mock send handler returns placeholder. Auto-scroll, typing indicator.

---

## Prompt 7 — Groq integration with tool calling

[paste Prompt 7]

### Result
The interesting one. /api/chat route with Groq SDK, llama-3.3-70b-versatile model, 19 tool schemas covering all FIRE actions. Two-pass flow: first call returns tool_calls, executor mutates Zustand client-side, second call returns natural-language reply with tool results. Verified end-to-end: "set retirement age to 45" → slider moves, chart redraws, assistant confirms.

---

## Prompt 8 — Scenario comparison + deploy prep

[paste Prompt 8]

### Result
Compare button + dialog with checkboxes. Chart overlays multiple scenarios with rotating colors. README rewritten. Vercel deploy.

---

## Diagnosis prompts (smaller, ad-hoc)

These were one-off prompts to fix bugs as they appeared:

1. **Font fix** — Body className was missing font-sans, causing slab-serif fallback. Fixed in layout.tsx.
2. **Infinite loop fix** — selectFireResult returning fresh objects per render. Refactored to subscribe to primitives + useMemo.
3. **UI density fix** — Asset card "Allocation/Return" labels merged due to missing grid columns. Parameters panel labels wrapping awkwardly when chat open. Fixed both with grid + flex-col layouts.

---

## Reflections on prompting strategy

A few things I learned from this build:

- **Decompose before generating.** Big megaprompts produce sprawling, brittle code. Each of my prompts above scopes 1-4 files max. Each one ends with a verification step. Easier to catch when something's wrong.
- **Pure functions first, store second, UI last.** Building math + store + UI in that order meant by the time I was wiring chat to actions, the actions all already existed and worked.
- **Verify every layer in isolation.** I had test scripts for the math and the store before I touched any React. Caught a couple of bugs that would have been invisible inside a UI.
- **Don't trust "looks right".** I almost shipped Prompt 7 without verifying tool calls were *actually firing* (vs the LLM just describing what it would do). The 4-test verification sequence caught it cleanly.
- **Tool calling > RAG for this use case.** I considered adding a Python RAG layer for "context" but realized I had all the data I needed in client state already. RAG would have been engineering for engineering's sake.