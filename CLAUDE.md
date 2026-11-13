# CLAUDE.md — CareTech360.AI Easy Quote

Guidance for Claude Code when working in this repository.

## What this is
An internal quoting and pricing-model app for **CareTech360.AI** (clinical healthcare workflow
platform on GCP; built by Ensemble Digital Labs). It is a port of
`docs/CareTech360-Pricing-Methods.xlsx` into a browser app, plus a guided quote wizard.

- Static site, vanilla JS, **no build step, no runtime dependencies** (jsPDF is vendored).
- State lives in `localStorage` (key `ct360-easyquote-v3`). Commercial data only — no PHI,
  so it stays outside HIPAA scope.

## Run / test
```bash
npm run dev     # http://localhost:3000
npm test        # pricing-engine tests (node:test) — must stay green
```
Always run `npm test` after touching `src/model.js`. Default inputs must keep reproducing the
workbook's values (see `tests/model.test.js`).

## Architecture
```
index.html            shell; loads vendor/, then src/model.js → src/ui/core.js → src/ui/app.js
src/model.js          PURE pricing engine. DEFAULTS(), WIZ_DEFAULTS(), compute(S) → R. No DOM.
                      Also require()-able from Node for tests.
src/ui/core.js        UI helpers (num/txt/seg/table/card/o()) + pricing-model views:
                      Pricing summary, Cost build-up, Workflows & tiers, Rate calculator,
                      Method calculator, USA vs India, Amortization panel
src/ui/app.js         app shell: state load/save, VIEWS + nav, Easy Quote wizard (4 steps),
                      Services & packages, PDF (jsPDF), event delegation, routing (#hash)
src/styles.css        all styles (tokens at the top: --pri, --acc, --line, …)
vendor/               jspdf.umd.min.js, jspdf.plugin.autotable.min.js
docs/                 source workbook + pricing-model.md (formulas, sheet ↔ code map, known issues)
```

### Data flow
`S` (inputs/state) → `compute(S)` → `R` (all derived numbers) → views render HTML strings.
Key compute stages, in order: rate card blends → cost build-up pools → workflow catalogue & tiers
→ module/product catalogue (services, apps) → Pricing Summary → Market (India) → Method calculator
→ legacy quote (`R.quote`, workbook parity) → Easy Quote wizard (`R.w`, what users quote with).

### Rendering pattern (important)
- Views are functions returning HTML strings. Computed outputs are wrapped in `o(html, cls)`,
  which tags them `data-o="<n>"` with a sequential counter.
- On a numeric/text **input** event, `recalc(false)` re-renders off-screen and **patches only
  `[data-o]` nodes** so the focused input keeps focus. On **change/click** that alters structure,
  `recalc(true)` does a full re-render.
- Therefore: the sequence of `o()` calls in a view must not change between renders caused by
  typing. If an input can change the *structure* (row counts, conditional blocks), trigger a full
  render for it (see the `change` handler in app.js, e.g. `cb.amort`, `wc.recovery`).
- Inputs bind by `data-p="path.in.S"`; flags: `data-pct` (store /100), `data-nul` (blank → null =
  "use linked default"), `data-txt`, `data-int`, `data-num` (selects). Buttons use `data-set`,
  `data-act`, `data-go`, `data-svc`, `data-inc`, `data-tog`.

### State migrations
`S` is persisted. When you add fields to `DEFAULTS()`, either bump `LS_KEY` in app.js or add a
migration block (see the IIFEs after state load, e.g. `cb.amort`, locked service products).

## Domain rules (don't break)
- Price = Cost ÷ (1 − margin). Floors: never quote a line below its margin floor without a warning;
  max discount = 1 − cost ÷ (price × (1 − floor)).
- Packages: Starter / Growth / Premium require **exactly** 3 / 5 / 7 services (`S.pk`), or a custom
  bundle. Package price = platform fee + Σ service prices × (1 − bundle discount).
- A service's **product is fixed** once created (users edit cost, margin and service discount only).
- India prices = US price × India index, never below India cost ÷ (1 − floor).
- No invented figures in customer-facing output; placeholders are flagged in docs/pricing-model.md.

## Conventions
- Keep `model.js` pure and covered by tests; add a test for any new formula.
- Vanilla JS, no frameworks or bundlers unless asked. Keep it working from a plain static server.
- Accessibility: real buttons/labels, visible focus, contrast ≥ 4.5:1.
- PDF text uses jsPDF's Helvetica: no ₹ glyph, so INR prints as "INR".

## Known issues / good next tasks
1. **AI token cost overstated 3×** — Cost Build-Up usage line multiplies by expected overage (3M)
   then treats the pool as per-1M. Fix in `DEFAULTS().cb.sec.usage` (qty should be per 1M) and
   update the test expectation deliberately.
2. Platform build amortization defaults to 12 months; the workbook label says 36 (one click on the
   Cost build-up › Subscription › Amortization panel). Decide and set the default.
3. Custom-build architect line uses fixed $100/$20 instead of the Rate card role.
4. Placeholder inputs (hosting $/loc, API fees, app costs, setup $250, provider $19.75) need real data.
5. Split `src/ui/core.js` / `app.js` into ES modules once a build step is acceptable.
6. Persist quotes server-side (GCP Cloud Run + PostgreSQL, versioned rate cards) — see docs.
