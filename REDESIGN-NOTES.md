# CareTech360 Easy Quote — Design Update v1.1.0

## Run locally

Requires Node.js 18 or newer. Extract this ZIP, open a terminal in the
`caretech360-easy-quote` folder, and run:

```bash
npm run dev
```

Open http://localhost:3000/#workflows. Other screens are available in the navigation.
There is no build step or npm install required for the app; the existing dev command
uses npx to obtain the static server, which requires internet on its first run.
If port 3000 is occupied, stop the other server or use:

```bash
npx --yes serve@14 . -l 3001
```

Your existing localhost:3000 browser data uses the same storage key. To keep that
saved data, run on the same hostname and port. A different port is a different
browser storage origin. Use a separate extracted folder for the updated code.

## Workflow catalogue

- Searchable list with Speciality, Workflow Type and Status filters applied together.
- Select a workflow to load New Build Effort and Ongoing Cost applets side by side
  on wider screens, stacked on smaller screens.
- New creates a workflow with zero cost estimates. Choose Edit to change its name,
  classifications and cost inputs; Done returns to read-only cost mode.
- Delete retains the app's existing confirmation dialog and removes the matching
  tier inclusion row. Pricing calculations and local browser saving stay linked.
- Shared locations and catalogue-wide recovery period appear above both applets.
- Build investment, recovery contribution, operating costs, combined monthly cost
  and USA list price use the existing engine and rate card.
- Existing workflows receive Cross-speciality and Draft metadata because the source
  data did not include these classifications. Set the appropriate values through Edit.
  Workflow types are initially inferred from the existing workflow names and can be edited.
- Running costs retain the source app's per-location basis; this release does not
  convert them into pooled infrastructure costs.

## Shared design language across screens

Updated all nine navigation screens and all four quote steps with a common teal/navy
palette, quieter card surfaces, compact tables, consistent headers and buttons,
input focus states, badges and mobile spacing. The underlying forms and features
remain available. Wide pricing tables retain horizontal scrolling on small screens.

Fixed numeric table cells with the `r` class being rendered as block elements.
This was causing vertically stacked rates, divisors and amounts.

## Changed files

- src/ui/core.js — workflow screen, metadata editor and shared header/input helpers.
- src/ui/app.js — search, workflow create/edit actions and compatible metadata migration.
- src/styles.css — shared design system and workflow screen layout.
- package.json — version 1.1.0 and UI test command.
- tests/ui.test.js — dependency-free rendering/state smoke tests.
- README.md — updated entry point.

No changes to src/model.js, vendor libraries or the source workbook.

## Verification

```bash
npm run test:ui
npm test
```

The 12 UI rendering/state smoke tests pass. They cover all nine routes, all four
quote steps, workflow selection, intersecting filters, search, creation, editing,
deletion, persistence, output patch ordering and USA/India cost linkage.
These are DOM-stub smoke tests, not real-browser layout or visual tests.

The original pricing suite has 6 passing and 4 failing tests. These same four
failures were reproduced from the unmodified uploaded ZIP:

- Workflow Catalogue — expected Patient Intake build cost 16,978.75; actual 18,782.75.
- Pricing Summary — expected Q4 6,248.4675; actual 7,079.970041666668.
- Market Pricing India — expected Growth India 781.4976; actual 894.9652951388888.
- Workbook quote totals — expected MRR 8,311.7549; actual 9,143.257449074075.

The source engine already includes onboarding labor and additional recurring
costs that older workbook assertions do not include. Those expectations and
commercial assumptions were not changed as part of the visual redesign.

Browser-based screenshot/layout validation could not run in the execution environment.
Please check the screen at desktop and phone widths after starting the local server.
