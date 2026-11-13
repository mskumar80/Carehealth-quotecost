# CareTech360 pricing model — formulas and sheet map

Source: `CareTech360-Pricing-Methods.xlsx` (this folder). Default inputs in `src/model.js`
reproduce the workbook; `tests/model.test.js` checks the key cells.

## Layers
1. **Rate card** — blended $/hr = US rate × (1 − India share) + India rate × India share.
   US market 70% India, India market 90% India.
2. **Cost build-up** — period cost = driver qty × unit cost ÷ spread (months).
   Labor unit cost = blended rate × hours. Six pools, each ÷ its billing unit:

   | Pool | Billing unit | Default US cost / unit |
   |---|---|---|
   | Subscription platform | locations served (100) | $157.33 / loc / mo |
   | Usage meters | 1M tokens | $33.64 |
   | Custom build | project | $6,097.50 |
   | Technology advisory | consultant day (10) | $820.40 |
   | Application build | app | $7,006 |
   | Application run | live app / mo | $671.13 |

3. **Workflow catalogue** — dev cost = Σ hours × role rate + third-party; recovery / loc / mo =
   dev cost ÷ (recovery months × subscribing locations); workflow cost = recovery + run + included AI.
4. **Price** — list = cost ÷ (1 − target margin); floor = cost ÷ (1 − min margin);
   max discount = 1 − (1 − target) ÷ (1 − floor). Custom build margin = markup ÷ (1 + markup).
5. **Method calculator** — cost-plus, competitive (mid × (1 + positioning)), value-based
   ((hours × rate + leakage) × capture), EVE (reference + net differentiation × share);
   recommended = MAX(floor, primary × w + secondary × (1 − w)).
6. **Market** — India price = MAX(US list × index, India cost ÷ (1 − floor)) → INR at FX.
7. **Easy Quote** — package / loc / mo = platform fee + Σ(service list × (1 − service discount))
   × (1 − package discount); plus extra providers, usage overage, apps, setup, custom builds,
   advisory, custom app build/run. Contract value = monthly × term + one-time.

## Sheet ↔ code map
| Workbook sheet | Code |
|---|---|
| Rate Card | `S.rc`, `R.roles` |
| Cost Build-Up | `S.cb.sec.*`, `R.cb.*` |
| Workflow Catalogue | `S.wc`, `R.wc` (tiers, platform fee, legacy quote) |
| Pricing Summary | `S.ps`, `R.ps.rows` |
| Market Pricing | `S.mp`, `R.mp` |
| Method Calculator | `S.mc`, `R.mc`, `R.mech` |
| (new) Services & packages | `S.mod`, `S.pk`, `R.mod` |
| (new) Easy Quote | `S.w`, `R.w` |

## Known issues and placeholders
- Usage token line overstates cost per 1M by the overage multiple (3×).
- Platform build spread 12 months vs. "36 months" label.
- Architect line on custom builds uses fixed rates, not the rate card.
- Placeholder inputs (blue-on-yellow in the workbook) and app-side assumptions: hosting $20/loc,
  API $2.50 per 1K calls, app input costs, setup $250 @ 75%, extra provider $19.75 @ 75%,
  Injection Management and Clinical Huddle costs borrowed from other catalogue lines.
