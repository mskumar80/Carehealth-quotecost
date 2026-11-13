// CareTech360 Easy Quote — app shell: state, navigation, Easy Quote wizard, Services & packages, PDF, events.
// ===== Easy Quote app shell =====
let S, R, VIEW = 'quote', OC = 0;
const LS_KEY = 'ct360-easyquote-v3';
try { const s = localStorage.getItem(LS_KEY); S = s ? JSON.parse(s) : DEFAULTS(); } catch (e) { S = DEFAULTS(); }
if (!S || !S.w || !S.pk || !S.mod) S = DEFAULTS();
(() => { if (S.cb.amort == null) { const L0 = S.cb.sec.platform.find(l => /development/i.test(l.l)); S.cb.amort = L0 ? L0.s : 12; if (L0) L0.am = 1; } })();
(() => { S.wc.wf.forEach(w => { if (w.onb == null) w.onb = 0; if (w.lic == null) w.lic = 0; if (w.sup == null) w.sup = 0; if (w.sec == null) w.sec = 0; if (w.rd == null) w.rd = 0; }); })();
(() => { const D = {}; DEFAULTS().mod.modules.forEach(m => m.wf.forEach(w => D[w.id] = w.p)); S.mod.modules.forEach(m => m.wf.forEach(w => { if (w.id in D) w.p = D[w.id]; if (w.disc == null) w.disc = 0; })); })();

S.wc.wf.forEach(w => Object.assign(w, workflowMeta(w)));

const VIEWS = {
  quote: { t: 'Easy Quote', icon: '✦', f: vEasy, g: 'Quote' },
  catalogue: { t: 'Services & packages', icon: '◇', f: vCatalogue, g: 'Pricing model' },
  summary: { t: 'Pricing summary', icon: '▤', f: vSummary, g: 'Pricing model' },
  costs: { t: 'Cost build-up', icon: '∑', f: vCosts, g: 'Pricing model' },
  methods: { t: 'Method calculator', icon: '⚖', f: vMethods, g: 'Pricing model' },
  ratesmarket: { t: 'Rates & India Pricing', icon: '⇄', f: vRatesMarket, g: 'Price admin' },
  workflows: { t: 'Workflow Catalogue', icon: '⧉', f: vWorkflows, g: 'Price admin' },
  tiers: { t: 'Tier Configurator', icon: '◈', f: vTiers, g: 'Price admin' },
};
const PCOL = ['#0e7c86', '#4f46e5', '#b45309', '#475569', '#be185d', '#15803d', '#7c3aed'];
const pchip = i => `<span class="pchip" style="--c:${PCOL[i % PCOL.length]}">${esc((S.mod.products[i] || {}).n)}</span>`;
const field = (label, inner, cls = '') => `<div class="row col ${cls}"><label>${label}</label>${inner}</div>`;
const sel2 = (path, opts) => { const v = get(path); return `<select data-p="${path}">${opts.map(([val, lab]) => `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`; };
const stepNum = (path, min = 0) => `<div class="stp"><button data-inc="${path}" data-d="-1" data-min="${min}">−</button>${num(path, { w: 'xs', min, step: 1 })}<button data-inc="${path}" data-d="1" data-min="${min}">+</button></div>`;
const svcPrice = s => S.q.market === 'IN' ? Math.max(s.price * S.rc.index, s.costIN / (1 - R.ps.fl[0])) : s.price;
const lineBy = k => R.w.lines.find(l => l.k === k);

// ---------- KPI strip (pricing-model screens)
function renderKPI() {
  document.getElementById('kpis').style.display = 'none';
}

// ---------- EASY QUOTE WIZARD
const STEPS = ['Hospital details', 'Services & package', 'Other services', 'Final pricing'];
function vEasy() {
  const st = S.w.step, body = [w1, w2, w3, w4][st - 1]();
  const stepper = `<div class="stepper">${STEPS.map((s, i) => `<button class="st ${st === i + 1 ? 'on' : ''} ${st > i + 1 ? 'done' : ''}" data-go="${i + 1}"><span>${st > i + 1 ? '✓' : i + 1}</span>${s}</button>`).join('<i></i>')}</div>`;
  return head('Easy Quote', 'Hospital details → services & package → other services → final pricing and PDF.', `<button class="btn ghost" data-act="newquote">Start a new quote</button>`) +
    stepper + (st < 4 ? `<div class="wgrid"><div class="wmain">${body}</div><div class="wside">${side()}</div></div>` : body);
}
const navBtns = (back, next, label, disabled, hint = '') => `<div class="wnav">${back ? `<button class="btn ghost" data-go="${back}">← Back</button>` : '<span></span>'}
  <div class="flex">${o(hint, 'hint' + (disabled ? ' bad' : ''))}<button class="btn big" data-go="${next}" ${disabled ? 'disabled' : ''}>${label} →</button></div></div>`;

function side() {
  const W = R.w, h = S.w.hosp, q = S.q;
  return `<section class="card sidecard"><div class="eyebrow">Quote summary</div><h3>${o(esc(h.name) || 'New hospital')}</h3>
    <div class="mut">${o(esc(h.specialty) + ' · ' + q.locs + ' location' + (q.locs == 1 ? '' : 's') + ' · ' + S.w.providers + ' providers')}</div>
    <div class="kv2 sk">
      <span>Package</span>${o(W.P.n + (W.P.count ? ` · ${W.sel.length}/${W.P.count}` : ` · ${W.sel.length}`), W.complete ? 'b' : 'b warnTxt')}
      <span>Per location / month</span>${o(money(lineBy('pkg').price))}
      <span>Monthly recurring</span>${o(money(W.mrr), 'b big')}
      <span>One-time</span>${o(money(W.otc), 'b')}
      <span>Contract value (${q.term} mo)</span>${o(money(W.y1), 'b')}
    </div>
    <div class="sidem">${o(`Internal: cost ${money(W.y1c)} · margin ${pct(W.margin)}${W.warn ? ` · ⚠ ${W.warn} below floor` : ''}`, W.warn ? 'bad' : '')}</div>
  </section>`;
}

function w1() {
  const h = 'w.hosp.';
  return card('1 · Hospital details', `<div class="grid3">
      ${field('Hospital / practice name <b class="req">*</b>', txt(h + 'name', 'e.g. Gateway Spine & Pain Center'), 'span2')}
      ${field('Specialty', sel2(h + 'specialty', [['Spine and Pain', 'Spine and Pain'], ['Interventional Radiology', 'Interventional Radiology'], ['Cardiology', 'Cardiology'], ['Multi-specialty', 'Multi-specialty']]))}
      ${field('Primary contact', txt(h + 'contact', 'Full name'))}
      ${field('Title', txt(h + 'title', 'e.g. Practice Administrator'))}
      ${field('EHR system', sel2(h + 'ehr', [['', '— Select —'], ...['Epic', 'eClinicalWorks', 'ModMed', 'athenahealth', 'Oracle Health (Cerner)', 'NextGen', 'Other', 'None'].map(x => [x, x])]))}
      ${field('Email', txt(h + 'email', 'name@hospital.org'))}
      ${field('Phone', txt(h + 'phone', '(314) 555-0100'))}
      ${field('Street address', txt(h + 'addr', ''))}
      ${field('City', txt(h + 'city', ''))}
      ${field('State', txt(h + 'state', ''))}
      ${field('ZIP', txt(h + 'zip', ''))}
    </div>`) +
    card('Locations & quote terms', `<div class="grid3">
      ${field('Number of locations <b class="req">*</b>', stepNum('q.locs', 1))}
      ${field('Contract term', num('q.term', { suf: 'months', w: 's', min: 1 }))}
      ${field('Market', seg('q.market', [['US', 'USA'], ['IN', 'India']]))}
      ${field('Quote number', txt('w.quoteNo'))}
      ${field('Valid for', num('w.validDays', { suf: 'days', w: 'xs', min: 1 }))}
      ${field('Show amounts in', seg('q.cur', [['USD', 'USD $'], ['INR', 'INR ₹']]))}
      ${field('Prepared by', txt('w.preparedBy'), 'span2')}
    </div>
    <div class="row col" style="margin-top:12px"><label>Notes to print on the quote</label><textarea class="txt" rows="2" data-p="w.hosp.notes" data-txt="1" placeholder="Optional">${esc(S.w.hosp.notes)}</textarea></div>`) +
    navBtns(null, 2, 'Next: services & package', !S.w.hosp.name.trim(), !S.w.hosp.name.trim() ? 'Enter the hospital name to continue' : '');
}

function w2() {
  const W = R.w, w = S.w, P = W.P, q = S.q, md = S.mod;
  const pkgCard = p => `<button class="pkg ${w.mode === p.k ? 'on' : ''}" data-set="w.mode" data-val="${p.k}">
      <div class="pt">${esc(p.tag)}</div><div class="pn">${esc(p.n)}</div><div class="pc">Choose ${p.count} services</div>
      <ul><li>${pct(p.disc, 0)} bundle discount</li><li>${p.prov} providers / location included</li></ul></button>`;
  const pkgs = `<div class="pkgs">${S.pk.map(pkgCard).join('')}
    <button class="pkg custom ${w.mode === 'custom' ? 'on' : ''}" data-set="w.mode" data-val="custom"><div class="pt">Your own mix</div><div class="pn">Create a bundle</div><div class="pc">Any number of services</div>
      <ul><li>Set the bundle discount</li><li>Set included providers</li></ul></button></div>`;
  const customRow = w.mode === 'custom' ? `<div class="flex custrow"><div class="row"><label>Bundle discount</label>${num('w.customDisc', { pct: 1, w: 'xs' })}</div>
      <div class="row"><label>Providers included per location</label>${num('w.customProv', { w: 'xs', min: 0, step: 1 })}</div></div>` : '';
  const prog = P.count ? Math.min(1, W.sel.length / P.count) : (W.sel.length ? 1 : 0);
  const filters = [['all', 'All specialties'], ...md.modules.map((m, i) => [String(i), m.n])];
  const shown = W.svcs.filter(s => w.filter === 'all' || String(s.mi) === String(w.filter));
  const full = P.count && W.sel.length >= P.count;
  const cards = shown.map(s => { const dis = full && !s.sel, up = svcPrice(s);
    return `<button class="svc2 ${s.sel ? 'on' : ''} ${dis ? 'dis' : ''}" data-svc="${s.id}">
      <span class="cb">${s.sel ? '✓' : ''}</span>
      <span class="sn">${esc(s.n)}</span>
      <span class="sm">${pchip(s.p)} <small>${esc(s.mod)}</small></span>
      <span class="sp">${s.disc ? `<s>${money(S.q.market === 'IN' ? up / (1 - s.disc) : s.list)}</s> ` : ''}${o(money(up))}<small> per location / month</small>${s.disc ? ` <em class="dtag">−${pct(s.disc)}</em>` : ''}</span>
      <span class="sx">${o('× ' + q.locs + ' = ' + money(up * q.locs) + ' / month')}</span></button>`; }).join('');
  const pl = lineBy('pkg'), pv = lineBy('prov');
  const price = card('Package price', `<div class="kv2">
      <span>Platform fee <small class="mut">hosting, security, onboarding, support</small></span>${o(money(S.q.market === 'IN' ? 0 : R.mod.fee))}
      <span>Selected services (list)</span>${o(money(W.list))}
      <span>Bundle discount</span>${o(W.P.disc ? '−' + pct(W.P.disc, 0) + ' · −' + money(W.list - W.bundled) : '—')}
      <span><b>${esc(W.P.n)} price per location / month</b></span>${o(money(pl.price), 'b big')}
      <span>× ${q.locs} location${q.locs == 1 ? '' : 's'}</span>${o(money(pl.price * pl.qty), 'b')}
    </div>
    <div class="provbox"><div class="row"><label>Number of providers <small class="mut">MD, DO, NP, PA</small></label>${stepNum('w.providers', 0)}</div>
      <div class="kv2"><span>Included (${W.P.prov} per location)</span>${o(W.provIncl)}<span>Additional providers × ${money(pv.price)} / month</span>${o(W.extraProv + ' · ' + money(W.extraProv * pv.price))}</div></div>
    ${S.q.market === 'IN' ? '<p class="mut">India market: package price = US price × India index, never below the India margin floor.</p>' : ''}`, 'pricecard');
  return card('2 · Choose a package, then pick its services', pkgs + customRow +
      `<div class="selbar"><div><b>${o(P.count ? `${W.sel.length} of ${P.count} services selected` : `${W.sel.length} services selected`)}</b>
        ${o(P.count && W.need ? `— pick ${W.need} more` : W.complete ? ' — ready' : '', W.need ? 'warnTxt' : 'okTxt')}</div>
        <div class="flex"><button class="lnkb" data-act="autopick">Auto-pick for ${esc(S.w.hosp.specialty)}</button><button class="lnkb" data-act="clearsvc">Clear</button></div></div>
      <div class="bar"><span style="width:${prog * 100}%"></span></div>
      <div class="chips">${filters.map(([v, l]) => `<button class="chip ${String(w.filter) === v ? 'on' : ''}" data-set="w.filter" data-val="${v}">${esc(l)}</button>`).join('')}</div>
      <div class="svcgrid">${cards}</div>`) + price +
    navBtns(1, 3, 'Next: other services', !W.complete, W.complete ? '' : P.count ? `Select exactly ${P.count} services for ${P.n}` : 'Select at least one service');
}

function w3() {
  const md = S.mod, q = S.q, W = R.w;
  const dr = k => { const l = lineBy(k); return `<div class="row"><label>Discount</label>${num('w.disc.' + k, { pct: 1, w: 'xs', min: 0 })}${o('max ' + pct(l.maxDisc), 'hint ' + (l.disc > l.maxDisc + 1e-9 ? 'bad' : ''))}</div>`; };
  const amt = (k, lab) => { const l = lineBy(k); return o(`${money(l.price)} / ${l.unit}` + (l.on ? ` · <b>${money(l.total)}</b>${lab ? ' ' + lab : ''}` : ''), 'amt'); };
  const osvc = (k, title, sub, body, toggle = true) => `<section class="card osvc ${S.w.inc[k] ? '' : 'off'}"><div class="ch"><h3>${title}</h3>${toggle ? chk('w.inc.' + k, 'Include', true) : ''}</div><p class="sub">${sub}</p>${body}</section>`;
  const apps = md.apps.map((a, i) => { const A = R.mod.apps[i];
    return `<div class="approw ${a.sel ? 'on' : ''}"><label class="ck"><input type="checkbox" data-p="mod.apps.${i}.sel" data-int="1" ${a.sel ? 'checked' : ''}><span></span></label>
      <div><b>${esc(a.n)}</b><div class="mut">${esc(a.d)}</div></div>
      <div class="appq">${num(`mod.apps.${i}.qty`, { w: 'xxs', min: 1, step: 1 })}</div>
      <div class="appp">${o(money(A.p1))}<small>one-time</small></div><div class="appp">${o(money(A.p2))}<small>/ month</small></div></div>`; }).join('');
  return `<div class="osgrid">
    ${osvc('setup', 'Clinic setup & onboarding', 'One-time per location: configuration, branding, staff training and go-live.', `<div class="flex between">${amt('setup', 'for ' + q.locs + ' locations')}${dr('setup')}</div>`)}
    ${osvc('usage', 'AI usage above allowance', 'Billed monthly for AI tokens above what the selected services include.', `<div class="flex between"><div class="row"><label>Expected AI usage</label>${num('q.usage', { suf: 'M tokens / location / mo', w: 'xs', min: 0 })}</div>${dr('usage')}</div>
      <div class="note">${o(`Included: <b>${nf(W.incTok)}M</b> per location · Overage <b>${nf(W.overPerLoc)}M</b> per location → <b>${nf(W.overTot)}M</b> / month`)} · ${amt('usage', '/ month')}</div>`)}
    </div>
    ${osvc('appsMo', 'Apps', 'Select the apps the hospital needs. Each has a one-time build or setup price and a monthly price for hosting, support and updates.',
      `<div class="apps">${apps}</div><div class="flex between apptot">${o(`Selected: <b>${R.mod.appCount}</b> · One-time <b>${money(lineBy('appsOne').price)}</b> · Monthly <b>${money(lineBy('appsMo').price)}</b>`)}
       <div class="flex"><div class="row"><label>Discount one-time</label>${num('w.disc.appsOne', { pct: 1, w: 'xs' })}</div><div class="row"><label>monthly</label>${num('w.disc.appsMo', { pct: 1, w: 'xs' })}</div></div></div>`, false)}
    <div class="osgrid">
    ${osvc('custom', 'Custom workflow builds', 'A new workflow built for the hospital, priced at cost + 40% and paid 30 / 40 / 30.', `<div class="flex between"><div class="row"><label>Projects</label>${stepNum('q.customQty', 0)}</div>
      ${seg('q.owner', [['private', 'Private · 100% IP'], ['codev', 'Co-develop · ' + pct(S.mc.codev, 0)]])}</div><div class="flex between" style="margin-top:8px">${amt('custom')}${dr('custom')}</div>`)}
    ${osvc('advisory', 'Technology advisory', 'Workshops, assessment and roadmap, priced per consultant day.', `<div class="flex between"><div class="row"><label>Consultant days</label>${stepNum('cb.advDays', 1)}</div>${dr('advisory')}</div><div style="margin-top:8px">${amt('advisory')}</div>`)}
    ${osvc('appBuild', 'Custom application build', 'Bespoke mobile or web application, UX and EHR integration (one-time).', `<div class="flex between"><div class="row"><label>Applications</label>${stepNum('q.appBuildQty', 0)}</div>${dr('appBuild')}</div><div style="margin-top:8px">${amt('appBuild')}</div>`)}
    ${osvc('appRun', 'Custom application run', 'Monthly hosting, maintenance and OS/EHR updates per live application.', `<div class="flex between"><div class="row"><label>Live apps</label>${stepNum('q.appRunQty', 0)}</div>${dr('appRun')}</div><div style="margin-top:8px">${amt('appRun', '/ month')}</div>`)}
    </div>` + navBtns(2, 4, 'Review final pricing', false);
}

function w4() {
  const W = R.w, w = S.w, h = w.hosp, q = S.q, sm = w.showMargin;
  const today = new Date(), valid = new Date(today.getTime() + w.validDays * 864e5), fd = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const active = W.lines.filter(l => l.on);
  const rows = ls => ls.map(l => tr([`<b>${esc(l.name)}</b><div class="mut">${esc(l.desc || '')}</div>`, nf(l.qty), money(l.price) + `<div class="mut">per ${l.unit}</div>`, l.disc ? '−' + pct(l.disc) : '—', `<b>${money(l.total)}</b>`,
    ...(sm ? [money(l.tcost), badge(l.ok, pct(l.margin), pct(l.margin))] : [])]));
  const hd = ['Item', 'Qty', 'Unit price', 'Discount', 'Amount', ...(sm ? ['Cost', 'Margin'] : [])];
  const rec = active.filter(l => l.recurring), one = active.filter(l => !l.recurring);
  const svcRows = W.sel.map(s => tr([esc(s.n), esc(s.mod), pchip(s.p), s.disc ? '−' + pct(s.disc) : '—', money(svcPrice(s))]));
  const addr = [h.addr, [h.city, h.state].filter(Boolean).join(', '), h.zip].filter(Boolean).join(' · ');
  return `<div class="qactions"><div class="flex">${chk('w.showMargin', 'Show internal cost & margin', true)}</div>
      <div class="flex"><button class="btn ghost" data-go="3">← Back</button><button class="btn ghost" data-act="copy">Copy summary</button><button class="btn big" data-act="pdf">⬇ Generate PDF</button></div></div>
    <article class="qdoc">
      <header class="qh"><div class="ql"><div class="lg">CT</div><div><b>CareTech360.AI</b><small>Physician-designed intelligence. Personalized to your practice. HIPAA-aligned.</small></div></div>
        <div class="qmeta"><div class="qt2">QUOTE</div><div>${esc(w.quoteNo)}</div><div>Date ${fd(today)}</div><div>Valid until ${fd(valid)}</div></div></header>
      <div class="qparties"><div><div class="eyebrow">Prepared for</div><b>${esc(h.name) || '—'}</b>
          ${h.contact ? `<div>${esc(h.contact)}${h.title ? ', ' + esc(h.title) : ''}</div>` : ''}${h.email ? `<div>${esc(h.email)}</div>` : ''}${h.phone ? `<div>${esc(h.phone)}</div>` : ''}${addr ? `<div>${esc(addr)}</div>` : ''}</div>
        <div><div class="eyebrow">Deal</div><div class="kv2 small"><span>Specialty</span><span>${esc(h.specialty)}</span><span>EHR</span><span>${esc(h.ehr || '—')}</span><span>Locations</span><span>${q.locs}</span><span>Providers</span><span>${w.providers}</span>
          <span>Term</span><span>${q.term} months</span><span>Market</span><span>${q.market === 'IN' ? 'India' : 'USA'} · ${q.cur}</span></div></div>
        <div><div class="eyebrow">Prepared by</div><b>${esc(w.preparedBy)}</b><div class="mut">for CareTech360.AI</div></div></div>
      <h4>${esc(W.pkgName)} — ${W.sel.length} services</h4>
      ${table(['Service', 'Specialty module', 'Product', 'Service discount', 'Unit price / location / month'], svcRows, 'qt4')}
      <div class="pkgline">${o(`Platform fee + services${W.P.disc ? ` − ${pct(W.P.disc, 0)} bundle discount` : ''} = <b>${money(lineBy('pkg').price)}</b> per location / month · ${W.P.prov} providers per location included`)}</div>
      <h4>Monthly recurring</h4>${table(hd, rows(rec), 'qt4')}
      <h4>One-time charges</h4>${one.length ? table(hd, rows(one), 'qt4') : '<p class="mut">None</p>'}
      <div class="qtot">
        <div><span>Monthly recurring</span><b>${money(W.mrr)}</b></div><div><span>Annual recurring</span><b>${money(W.acv)}</b></div>
        <div><span>One-time</span><b>${money(W.otc)}</b></div><div class="hl"><span>Total contract value · ${q.term} months</span><b>${money(W.y1)}</b></div></div>
      ${sm ? `<div class="note">Internal: total cost ${money(W.y1c)} · gross profit ${money(W.gp)} · margin ${pct(W.margin)}${W.warn ? ` · ⚠ ${W.warn} line(s) below margin floor` : ''}</div>` : ''}
      ${lineBy('custom').on ? `<h4>Custom build payment schedule</h4><div class="pay">${['Kickoff', 'Working demo', 'Acceptance'].map((n, i) => `<div><span>${n} · ${pct(S.mc.pay[i], 0)}</span>${money(W.pay[i])}</div>`).join('')}</div>` : ''}
      <h4>Terms</h4><ul class="terms">${terms().map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </article>`;
}
function terms() {
  const w = S.w, t = [`Prices are valid for ${w.validDays} days from the quote date.`, 'Package and provider fees are billed monthly per location from go-live; prices are locked for the contract term.',
    'AI usage above the included allowance is billed monthly in arrears.', 'Setup and app build fees are invoiced at signing.'];
  if (lineBy('custom').on) t.push('Custom builds are invoiced 30% at kickoff, 40% at the working demo and 30% at acceptance; hosting and support are billed separately from go-live.');
  if (S.q.owner === 'codev' && lineBy('custom').on) t.push(`Co-develop builds carry a ${pct(S.mc.royalty, 0)} royalty on eligible net receipts, capped; subject to agreement and counsel review.`);
  if (w.hosp.notes.trim()) t.push(w.hosp.notes.trim());
  return t;
}

// ---------- SERVICES & PACKAGES (pricing model)
function vCatalogue() {
  const md = S.mod, M = R.mod, w = S.w;
  const pk = card('Packages', `<p class="sub">How many services each package bundles, its discount on the services, and the providers included per location. Customers can also create their own bundle.</p>` +
    table(['', ...S.pk.map((p, i) => `<input class="txt c" data-p="pk.${i}.n" data-txt="1" value="${esc(p.n)}">`), 'Create a bundle'], [
      tr(['<b>Services in package</b>', ...S.pk.map((p, i) => num(`pk.${i}.count`, { w: 'xs', min: 1, step: 1 })), '<span class="mut">Any</span>']),
      tr(['<b>Bundle discount</b>', ...S.pk.map((p, i) => num(`pk.${i}.disc`, { pct: 1, w: 'xs' })), num('w.customDisc', { pct: 1, w: 'xs' })]),
      tr(['<b>Providers included / location</b>', ...S.pk.map((p, i) => num(`pk.${i}.prov`, { w: 'xs', min: 0 })), num('w.customProv', { w: 'xs', min: 0 })]),
      tr(['<b>Tagline</b>', ...S.pk.map((p, i) => `<input class="txt" data-p="pk.${i}.tag" data-txt="1" value="${esc(p.tag)}">`), ''])], 'tiers-t'));
  const fees = card('Fees — input cost & margin', table(['Fee', 'Input cost', 'Margin', 'Price', 'Margin floor', 'Basis'], [
    tr(['<b>Platform fee</b> <span class="mut">per location / month</span>', num('mod.platCost', { pre: '$', w: 's', nul: 1, ph: rnd(R.wc.platCost, 2) }), num('mod.platM', { pct: 1, w: 'xs', nul: 1, ph: rnd(R.ps.tm[0] * 100, 2) }), o(usd(M.fee), 'b'), o(pct(R.ps.fl[0])), '<span class="mut">Blank = linked to Cost build-up and Pricing summary</span>']),
    tr(['<b>Additional provider</b> <span class="mut">per provider / month</span>', num('w.provCost', { pre: '$', w: 's' }), num('w.provM', { pct: 1, w: 'xs' }), o(usd(R.w.provPrice), 'b'), o(pct(R.ps.fl[0])), '<span class="mut">Above the package’s included providers</span>']),
    tr(['<b>Clinic setup & onboarding</b> <span class="mut">per location, one-time</span>', num('w.setupCost', { pre: '$', w: 's' }), num('w.setupM', { pct: 1, w: 'xs' }), o(usd(R.w.setupPrice), 'b'), num('w.setupFloor', { pct: 1, w: 'xs' }), '<span class="mut">Configuration, branding, training, go-live</span>'])], 'dense'));
  const modCards = md.modules.map((mo, i) => { const C = M.mods[i];
    return `<div class="mcard"><div class="mh"><div><input class="txt mname" data-p="mod.modules.${i}.n" data-txt="1" value="${esc(mo.n)}"></div><div class="mcount">${mo.wf.length}<small>services</small></div></div>
      <div class="mact"><button class="lnkb" data-act="addwf" data-i="${i}">+ Add service</button></div>
      ${mo.wf.map((wf, j) => { const c = C.wf[j], p = `mod.modules.${i}.wf.${j}`;
        return `<div class="wf on"><div></div><div class="wfm"><input class="txt wfn" data-p="${p}.n" data-txt="1" value="${esc(wf.n)}">
            <div class="wfp">${pchip(wf.p)}</div>
            <div class="wfe"><span class="lab">Input cost</span>${num(p + '.cost', { pre: '$', w: 'xs', nul: 1, ph: rnd(c.pCost, 2) })}<span class="lab">Margin</span>${num(p + '.m', { pct: 1, w: 'xxs', nul: 1, ph: rnd(c.pM * 100, 2) })}
              <span class="lab">Discount</span>${num(p + '.disc', { pct: 1, w: 'xxs', min: 0 })}</div>
            ${o(c.disc ? `List ${usd(c.list)} − ${pct(c.disc)} · margin after discount ${pct(c.effM)}` : '', 'wfnote ' + (c.disc && c.effM < R.ps.fl[0] ? 'bad' : ''))}</div>
          <div class="wfr">${o(usd(c.price), 'b')}<small>/loc/mo</small><button class="x" data-act="delwf" data-i="${i}.${j}" title="Remove service">×</button></div></div>`; }).join('')}</div>`; }).join('');
  const structure = card('Product structure — services by module', `<p class="sub">Platform → Modules (specialty packs) → Services (workflows). Each service is built on one Product, which sets its default input cost and margin — the product is fixed. Override a service’s cost or margin, or give it a discount %; the package bundle discount is applied on top in Easy Quote.</p>
    <div class="plat"><div><b>Platform</b> <span class="mut">hosting · security & HIPAA · onboarding · support · R&D</span></div><div>${o(usd(M.fee))}<small> fee / loc / mo</small></div></div><div class="arrow">▼</div>
    <div class="mods">${modCards}</div><div class="legend"><span class="mut">Products:</span> ${md.products.map((p, i) => pchip(i)).join('')}</div>`);
  const prodRows = md.products.map((p, i) => { const P = M.prods[i], pp = 'mod.products.' + i;
    return tr([pchip(i), `<span class="mut">${esc(p.d)}</span>`, `<span class="mut">${esc(p.drv)}</span>`,
      `<select data-p="${pp}.src" data-num="1">${S.wc.wf.map((x, k) => `<option value="${k}" ${k === p.src ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select>`,
      num(pp + '.cost', { pre: '$', w: 's', nul: 1, ph: rnd(P.linkCost, 2) }), num(pp + '.m', { pct: 1, w: 'xs' }), o(usd(P.price), 'b'), num(pp + '.tok', { w: 'xs', nul: 1, ph: P.linkTok, suf: 'M' }), o(P.uses)]); });
  const products = card('Products — input cost & margin', `<p class="sub">Input cost per service per location / month. Blank cost = linked to the chosen Workflow catalogue line. Price = Input cost ÷ (1 − Margin).</p>` +
    table(['Product', 'What it does', 'Cost driver', 'Cost source', 'Input cost', 'Margin', 'Price / service / loc / mo', 'AI tokens incl.', 'Services'], prodRows, 'dense'));
  const appRows = md.apps.map((a, i) => { const A = M.apps[i], p = 'mod.apps.' + i;
    return tr([`<b>${esc(a.n)}</b><div class="mut">${esc(a.d)}</div>`, num(p + '.c1', { pre: '$', w: 's', nul: 1, ph: rnd(A.lc1, 2) }), num(p + '.m1', { pct: 1, w: 'xs', nul: 1, ph: rnd(A.lm1 * 100, 2) }), o(usd(A.p1), 'b'),
      num(p + '.c2', { pre: '$', w: 's', nul: 1, ph: rnd(A.lc2, 2) }), num(p + '.m2', { pct: 1, w: 'xs', nul: 1, ph: rnd(A.lm2 * 100, 2) }), o(usd(A.p2), 'b'), `<span class="mut">${esc(a.own)}</span>`]); });
  const apps = card('Apps — input cost & margin', `<div class="flex" style="margin-bottom:10px"><div class="row"><label>One-time margin floor</label>${num('mod.appFloorOne', { pct: 1, w: 'xs' })}</div><div class="row"><label>Monthly margin floor</label>${num('mod.appFloorMo', { pct: 1, w: 'xs' })}</div>
    <span class="mut">Patient mobile app costs link to Cost build-up 5a / 5b when blank.</span></div>` +
    table(['App', 'One-time input cost', 'Margin', 'One-time price', 'Monthly input cost', 'Margin', 'Monthly price', 'IP owner'], appRows, 'dense'));
  return head('Services & packages', 'Configure what Easy Quote sells: packages, fees, the service catalogue and apps — each with an input cost and margin.', `<button class="btn ghost" data-act="reset">Reset all to workbook values</button>`) + pk + fees + structure + apps + products;
}

// ---------- PDF
let JSPDF_OK = !!(window.jspdf && window.jspdf.jsPDF);
function pm(v) { if (S.q.cur === 'INR') return 'INR ' + Math.round(v * S.rc.fx).toLocaleString('en-IN'); return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function buildPDF() {
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = R.w, w = S.w, h = w.hosp, q = S.q, pw = doc.internal.pageSize.getWidth(), M = 40, teal = [11, 85, 99];
  const today = new Date(), valid = new Date(today.getTime() + w.validDays * 864e5), fd = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setFillColor(...teal); doc.rect(0, 0, pw, 78, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('CareTech360.AI', M, 38);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(['Physician-designed intelligence.', 'Personalized to your practice. HIPAA-aligned.'], M, 52);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text('QUOTE', pw - M, 32, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text([w.quoteNo, `${fd(today)}  ·  Valid until ${fd(valid)}`], pw - M, 50, { align: 'right' });
  doc.setTextColor(20); let y = 104;
  const col = (x, title, lines) => { doc.setFontSize(8); doc.setTextColor(14, 124, 134); doc.setFont('helvetica', 'bold'); doc.text(title.toUpperCase(), x, y);
    doc.setTextColor(20); let yy = y + 14; lines.filter(Boolean).forEach((l, i) => { doc.setFont('helvetica', i === 0 ? 'bold' : 'normal'); doc.setFontSize(i === 0 ? 11 : 9); doc.text(String(l), x, yy, { maxWidth: 170 }); yy += i === 0 ? 14 : 12; }); return yy; };
  const addr = [h.addr, [h.city, h.state].filter(Boolean).join(', '), h.zip].filter(Boolean).join(', ');
  const y1 = col(M, 'Prepared for', [h.name || '—', h.contact && (h.contact + (h.title ? ', ' + h.title : '')), h.email, h.phone, addr]);
  const y2 = col(M + 190, 'Deal', [W.pkgName, `${h.specialty}${h.ehr ? ' · EHR: ' + h.ehr : ''}`, `${q.locs} location(s) · ${w.providers} providers`, `${q.term}-month term · ${q.market === 'IN' ? 'India' : 'USA'} · ${q.cur}`]);
  const y3 = col(M + 380, 'Prepared by', [w.preparedBy, 'for CareTech360.AI']);
  y = Math.max(y1, y2, y3) + 10;
  const base = { theme: 'grid', margin: { left: M, right: M }, styles: { fontSize: 9, cellPadding: 5, lineColor: [227, 234, 236], lineWidth: .5 }, headStyles: { fillColor: [240, 246, 247], textColor: [60, 80, 88], fontStyle: 'bold' } };
  const sect = t => { if (y > 700) { doc.addPage(); y = 50; } doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...teal); doc.text(t, M, y); doc.setTextColor(20); y += 6; };
  sect(`${W.pkgName} — ${W.sel.length} services`);
  doc.autoTable({ ...base, startY: y, head: [['Service', 'Specialty module', 'Product', 'Discount', 'Unit price / location / month']], body: W.sel.map(s => [s.n, s.mod, S.mod.products[s.p].n, s.disc ? '-' + pct(s.disc) : '-', pm(svcPrice(s))]),
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } } });
  y = doc.lastAutoTable.finalY + 14; doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Platform fee + services${W.P.disc ? ` - ${pct(W.P.disc, 0)} bundle discount` : ''} = ${pm(lineBy('pkg').price)} per location / month  ·  ${W.P.prov} providers per location included`, M, y); y += 20;
  const sm = w.showMargin, hdr = ['Item', 'Qty', 'Unit price', 'Discount', 'Amount', ...(sm ? ['Cost', 'Margin'] : [])];
  const body = ls => ls.map(l => [l.name + (l.desc ? '\n' + l.desc : ''), nf(l.qty), pm(l.price) + '\nper ' + l.unit, l.disc ? '-' + pct(l.disc) : '-', pm(l.total), ...(sm ? [pm(l.tcost), pct(l.margin)] : [])]);
  const cs = { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' }, 5: { halign: 'right' }, 6: { halign: 'right' } };
  const act = W.lines.filter(l => l.on), rec = act.filter(l => l.recurring), one = act.filter(l => !l.recurring);
  sect('Monthly recurring'); doc.autoTable({ ...base, startY: y, head: [hdr], body: body(rec), columnStyles: cs, foot: [['Monthly recurring total', '', '', '', pm(W.mrr), ...(sm ? ['', ''] : [])]], footStyles: { fillColor: [232, 244, 244], textColor: 20, fontStyle: 'bold', halign: 'right' } });
  y = doc.lastAutoTable.finalY + 20;
  if (one.length) { sect('One-time charges'); doc.autoTable({ ...base, startY: y, head: [hdr], body: body(one), columnStyles: cs, foot: [['One-time total', '', '', '', pm(W.otc), ...(sm ? ['', ''] : [])]], footStyles: { fillColor: [232, 244, 244], textColor: 20, fontStyle: 'bold', halign: 'right' } }); y = doc.lastAutoTable.finalY + 20; }
  if (y > 610) { doc.addPage(); y = 50; }
  sect('Summary');
  const sumRows = [['Monthly recurring', pm(W.mrr)], ['Annual recurring', pm(W.acv)], ['One-time charges', pm(W.otc)], [`Total contract value (${q.term} months)`, pm(W.y1)]];
  if (sm) sumRows.push(['Internal: total cost / margin', `${pm(W.y1c)} / ${pct(W.margin)}`]);
  doc.autoTable({ ...base, startY: y, body: sumRows, tableWidth: 300, margin: { left: pw - M - 300 }, columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: d => { if (d.row.index === 3) { d.cell.styles.fillColor = teal; d.cell.styles.textColor = 255; d.cell.styles.fontStyle = 'bold'; } } });
  y = doc.lastAutoTable.finalY + 20;
  if (lineBy('custom').on) { sect('Custom build payment schedule'); doc.autoTable({ ...base, startY: y, head: [['Kickoff 30%', 'Working demo 40%', 'Acceptance 30%']], body: [W.pay.map(pm)] }); y = doc.lastAutoTable.finalY + 20; }
  sect('Terms'); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); y += 8;
  terms().forEach(t => { const ls = doc.splitTextToSize('•  ' + t, pw - 2 * M); if (y + ls.length * 12 > 750) { doc.addPage(); y = 50; } doc.text(ls, M, y); y += ls.length * 12 + 2; });
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120); doc.text(`CareTech360.AI · ${w.quoteNo} · Page ${i} of ${n}`, pw / 2, 775, { align: 'center' }); }
  return doc;
}
async function generatePDF(btn) {
  if (!JSPDF_OK) { toast('PDF library unavailable in this view'); return; }
  if (!R.w.complete) { toast('Finish the package selection first'); S.w.step = 2; recalc(true); return; }
  const doc = buildPDF(), slug = (S.w.hosp.name || 'hospital').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
  const filename = `CareTech360-Quote-${slug}-${S.w.quoteNo}.pdf`, blob = doc.output('blob');
  btn && (btn.disabled = true);
  try {
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename, data: blob }); toast('PDF saved'); }
    else { doc.save(filename); toast('PDF downloaded'); }
  } catch (e) {
    const c = e && e.code;
    if (c === 'declined') toast('Download cancelled');
    else if (c === 'rate_limited') toast('A download prompt is already open');
    else { try { doc.save(filename); } catch (e2) { toast('PDF download is not available in this view'); } }
  } finally { btn && (btn.disabled = false); }
}

// ---------- events
function renderNav() {
  let g = ''; document.getElementById('nav').innerHTML = Object.entries(VIEWS).map(([k, v]) => { const hd = v.g !== g ? `<div class="ng">${(g = v.g)}</div>` : '';
    return hd + `<a href="#${k}" class="${k === VIEW ? 'on' : ''}"><span>${v.icon}</span>${v.t}</a>`; }).join('');
}
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'workflow-search') {
    const start=t.selectionStart,end=t.selectionEnd; S.ui.wfSearch=t.value; recalc(true);
    const search=document.getElementById('workflow-search'); if(search){search.focus();search.setSelectionRange(start,end);} return;
  }
  if (!t.dataset || !t.dataset.p || t.type === 'checkbox' || t.tagName === 'SELECT') return;
  if (t.dataset.txt) { set(t.dataset.p, t.value); recalc(false); if (t.dataset.p === 'w.hosp.name') refreshNav(); return; }
  let v = t.value.trim();
  if (v === '') { if (t.dataset.nul) { set(t.dataset.p, null); recalc(false); } return; }
  v = parseFloat(v); if (!isFinite(v)) return; if (t.dataset.pct) v /= 100;
  set(t.dataset.p, v); recalc(false);
});
function refreshNav() { document.querySelectorAll('.wnav [data-go]').forEach(b => { if (S.w.step === 1 && +b.dataset.go === 2) b.disabled = !S.w.hosp.name.trim(); }); const h = document.querySelector('.wnav .hint'); if (h && S.w.step === 1) { h.textContent = S.w.hosp.name.trim() ? '' : 'Enter the hospital name to continue'; } }
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.role) { const L = get(t.dataset.role), v = +t.value;
    if (v < 0) { const [, , k, j] = t.dataset.role.split('.'); L.us = rnd(R.cb[k].lines[+j].uUS, 2); delete L.role; if (typeof L.h !== 'number') L.h = 1; }
    else { L.role = v; if (L.h == null) L.h = 1; delete L.inr; }
    recalc(true); return; }
  if (!t.dataset.p) return;
  if (t.type === 'checkbox') { set(t.dataset.p, t.dataset.int ? (t.checked ? 1 : 0) : t.checked);
    if (t.dataset.p.startsWith('mod.apps.')) { S.w.inc.appsMo = 1; S.w.inc.appsOne = 1; }
    recalc(true); }
  else if (t.tagName === 'SELECT') { set(t.dataset.p, t.dataset.num ? +t.value : t.value); recalc(true); }
  else if (t.dataset.txt && /pk\.|mod\.|rc\.roles/.test(t.dataset.p)) recalc(true);
  else if (t.dataset.p === 'cb.amort' || t.dataset.p === 'wc.recovery') recalc(true);
});
function trimSel() { const P = R.w.P; if (P.count && S.w.sel.length > P.count) S.w.sel = S.w.sel.slice(0, P.count); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-set],[data-act],[data-go],[data-svc],[data-inc],[data-tog]'); if (!b || b.disabled) return;
  if (b.dataset.tog) { set(b.dataset.tog, get(b.dataset.tog) === 'C' ? 'U' : 'C'); recalc(true); return; }
  if (b.dataset.go) { const to = +b.dataset.go; if (to > 1 && !S.w.hosp.name.trim() && to > S.w.step) { toast('Enter the hospital name first'); return; }
    if (to > 2 && !R.w.complete && to > S.w.step) { toast('Complete the package selection first'); S.w.step = 2; recalc(true); return; }
    S.w.step = to; save(); renderView(); window.scrollTo(0, 0); return; }
  if (b.dataset.svc) { const id = b.dataset.svc, i = S.w.sel.indexOf(id), P = R.w.P;
    if (i >= 0) S.w.sel.splice(i, 1); else { if (P.count && S.w.sel.length >= P.count) { toast(`${P.n} includes ${P.count} services — remove one first or create a bundle`); return; } S.w.sel.push(id); }
    recalc(true); return; }
  if (b.dataset.inc) { const p = b.dataset.inc, v = (+get(p) || 0) + (+b.dataset.d); set(p, Math.max(+b.dataset.min || 0, v)); recalc(true); return; }
  if (b.dataset.set) { let v = b.dataset.val; if (b.dataset.n) v = +v; if (b.dataset.set.startsWith('ui.') && !S.ui) S.ui = {}; set(b.dataset.set, v);
    if (b.dataset.set === 'q.market') S.q.cur = v === 'IN' ? 'INR' : 'USD';
    if (b.dataset.set === 'w.mode') { R = compute(S); trimSel(); }
    recalc(true); return; }
  const a = b.dataset.act;
  if (a === 'autopick') { const P = R.w.P, n = P.count || 5, spec = S.w.hosp.specialty, mi = S.mod.modules.findIndex(m => m.n === spec);
    const names = new Set(R.w.sel.map(s => s.n.toLowerCase())), pool = [...R.w.svcs.filter(s => s.mi === mi), ...R.w.svcs.filter(s => s.mi !== mi)];
    for (const s of pool) { if (S.w.sel.length >= n) break; if (!s.sel && !names.has(s.n.toLowerCase())) { S.w.sel.push(s.id); names.add(s.n.toLowerCase()); } }
    recalc(true); return; }
  if (a === 'clearsvc') { S.w.sel = []; recalc(true); return; }
  if (a === 'pdf') { generatePDF(b); return; }
  if (a === 'copy') { copyQuote(); return; }
  if (a === 'newquote') { openDialog('Start a new quote?', 'Hospital details and selections will be cleared. Your pricing model settings stay as they are.', 'Start new quote', () => {
    S.w = Object.assign(WIZ_DEFAULTS(), { provCost: S.w.provCost, provM: S.w.provM, setupCost: S.w.setupCost, setupM: S.w.setupM, setupFloor: S.w.setupFloor, customDisc: S.w.customDisc, customProv: S.w.customProv });
    S.mod.apps.forEach(x => { x.sel = 0; x.qty = 1; }); Object.assign(S.q, { locs: 1, owner: 'private', customQty: 1, appBuildQty: 1, appRunQty: 1 });
    VIEW = 'quote'; location.hash = 'quote'; recalc(true); toast('New quote started'); }); return; }
  if (a === 'reset') { openDialog('Reset to workbook values?', 'Every pricing-model setting and the current quote go back to the original workbook values.', 'Reset', () => { S = DEFAULTS(); recalc(true); toast('Reset to workbook values'); }); return; }
  if (a === 'addrole') { S.rc.roles.push({ n: 'New role', us: 75, in: 25, usS: null, inS: null }); recalc(true); return; }
  if (a === 'delrole') { const i = +b.dataset.i, used = SEC_KEYS.some(k => S.cb.sec[k].some(L => L.role === i)) || i < 4;
    if (used) { toast('This role is used by cost lines or workflow rates — reassign them before removing'); return; }
    openDialog('Remove role?', `“${esc(S.rc.roles[i].n)}” will be removed from the rate card.`, 'Remove', () => { S.rc.roles.splice(i, 1);
      SEC_KEYS.forEach(k => S.cb.sec[k].forEach(L => { if (L.role != null && L.role > i) L.role--; })); recalc(true); }); return; }
  if (a === 'addline') { const k = b.dataset.i, lab = b.dataset.kind === 'labor';
    S.cb.sec[k].push(lab ? { l: 'New labor cost', t: 'C', d: 'Hours × blended rate', q: 1, role: 0, h: 1, s: 1 } : { l: 'New fixed cost', t: 'U', d: 'Quantity × unit cost', q: 1, us: 0, s: 1 }); recalc(true); return; }
  if (a === 'delline') { const [k, j] = b.dataset.i.split('.'); const L = S.cb.sec[k][+j];
    openDialog('Remove cost line?', `“${esc(L.l)}” will be removed from the ${esc(k)} cost pool.`, 'Remove', () => { S.cb.sec[k].splice(+j, 1); recalc(true); }); return; }
  if (a === 'addwf') { const mi = +b.dataset.i;
    openDialog('Add a service to ' + esc(S.mod.modules[mi].n), `<div class="row col"><label>Service name</label><input class="txt" id="nwn" value="New service"></div>
      <div class="row col" style="margin-top:10px"><label>Built on product <small class="mut">(cannot be changed later)</small></label><select id="nwp">${S.mod.products.map((p, k) => `<option value="${k}">${esc(p.n)}</option>`).join('')}</select></div>`,
      'Add service', () => { const n = (document.getElementById('nwn') || {}).value || 'New service', p = +(document.getElementById('nwp') || {}).value || 0;
        S.mod.modules[mi].wf.push({ id: 'w' + Date.now(), n, p, disc: 0 }); recalc(true); });
    return; }
  if (a === 'delwf') { const [i, j] = b.dataset.i.split('.').map(Number), id = S.mod.modules[i].wf[j].id; S.mod.modules[i].wf.splice(j, 1); S.w.sel = S.w.sel.filter(x => x !== id); recalc(true); return; }
  if (a === 'editwf') { const i = +b.dataset.i;
    if (!S.ui) S.ui = {}; S.ui.wfSel = i;
    openDialog('Edit workflow', workflowEditor(S.wc.wf[i]), 'Save & edit costs', () => {
      Object.assign(S.wc.wf[i], readWorkflowEditor()); S.ui.wfEdit='1';
      S.ui.wfSearch=''; S.ui.wfSpecialty=''; S.ui.wfType=''; S.ui.wfStatus=''; recalc(true);
    }); return; }
  if (a === 'addcatwf') {
    openDialog('New workflow', workflowEditor(), 'Create workflow', () => {
      S.wc.wf.push({ ...readWorkflowEditor(), dev:0, arch:0, qa:0, pm:0, onb:0, api:0, locs:60, lic:0, run:0, sup:0, sec:0, rd:0, tok:0 });
      S.wc.inc.push([0,0,0]); if(!S.ui)S.ui={}; Object.assign(S.ui,{wfSel:S.wc.wf.length-1,wfEdit:'1',wfSearch:'',wfSpecialty:'',wfType:'',wfStatus:''}); recalc(true);
    }); return; }
  if (a === 'delcatwf') { const i = +b.dataset.i;
    openDialog('Delete workflow?', `Remove "${esc(S.wc.wf[i].n)}" from the workflow catalogue?`, 'Delete', () => {
      S.wc.wf.splice(i, 1); S.wc.inc.splice(i, 1);
      if (!S.ui) S.ui = {};
      if (S.ui.wfSel === i) S.ui.wfSel = -1; else if (S.ui.wfSel > i) S.ui.wfSel--;
      recalc(true); }); return; }
});
function copyQuote() {
  const W = R.w, q = S.q, h = S.w.hosp, out = [];
  out.push(`CareTech360.AI Quote ${S.w.quoteNo} — ${h.name || 'Untitled hospital'}`, `${W.pkgName} · ${q.locs} location(s) · ${S.w.providers} providers · ${q.term}-month term`, '', 'SERVICES');
  W.sel.forEach(s => out.push(`  ${s.n} (${s.mod}) — ${money(svcPrice(s))} / location / month`));
  const ln = l => `  ${l.name}: ${nf(l.qty)} × ${money(l.net)} / ${l.unit} = ${money(l.total)}`;
  out.push('', 'MONTHLY RECURRING'); W.lines.filter(l => l.on && l.recurring).forEach(l => out.push(ln(l))); out.push(`  Total monthly: ${money(W.mrr)}`);
  out.push('', 'ONE-TIME'); W.lines.filter(l => l.on && !l.recurring).forEach(l => out.push(ln(l))); out.push(`  Total one-time: ${money(W.otc)}`, '', `Contract value (${q.term} months): ${money(W.y1)}`);
  const text = out.join('\n');
  try { navigator.clipboard.writeText(text).then(() => toast('Summary copied'), () => fallbackCopy(text)); } catch (e) { fallbackCopy(text); }
}
function route() { const h = location.hash.slice(1); VIEW = VIEWS[h] ? h : 'quote'; renderNav(); renderKPI(); renderView(); window.scrollTo(0, 0); }
window.addEventListener('hashchange', route);
R = compute(S); route();
