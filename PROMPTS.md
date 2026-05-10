# AI Prompts Log — UseMoney FIRE Calculator Assignment

**Tool used:** GitHub Copilot Chat (in VS Code) + Claude (for prompt engineering and architecture)
**Models:** GPT-4 / Claude Sonnet (via Copilot), Llama 3.3 70B (via Groq, in the running app)
**Date:** May 9-10, 2026

## Workflow note

I used Claude as a "tech lead" to plan architecture, decide tradeoffs, and write the actual prompts I sent to Copilot. Copilot did the file-level code generation. This split worked well — Claude has stronger reasoning for architectural decisions, Copilot has tighter integration with my IDE for multi-file edits.

Below are the major prompts sent to Copilot, in order.

---

## Prompt 1 — Project scaffold and dependencies

I'm building a Next.js 14 app for a fintech assignment — a redesigned FIRE (Financial Independence Retire Early) calculator with an AI chat assistant. We will build this in many small steps. This is step 1 of ~11. Don't try to build everything now.

## Step 1 goal: project scaffold and dependencies only

Generate the exact terminal commands I should run, in order, to set up:

1. A Next.js 14 app with TypeScript, Tailwind, App Router, src directory, no ESLint setup prompt, import alias `@/*`. Project name: `fire-redesign`.

2. Install these runtime dependencies:
   - zustand (state)
   - recharts (charts)
   - framer-motion (animations)
   - groq-sdk (LLM)
   - lucide-react (icons)
   - clsx, tailwind-merge, class-variance-authority (utility)

3. Initialize shadcn/ui with: New York style, Neutral base color, CSS variables, dark mode default.

4. Add these shadcn components: button, card, input, slider, dialog, tabs, badge, separator, scroll-area, tooltip, sheet, table, select, dropdown-menu.

5. Create a `.env.local` file with `GROQ_API_KEY=` (empty) and a `.env.example` with the same key documented.

6. Create an empty `prompts.md` at the project root with a header.

After listing the commands, give me a checklist I can verify:
- [ ] `npm run dev` starts on http://localhost:3000 with no errors
- [ ] `src/components/ui/` folder exists with all shadcn components
- [ ] Tailwind dark mode is configured
- [ ] `.env.local` exists (gitignored) and `.env.example` exists (committed)

Do NOT generate any application code yet. Just scaffolding commands and verification checklist.

### Result
Next.js 14 + TS scaffolded. Installed zustand, recharts, framer-motion, groq-sdk, lucide-react, shadcn/ui (New York, Neutral, Radix, Nova preset). Dark mode enabled.

---

## Prompt 2 — Types and FIRE math


Create three files in `src/lib/fire/`:

1. **`types.ts`** — TypeScript interfaces for `FireParameters` (currentAge, targetRetirementAge, lifeExpectancy, currentCorpus, monthlySavings, annualSalaryIncrement, annualSavingsIncrement, safeWithdrawalRate), `AssetClass` (id, name, icon, allocation %, expectedReturn %), `Expense` (id, category, monthlyAmount, inflationRate %), `Scenario`, `ProjectionPoint` (age, corpus, fireTarget), `FireResult`.

2. **`calculations.ts`** — pure functions: `weightedReturn(assets)`, `weightedInflation(expenses)`, `totalMonthlyExpenses(expenses)`, `inflatedAnnualExpenses(expenses, yearsFromNow)`, `fireNumberAt(annualExpenses, swrPercent)`, `simulateProjection(params, assets, expenses)` doing year-by-year compounding with savings growing by `annualSavingsIncrement` until retirement, then withdrawals post-retirement, `determineStatus(projection, targetAge)`, `computeFireResult(params, assets, expenses)`. No React, no side effects, no Date.now() inside calculations.

3. **`defaults.ts`** — default values matching the existing UseMoney FIRE page (age 25, retirement 50, ₹5L corpus, ₹75k savings, 8 expense categories, 5 asset classes).

Verify by writing a small test script that imports `computeFireResult` with defaults and prints the FIRE Number, years to FIRE, and weighted return.

### Result
Created src/lib/fire/{types,calculations,defaults}.ts. Pure function math layer. Verified with scripts/test-math.ts: FIRE Number ₹8.35 Cr from default inputs. Internal consistency verified at the corpus crossing point.

---

## Prompt 3 — Zustand store


Create `src/lib/store/fireStore.ts` using Zustand v5 with the `persist` middleware (localStorage key `usemoney-fire-v1`). State holds `parameters`, `assetAllocation`, `expenses`, `savedScenarios`, `comparisonScenarioIds`, `chatMessages`, `isChatRailOpen`, `isChatLoading`.

Expose typed actions for: all 8 parameter setters (each validates: finite numbers, sensible ranges — invalid input logs a warning and skips, never throws), asset CRUD (add/update/remove by id AND by case-insensitive name — the name variants are for chat tool calls), expense CRUD (same pattern), scenario actions (save/load/loadByName/delete, setComparisonScenarioIds, addToComparison, removeFromComparison, clearComparison, resetAll which restores defaults but keeps saved scenarios), and chat actions (appendChatMessage, updateChatMessage, clearChatMessages, setChatLoading, setChatRailOpen, toggleChatRail).

Only persist parameters/assetAllocation/expenses/savedScenarios — NOT chat state or comparison ids. Export `selectFireResult`, `selectScenarioById`, `selectComparisonScenarios` as standalone selector functions for use outside React. Use `crypto.randomUUID()` for ids with a fallback.

### Result
src/lib/store/fireStore.ts with persist middleware, all parameter setters, asset/expense CRUD, scenarios, chat. Verified actions, validation rejects bad input.

---

## Prompt 4 — Page shell, sidebar, topbar, layout


Build the visual shell for the redesigned FIRE page. Dark theme: black/near-black background, elevated cards at #141416, subtle white/[0.08] borders, emerald-500 accent for active states.

1. **`Sidebar.tsx`** — fixed 220px left rail with logo (green M square + "UseMoney." wordmark), green "New chat" button, sections WORKSPACE / DISCOVER / TOOLS with nav items using lucide icons (FIRE Calculator highlighted as active), user footer at bottom. Nav items have no real routes — all "#".

2. **`TopBar.tsx`** — 56px-tall horizontal bar, centered fake search input ("Search markets, stocks…" with ⌘K hint), theme toggle and notification icons on the right. No market ticker tape.

3. **`ChatRailShell.tsx`** — fixed right rail, 380px wide when open, 0 when collapsed. Animates with framer-motion (spring 300/30). When closed, shows a thin emerald tab on the right edge. When open: header "Ask FIRE" + collapse chevron, scroll area for messages (placeholder for now), input at the bottom. Reads `isChatRailOpen` from store.

4. **`/fire/page.tsx`** — main FIRE page that composes Sidebar + TopBar + main content area + ChatRailShell. Add a placeholder ("FIRE page content here") for now. Root `/` redirects to `/fire`.

Server components where possible; `'use client'` only for ChatRailShell and FirePage (Zustand consumers).

### Result
Sidebar (matching reference design language), TopBar (minimal), ChatRailShell (collapsible), /fire route created with redirect from /.

---

## Prompt 5a — FIRE Hero KPIs and Scenario Bar

Build the top of the FIRE page: page header with title/subtitle and a 5-KPI row showing live values from the store.

1. **`src/lib/utils/format.ts`** — helpers for INR: `formatINR(amount)` returning "₹8.09 Cr" / "₹25 L" / "₹75,000" using Indian numbering, `formatINRFull(amount)` for unabbreviated en-IN with ₹ prefix, `formatPercent(value, fractionDigits?)`.

2. **`FireHero.tsx`** — five cards in a row, each with subtle tinted gradient: FIRE Number (orange), Years to FIRE (emerald), Monthly Expenses (cyan), Monthly Savings (purple), Status (emerald if on-track/ahead, amber if behind). Reads from a `useFireResult()` hook that subscribes to parameters/assetAllocation/expenses and useMemos the computed result. Crucially, DO NOT subscribe via `useFireStore(selectFireResult)` directly — it returns a fresh object each render and causes an infinite loop in Zustand v5. Subscribe to the input slices and useMemo on top.

3. **`ScenarioBar.tsx`** — page header row: "FIRE Calculator" title with Flame icon, subtitle, and three buttons on the right: Reset (with confirm dialog), Load (dropdown of saved scenarios), Save Scenario (dialog with name input). Calls the matching store actions.

4. Update `/fire/page.tsx` to render `<ScenarioBar />` then `<FireHero />` in a centered max-w-[1400px] container.

Verify: KPIs match the math test output, save/load works, reset confirms then preserves saved scenarios.

### Result
5 KPI cards live-bound to store. Scenario save/load/reset working. Hit an infinite loop bug because I'd used a selector that returned a fresh object on every render — fixed by subscribing to inputs and using useMemo.

---

## Prompt 5b — Wealth Projection Chart


Build `src/components/fire/WealthProjectionChart.tsx` — the centerpiece visualization. Recharts ComposedChart inside a dark themed card.

Two primary series: "Your Corpus" as a solid blue line, "FIRE Target" as dashed orange. X-axis = age from currentAge to lifeExpectancy. Y-axis uses a compact INR formatter (add `formatINRCompact` to `utils/format.ts` — outputs "₹8Cr", "₹25L", "₹75K"). Vertical ReferenceLine at targetRetirementAge marked "Retirement", custom dark tooltip on hover.

Comparison overlays: read `comparisonScenarioIds` from store, look up scenario objects via `selectComparisonScenarios`, compute `simulateProjection` for each (memoized), and render an extra dashed Line per scenario with rotating colors (purple, pink, teal, yellow). When comparison scenarios are present, extend the legend to show their names with their respective colors.

Wrap chart in `ResponsiveContainer`. Use the same `useFireResult` hook from 5a for the primary projection. Memoize comparison projections so they only recompute when scenario ids or saved scenarios change.

Insert `<WealthProjectionChart />` between FireHero and the parameters/asset grid in the FIRE page.

### Result
Recharts dual-line chart. Blue corpus, orange dashed FIRE target. Retirement reference line. Custom tooltip.

---

## Prompt 5c — Parameters Panel

[paste Prompt 5c]

### Result
8 parameters with sliders + numeric inputs. Live updating chart and KPIs. Help text computed dynamically (e.g. "in 10 yrs: ₹X/mo").

---

## Prompt 5d — Asset Allocation + Expenses Table


Build `src/components/fire/ParametersPanel.tsx` — 8 parameter rows, each with a label, numeric input, optional slider, optional dynamic help text. Changes flow into the store and re-render chart and KPIs live.

Define a `PARAM_CONFIGS` array of `{ key, label, storeAction, min, max, step, unit, hasSlider, helpText }`. Configs:
- currentAge / targetRetirementAge / lifeExpectancy — sliders, years
- currentCorpus / monthlySavings — number input only, INR
- annualSalaryIncrement / annualSavingsIncrement — sliders, %, grouped under an "Income Growth" subheader
- safeWithdrawalRate — slider, %

Dynamic help text: monthlySavings says "Applied only till retirement age", annualSavingsIncrement shows projected monthly savings in 10 years, safeWithdrawalRate shows computed monthly/annual withdrawal. Pass `(params, expenses) => string` functions for these.

Slider thumb: emerald-500. Inputs accept direct typing, validation lives in the store. Wrap in a dark card matching FireHero styling.

Render alongside AssetAllocationPanel (placeholder for now) in a 2-column `lg:grid-cols-2` grid under the chart.

### Result
Two-column grid for assets, table for expenses, both with add/edit/delete. Total% turns red if asset allocation ≠ 100%.

---

## Prompt 6 — Chat Rail UI (no LLM yet)

[paste Prompt 6]

### Result
Messages list, quick action chips, input with Enter-to-send. Mock send handler returns placeholder. Auto-scroll, typing indicator.

---

## Prompt 7 — Groq integration with tool calling

Build the chat interior. No Groq integration yet — the send button appends the user message and a hardcoded placeholder assistant reply after a 600ms delay. This lets us verify the UI in isolation before wiring the model.

Three components in `src/components/chat/`:

1. **`ChatMessages.tsx`** — scrollable list of messages from `useFireStore`. User bubbles: indented from left, subtle bg. Assistant: no bubble, "FIRE" label in emerald, content prose. Tool calls render as small `🔧 toolName(args)` pills before the assistant content. Empty state with text. Auto-scroll to bottom on new message and during loading. Three pulsing emerald dots while `isChatLoading` is true.

2. **`QuickActions.tsx`** — row of 4 clickable chips with hardcoded prompts ("Can I retire at 45?", "What if I save ₹20k more?", "Make my plan more conservative", "How am I doing right now?"). Clicking fills the input via an `onSelect(prompt)` callback. Only shown when there are no messages yet.

3. **`ChatInput.tsx`** — textarea with placeholder, Enter to send, Shift+Enter for newline. Send button (paper-plane icon, emerald) at the right inside the textarea. Disabled while loading or when value is empty/whitespace.

Update `ChatRailShell.tsx` to wire these up and own the input state. Use a mock `handleSend` that appends a user message, sets loading, waits 600ms, appends a placeholder assistant reply, clears loading.

### Result
The interesting one. /api/chat route with Groq SDK, llama-3.3-70b-versatile model, 19 tool schemas covering all FIRE actions. Two-pass flow: first call returns tool_calls, executor mutates Zustand client-side, second call returns natural-language reply with tool results. Verified end-to-end: "set retirement age to 45" → slider moves, chart redraws, assistant confirms.

---

## Prompt 8 — Scenario comparison + deploy prep

Two things in one pass: a UI to overlay multiple saved scenarios on the chart, plus README and deployment readiness.

1. **`ScenarioBar.tsx`** — add a fourth button "Compare" between Load and Save Scenario, disabled if no scenarios are saved. Opens a Dialog listing every saved scenario as a row with a checkbox, the scenario name, and a small color preview chip (matching the rotating chart colors). Footer has "Clear All" (resets local checkbox state) and "Apply" (calls `setComparisonScenarioIds` and closes). Local state during selection — only commits on Apply.

2. **Active comparison indicator** — just below the page title, when `comparisonScenarioIds.length > 0`, show a small emerald chip "Comparing N scenarios" with an X. Clicking X calls `clearComparison()`.

3. **Chart legend update** — `WealthProjectionChart` already supports overlay lines from Prompt 5b; extend the legend to also list the comparison scenarios with their respective colors when present.

4. **README rewrite** — replace the default Next.js README with: what's new vs the reference (chat-driven UX, scenario comparison, refined visual hierarchy, persistent state), tech stack, architecture diagram, setup steps, env vars, demo script (3-min flow), modeling notes (annual compounding, FIRE formula, INR formatting), trade-offs, what's intentionally out of scope.

5. **`.env.example`** — `GROQ_API_KEY=` with a comment pointing to console.groq.com/keys.

6. Run `npm run build` to catch any production-only TypeScript or import errors that didn't show in dev mode. Fix anything that blocks the build before deploying.

### Result
Compare button + dialog with checkboxes. Chart overlays multiple scenarios with rotating colors. README rewritten. Vercel deploy.

---

## Diagnosis prompts (smaller, ad-hoc)

These were one-off prompts to fix bugs as they appeared:

1. **Font fix** — Body className was missing font-sans, causing slab-serif fallback. Fixed in layout.tsx.
2. **Infinite loop fix** — selectFireResult returning fresh objects per render. Refactored to subscribe to primitives + useMemo.
3. **UI density fix** — Asset card "Allocation/Return" labels merged due to missing grid columns. Parameters panel labels wrapping awkwardly when chat open. Fixed both with grid + flex-col layouts.

Also I made some minor peompts like fix small ui fixes and some things in mobile responsive.