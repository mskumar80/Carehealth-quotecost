// Pricing engine tests. Defaults must reproduce CareTech360-Pricing-Methods.xlsx (cached values).
// Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULTS, compute } = require('../src/model.js');

const close = (actual, expected, label, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: expected ${expected}, got ${actual}`);

test('Rate card blends (Rate Card F/H)', () => {
  const R = compute(DEFAULTS());
  close(R.roles[0].bUS, 45.10, 'Developer US blend');
  close(R.roles[0].bIN, 33.70, 'Developer India blend');
});

test('Cost Build-Up unit costs (H19/H33/H46/H59/H69/H78, L columns)', () => {
  const R = compute(DEFAULTS());
  const exp = { platform: [157.3333, 147.7333], usage: [33.64, 33.64], custom: [6097.5, 4172.5], advisory: [820.4, 690.8], appBuild: [7006, 6122], appRun: [671.1333, 579.9333] };
  for (const [k, [us, ind]] of Object.entries(exp)) { close(R.cb[k].perUS, us, k + ' US'); close(R.cb[k].perIN, ind, k + ' India'); }
});

test('Workflow Catalogue (H, O, P, T) and tiers (rows 42–46)', () => {
  const R = compute(DEFAULTS());
  close(R.wc.wf[0].H, 16978.75, 'Patient Intake dev cost');
  close(R.wc.wf[0].O, 38.8945, 'Patient Intake cost/loc/mo');
  close(R.wc.wf[4].P, 466.0833, 'Billing/RCM list');
  close(R.wc.wf[2].T, 91.0426, 'Prior Auth India cost');
  const [s, g, p] = R.wc.tiers;
  close(s.price, 938.4574, 'Starter price'); close(g.price, 1249.6935, 'Growth price'); close(p.price, 1960.8254, 'Premium price');
  close(g.cost, 329.6556, 'Growth cost'); close(g.incTok, 2.3, 'Growth tokens');
  close(R.wc.platFee, 629.3333, 'Platform fee');
});

test('Pricing Summary rows 4–9 (Q, R, O)', () => {
  const R = compute(DEFAULTS());
  const q = [6248.4675, 571.88, 8536.5, 14916.3636, 10778.4615, 1491.4074];
  const r = [0.7362, 0.5, 0.2857, 0.45, 0.35, 0.55];
  R.ps.rows.forEach((row, i) => { close(row.Q, q[i], 'Q' + (i + 4)); close(row.R, r[i], 'R' + (i + 4), 0.0001); assert.equal(row.ok, true); });
  close(R.ps.rows[0].P, 0.0523, 'P4 bundle discount', 0.0001);
  close(R.ps.rows[0].O, 0.375, 'O4 max discount', 0.0001);
});

test('Method Calculator recommended prices (row 51) and mechanics', () => {
  const R = compute(DEFAULTS());
  const rec = [517.5, 67.28, 8536.5, 1692.1455, 12222.7692, 2160];
  R.mc.forEach((m, i) => close(m.rec, rec[i], 'rec ' + i));
  close(R.mech.codevP, 6829.2, 'co-develop price');
  close(R.mech.royCap, 5121.9, 'royalty cap');
  close(R.mech.y1V, 38142.7692, 'app Y1 value');
});

test('Market Pricing India (M, N)', () => {
  const R = compute(DEFAULTS());
  close(R.mp[1].M, 781.4976, 'Growth India $');
  close(R.mp[1].INR, 74242.2707, 'Growth India INR', 0.05);
  close(R.mp[4].M, 5215.625, 'Custom build India');
});

test('Workbook quote totals (Workflow Catalogue C59–C64)', () => {
  const R = compute(DEFAULTS());
  close(R.quote.mrr, 8311.7549, 'MRR');
  close(R.quote.otc, 34231.3252, 'one-time');
});

test('Easy Quote: Growth package with 5 Spine services', () => {
  const S = DEFAULTS();
  S.w.mode = 'growth';
  S.w.sel = S.mod.modules[0].wf.map(w => w.id);
  const R = compute(S);
  assert.equal(R.w.complete, true);
  close(R.w.unitPrice, R.mod.fee + R.w.list * 0.9, 'package price = fee + 90% of list');
  const pkg = R.w.lines.find(l => l.k === 'pkg');
  close(pkg.total, pkg.price * S.q.locs, 'package total');
  assert.ok(R.w.lines.every(l => !l.on || l.ok), 'all included lines above margin floor');
});

test('Easy Quote: package needs exact service count', () => {
  const S = DEFAULTS(); S.w.mode = 'premium'; S.w.sel = S.mod.modules[0].wf.slice(0, 3).map(w => w.id);
  const R = compute(S);
  assert.equal(R.w.complete, false); assert.equal(R.w.need, 4);
});

test('Amortization: 36-month platform build lowers platform cost', () => {
  const S = DEFAULTS(); S.cb.amort = 36;
  const R = compute(S);
  close(R.wc.platCost, 124.0, 'platform cost at 36 months');
});
