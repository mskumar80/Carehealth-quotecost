# CareTech360.AI Easy Quote

Internal quoting app and pricing model for CareTech360.AI, ported from
`docs/CareTech360-Pricing-Methods.xlsx`.

- **Easy Quote** — 4-step wizard: hospital details → services & package (Starter 3 / Growth 5 /
  Premium 7 or a custom bundle) → other services → final pricing with PDF export.
- **Pricing model** — Services & packages, Pricing summary, Cost build-up (six cost models +
  amortization), Workflows & tiers, Method calculator (per-service price-by-method), USA vs India.
- **Price admin** — Rate calculator (role cost rate card).

## Quick start
```bash
npm run dev    # http://localhost:3000
npm test       # pricing engine tests against the workbook
```
Node 18+ is only needed for the dev server and tests. The app itself is plain HTML/CSS/JS.

## Work on it with Claude Code
```bash
cd caretech360-easy-quote
claude
```
`CLAUDE.md` explains the architecture, the render/patch pattern, domain rules and the known issues.
Example prompts:
- "Fix the AI token cost so the usage pool is per 1M tokens, and update the tests"
- "Add an annual-prepay 10% discount option to Easy Quote step 4 and the PDF"
- "Save quotes to a list so I can reopen them"

## Deploy
Any static host. Netlify: publish directory is the repo root (`netlify.toml`).

## Notes
- Data is saved in the browser's localStorage only.
- PDF downloads use jsPDF (vendored in `vendor/`).

## Design update v1.1.0

Start at **http://localhost:3000/#workflows** for the redesigned workflow list,
Speciality / Workflow Type / Status filters and paired New Build / Ongoing Cost
applets. The other application screens use the same design language.
See `REDESIGN-NOTES.md` for changes, local run instructions and verification notes.
Run `npm run test:ui` for the new rendering/state smoke tests.
