// CareTech360 Easy Quote — screens: shared helpers + pricing-model (admin) views.
// Loaded after src/model.js and before src/ui/app.js. Uses globals S (state) and R (computed results) declared in app.js.
// ---------- helpers
const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], S);
function set(p, v) { const ks = p.split('.'); let o = S; ks.slice(0, -1).forEach(k => o = o[k]); o[ks.at(-1)] = v; }
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rnd = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
function usd(v, dp) { if (!isFinite(v)) return '—'; dp = dp ?? (Math.abs(v) < 100 ? 2 : 0); return (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
function inr(v, dp = 0) { return (v < 0 ? '−₹' : '₹') + Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
function money(v, dp) { return S.q.cur === 'INR' ? inr(v * S.rc.fx, dp ?? (Math.abs(v * S.rc.fx) < 100 ? 2 : 0)) : usd(v, dp); }
const pct = (v, d = 1) => isFinite(v) ? (v * 100).toFixed(d).replace(/\.0+$/, '') + '%' : '—';
const nf = (v, d = 2) => isFinite(v) ? (+v).toLocaleString('en-US', { maximumFractionDigits: d }) : '—';
const o = (html, cls = '') => `<span data-o="${OC++}" class="${cls}">${html}</span>`;
function num(path, opt = {}) {
  const v = get(path), isP = !!opt.pct;
  const dv = v == null ? '' : (isP ? rnd(v * 100, 4) : v);
  const ph = opt.ph != null ? ` placeholder="${esc(opt.ph)}"` : '';
  return `<span class="inp${opt.w ? ' w' + opt.w : ''}">${opt.pre ? `<i>${opt.pre}</i>` : ''}<input aria-label="${esc(path.split('.').slice(-2).join(' '))}" type="number" inputmode="decimal" step="${opt.step || 'any'}" ${opt.min != null ? `min="${opt.min}"` : ''} data-p="${path}"${isP ? ' data-pct="1"' : ''}${opt.nul ? ' data-nul="1"' : ''}${ph} value="${dv}">${isP ? '<i>%</i>' : opt.suf ? `<i>${opt.suf}</i>` : ''}</span>`;
}
const txt = (path, ph = '') => `<input class="txt" type="text" data-p="${path}" data-txt="1" placeholder="${esc(ph)}" value="${esc(get(path))}">`;
const chk = (path, label = '', int = false) => `<label class="sw"><input type="checkbox" data-p="${path}"${int ? ' data-int="1"' : ''} ${get(path) ? 'checked' : ''}><span></span>${label}</label>`;
function seg(path, opts, isNum) { const v = get(path); return `<div class="seg">${opts.map(([val, lab]) => `<button data-set="${path}" data-val="${val}"${isNum ? ' data-n="1"' : ''} class="${String(v) === String(val) ? 'on' : ''}">${lab}</button>`).join('')}</div>`; }
function sel(path, opts) { const v = get(path); return `<select data-p="${path}">${opts.map(x => `<option ${x == v ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>`; }
const badge = (ok, okT = 'OK', badT = 'Below floor') => o(ok ? okT : badT, 'badge ' + (ok ? 'good' : 'bad'));
const tip = t => `<span class="tip" tabindex="0" data-tip="${esc(t)}">i</span>`;
const card = (title, body, extra = '', sub = '') => `<section class="card ${extra}"><div class="ch"><h3>${title}</h3>${sub}</div>${body}</section>`;
const table = (head, rows, cls = '') => `<div class="tw"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const tr = (cells, cls = '') => `<tr class="${cls}">${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
const head = (t, p, actions = '') => `<div class="vhead"><div><div class="eyebrow page-eyebrow">CareTech360 / Workspace</div><h1>${t}</h1><p>${p}</p></div><div class="acts">${actions}</div></div>`;

// ---------- PRICING SUMMARY
function vSummary() {
  const P = R.ps;
  const rows = P.rows.map((r, i) => tr([`<b>${SERVICES[i]}</b><div class="mut">${SVC_MODEL[i]} · ${SVC_FREQ[i]}</div>`, `<span class="mut">${SVC_UNITS[i]}</span>`,
    o(nf(r.H)), o(usd(r.I)), o(usd(r.J)), i === 2 ? o(pct(r.K)) : num('ps.tm.' + i, { pct: 1, w: 's' }), o(usd(r.L)), o(usd(r.M)),
    num('ps.fl.' + i, { pct: 1, w: 's' }), o(pct(r.O)), i === 0 ? o(pct(r.P)) + `<div class="mut">bundle</div>` : num('ps.disc.' + i, { pct: 1, w: 's' }),
    o(usd(r.Q), 'b'), o(pct(r.R)), badge(r.ok, 'OK', 'Below floor')]));
  return head('Pricing summary', 'USA-market list prices per service. List price = Cost ÷ (1 − Target margin). Max discount = 1 − (1 − Target) ÷ (1 − Floor).') +
    card('Services', table(['Service', 'Billing unit', 'Qty', 'Cost / unit', 'Total cost', 'Target margin', 'List / unit', 'Total list', 'Min floor', 'Max discount', 'Discount', 'To customer', 'Realized margin', 'Check'], rows, 'dense'),
      '', `<div class="row"><label>Custom build markup (Cost +) ${tip('Target margin for Custom Builds = Markup ÷ (1 + Markup).')}</label>${num('ps.markup', { pct: 1, w: 's' })}</div>`) +
    `<p class="foot">Quantities come from the Quote builder (locations, overage tokens, projects, consultant days, apps). The subscription “discount” is the tier bundle discount versus cost-plus list.</p>`;
}

// ---------- COSTS (one tab per service cost model)
const COST_TABS = [
  { k: 'platform', i: 0, t: 'Subscription', icon: '▣', unit: 'location / month', div: 'cb.locs', divL: 'Locations served', what: 'Shared monthly platform cost pool — hosting, licenses, security, onboarding, support and R&D — spread across every location served. Workflow build costs are added per tier on Workflows & tiers.' },
  { k: 'usage', i: 1, t: 'Usage meters', icon: '⏲', unit: '1M tokens', div: null, divL: '1M-token blocks', what: 'Pass-through cost of AI tokens, storage, egress, messaging, logging and payment fees for usage above the included allowance.' },
  { k: 'advisory', i: 3, t: 'Technology advisory', icon: '✎', unit: 'consultant day', div: 'cb.advDays', divL: 'Consultant days', what: 'Effort-based engagement cost — consultant and clinical SME time, tools, travel, reporting and discovery — priced per consultant day.' },
  { k: 'custom', i: 2, t: 'Custom build', icon: '⚒', unit: 'workflow project', div: 'cb.projects', divL: 'Projects', what: 'One-time developer, architect, QA, PM and deployment effort plus tooling and components to build one workflow.' },
  { k: 'appBuild', i: 4, t: 'Application build', icon: '⌂', unit: 'application', div: 'cb.apps', divL: 'Applications', what: 'One-time mobile/web development, UX design, EHR integration and security review for one application.' },
  { k: 'appRun', i: 5, t: 'Application run', icon: '↻', unit: 'application / month', div: 'cb.appsLive', divL: 'Applications live', what: 'Monthly hosting, app-store fees and maintenance for each live application.' }];
const LINK_LAB = { locs: 'locations served', ovr1000: 'overage × 1,000 (1K blocks)', ovr: 'overage (M tokens)', advDays: 'consultant days', appsLive: 'apps live' };
function vCosts() {
  if (!S.ui) S.ui = {};
  const tab = COST_TABS.find(x => x.k === S.ui.costTab) || COST_TABS[0], k = tab.k, C = R.cb[k], lines = S.cb.sec[k], roleNames = S.rc.roles.map(r => r.n);
  const tabs = `<div class="ctabs">${COST_TABS.map(x => { const c = R.cb[x.k]; return `<button class="ctab ${x.k === k ? 'on' : ''}" data-set="ui.costTab" data-val="${x.k}">
      <span class="ci">${x.icon}</span><span><b>${x.t}</b><small>${o(usd(c.perUS) + ' / ' + x.unit)}</small></span></button>`; }).join('')}</div>`;
  // pricing view of this pool
  const tm = R.ps.tm[tab.i], fl = R.ps.fl[tab.i], price = C.perUS / (1 - tm), floor = C.perUS / (1 - fl);
  const ctrl = sum(lines.map((L, j) => L.t === 'C' ? C.lines[j].pUS : 0)), unc = C.tUS - ctrl, labor = sum(lines.map((L, j) => L.role != null ? C.lines[j].pUS : 0));
  const tile = (lab, val, sub = '', cls = '') => `<div class="ctile ${cls}"><span>${lab}</span>${val}<small>${sub}</small></div>`;
  const divInput = tab.div ? num(tab.div, { w: 'xs', min: 1, step: 1 }) : o('1');
  const usageExtra = k === 'usage' ? `<div class="flex" style="margin-top:10px"><div class="row"><label>Included allowance</label>${num('cb.tokAllow', { w: 'xs', suf: 'M / loc / mo' })}</div>
      <div class="row"><label>Expected usage</label>${num('cb.tokExp', { w: 'xs', suf: 'M / loc / mo' })}</div>${o('Billable overage <b>' + nf(R.cb.ovr) + 'M</b> per location / month', 'hint')}</div>` : '';
  const summary = `<section class="card csum"><div class="ch"><h3>${tab.icon} ${tab.t} — underlying cost model</h3><span class="mut">${SVC_MODEL[tab.i]} · ${SVC_FREQ[tab.i]}</span></div>
    <p class="sub">${tab.what}</p>
    <div class="ctiles">
      ${tile('Total cost pool', o(usd(C.tUS)), 'per period')}
      ${tile('÷ ' + tab.divL, divInput, 'billing units')}
      ${tile('Cost per ' + tab.unit, o(usd(C.perUS), 'b'), o('India ' + usd(C.perIN)), 'hl')}
      ${tile(k === 'platform' ? 'Platform fee' : 'List price', o(usd(price), 'b'), o('at ' + pct(tm) + ' target margin'))}
      ${tile('Floor price', o(usd(floor)), o('at ' + pct(fl) + ' min margin'))}
    </div>${usageExtra}
    <div class="csplit">${o(`<span class="seg c" style="width:${C.tUS ? ctrl / C.tUS * 100 : 0}%"></span><span class="seg u" style="width:${C.tUS ? unc / C.tUS * 100 : 0}%"></span>`, 'cbar')}
      <div class="flex mut">${o(`<span class="dot c"></span> Controllable ${usd(ctrl)} (${pct(C.tUS ? ctrl / C.tUS : 0, 0)})`)} ${o(`<span class="dot u"></span> Uncontrollable ${usd(unc)} (${pct(C.tUS ? unc / C.tUS : 0, 0)})`)} ${o(`Labor ${usd(labor)} · Non-labor ${usd(C.tUS - labor)}`)}</div></div>
  </section>`;
  const rows = lines.map((L, j) => { const c = C.lines[j], p = `cb.sec.${k}.${j}`, share = C.tUS ? c.pUS / C.tUS : 0;
    const roleSel = `<select data-role="${p}"><option value="-1" ${L.role == null ? 'selected' : ''}>Fixed $ (non-labor)</option>${roleNames.map((n, ri) => `<option value="${ri}" ${ri === L.role ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
    return tr([
      `<input class="txt cl" data-p="${p}.l" data-txt="1" value="${esc(L.l)}"><input class="txt cd" data-p="${p}.d" data-txt="1" value="${esc(L.d)}" placeholder="What the driver counts">`,
      `<button class="pill ${L.t === 'C' ? 'c' : 'u'} pbtn" data-tog="${p}.t" title="Click to switch">${L.t === 'C' ? 'Controllable' : 'Uncontrollable'}</button>`,
      roleSel + (L.role != null ? `<div class="mut" style="margin-top:4px">${typeof L.h === 'number' ? num(p + '.h', { w: 'xs', suf: 'hrs' }) : o(c.hv + ' hrs ' + (L.h === 'day' ? '/ day' : '/ FTE month'))} × ${o(usd(L.role != null ? R.roles[L.role].bUS : 0) + '/hr')}</div>` : ''),
      L.link ? o(nf(c.qty)) + `<div class="mut">= ${LINK_LAB[L.link]}</div>` : num(p + '.q', { w: 's' }),
      L.role != null ? o(usd(c.uUS)) : num(p + '.us', { pre: '$', w: 's' }),
      L.am ? o(c.sp + ' mo') + '<div class="mut">= amortization</div>' : num(p + '.s', { w: 'xxs', suf: 'mo', min: 1 }),
      o(usd(c.pUS), 'b'),
      o(`<b>${pct(share, 0)}</b><span><i style="width:${share * 100}%"></i></span>`, 'share'),
      L.role != null || L.inr == null ? o(usd(c.uIN)) : num(p + '.inr', { pre: '$', w: 's' }), o(usd(c.pIN)),
      `<button class="x" data-act="delline" data-i="${k}.${j}" title="Remove cost line">×</button>`]); });
  rows.push(tr(['<b>Total cost pool</b>', '', '', '', '', '', o(usd(C.tUS), 'b'), '', '', o(usd(C.tIN), 'b'), ''], 'sum'));
  rows.push(tr([`<b>Cost per ${tab.unit}</b><div class="mut">${o('÷ ' + (tab.div ? nf(get(tab.div)) : 1) + ' ' + tab.divL.toLowerCase())}</div>`, '', '', '', '', '', o(usd(C.perUS), 'b big'), '', '', o(usd(C.perIN), 'b big'), ''], 'sum hl'));
  const tbl = card('Cost lines', `<p class="sub">Period cost = Driver qty × Unit cost ÷ Spread. Choose a role to cost a line as labor (blended rate from the Rate card × hours), or “Fixed $” for vendor and other non-labor costs. Click the type pill to switch Controllable / Uncontrollable.</p>` +
    table(['Cost line & driver', 'Type', 'Labor role × hours', 'Driver qty', 'US unit cost', 'Spread', 'US period cost', 'Share', 'India unit cost', 'India period cost', ''], rows, 'dense costt') +
    `<div class="flex" style="margin-top:10px"><button class="btn ghost" data-act="addline" data-i="${k}" data-kind="fixed">+ Add fixed cost</button><button class="btn ghost" data-act="addline" data-i="${k}" data-kind="labor">+ Add labor cost</button></div>`);
  const flows = { platform: 'Platform cost per location → platform fee in every package (Services & packages) and tier cost (Workflows & tiers).', usage: 'Cost per 1M tokens → overage price, and the included-AI cost inside every workflow.',
    advisory: 'Cost per consultant day → advisory list price (Pricing summary) and Easy Quote step 3.', custom: 'Cost per project → custom build price (cost + 40%) and Easy Quote step 3.',
    appBuild: 'Cost per application → custom application build price and the Patient mobile app one-time cost.', appRun: 'Cost per live app per month → custom application run price and the Patient mobile app monthly cost.' };
  return head('Cost build-up', 'The underlying cost model for each service, one tab per pool. Labor costs come from the Rate card; non-labor costs are the same in both markets.') + tabs + summary + (k === 'platform' ? amortPanel() : '') + tbl +
    `<p class="foot">Flows into: ${flows[k]}</p>`;
}
function whatIf(mut) { const S2 = JSON.parse(JSON.stringify(S)); mut(S2); return compute(S2); }
function amortPanel() {
  const cb = S.cb, dev = cb.sec.platform.find(l => l.am), hasPkg = R.w.sel.length > 0;
  const devCost = dev ? dev.q * dev.us : 0;
  const optsA = [12, 24, 36, 48, 60], optsR = [12, 18, 24, 36, 48];
  const hd = ['Months', 'Platform cost / loc', 'Platform fee / loc', ...S.pk.map(p => p.n + ' tier'), ...(hasPkg ? ['Current quote package'] : []), ''];
  const tierCells = R2 => R2.wc.tiers.map(t => o(usd(t.price)));
  const rowsA = optsA.map(n => { const R2 = n === cb.amort ? R : whatIf(s => s.cb.amort = n), on = n === cb.amort;
    return tr([`<b>${n}</b> mo${n === 36 ? ' <span class="mut">(workbook label)</span>' : ''}`, o(usd(R2.wc.platCost)), o(usd(R2.mod.fee)), ...tierCells(R2), ...(hasPkg ? [o(usd(R2.w.lines[0].price))] : []),
      on ? '<span class="badge good">Current</span>' : `<button class="lnkb" data-set="cb.amort" data-val="${n}" data-n="1">Apply</button>`], on ? 'hl' : ''); });
  const rowsR = optsR.map(n => { const R2 = n === S.wc.recovery ? R : whatIf(s => s.wc.recovery = n), on = n === S.wc.recovery;
    return tr([`<b>${n}</b> mo`, o(usd(R2.wc.platCost)), o(usd(R2.mod.fee)), ...tierCells(R2), ...(hasPkg ? [o(usd(R2.w.lines[0].price))] : []),
      on ? '<span class="badge good">Current</span>' : `<button class="lnkb" data-set="wc.recovery" data-val="${n}" data-n="1">Apply</button>`], on ? 'hl' : ''); });
  return card('Amortization — subscription package pricing', `<p class="sub">Two periods decide how one-time build costs are recovered through the monthly subscription. A longer period lowers the monthly price but takes longer to pay back the investment.</p>
    <div class="grid2 amg">
      <div class="amc"><div class="flex between"><div><b>Platform build amortization</b><div class="mut">${o(`${usd(devCost)} platform build ÷ ${cb.amort} months = ${usd(cb.amort ? devCost / cb.amort : 0)} / month ÷ ${nf(cb.locs)} locations = ${usd(cb.amort && cb.locs ? devCost / cb.amort / cb.locs : 0)} / loc / mo`)}</div></div>${num('cb.amort', { w: 'xs', suf: 'months', min: 1, step: 1 })}</div></div>
      <div class="amc"><div class="flex between"><div><b>Workflow build recovery</b><div class="mut">Each workflow’s build cost ÷ months ÷ subscribing locations (Workflows & tiers)</div></div>${num('wc.recovery', { w: 'xs', suf: 'months', min: 1, step: 1 })}</div></div>
    </div>
    <h4>What-if: platform build amortization</h4>${table(hd, rowsA, 'dense amt2')}
    <h4>What-if: workflow build recovery</h4>${table(hd, rowsR, 'dense amt2')}
    <p class="foot">Tier prices are the workbook tiers (platform fee + bundled workflows).${hasPkg ? ' “Current quote package” is the per-location price of the package selected in Easy Quote.' : ' Select services in Easy Quote to also see the current package price here.'}</p>`, 'amort');
}
// ---------- WORKFLOWS
// Workflow catalogue: list filters + a paired build/operate cost view.
const WF_SPECIALTIES = ['Cross-speciality', 'Spine and Pain', 'Interventional Radiology', 'Cardiology', 'Multi-specialty'];
const WF_TYPES = ['Clinical', 'Patient engagement', 'Operations', 'Revenue cycle'];
function workflowMeta(w) {
  return { specialty: w.specialty || 'Cross-speciality', type: w.type || (/outreach|scheduling/i.test(w.n) ? 'Patient engagement' : /billing|rcm/i.test(w.n) ? 'Revenue cycle' : /authorization|referral/i.test(w.n) ? 'Clinical' : 'Operations'), status: w.status || 'Draft' };
}
function workflowOptions(values, value, all) {
  return (all ? `<option value="">${all}</option>` : '') + values.map(v => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(v)}</option>`).join('');
}
function workflowEditor(w = {}) {
  const meta = workflowMeta(w);
  return `<div class="wf-editor-fields"><label>Workflow name<input class="txt" id="cwfn" maxlength="120" value="${esc(w.n || '')}" placeholder="Workflow name" required></label>
    <label>Speciality<select id="cwfs">${workflowOptions(WF_SPECIALTIES, meta.specialty)}</select></label>
    <label>Type of workflow<select id="cwft">${workflowOptions(WF_TYPES, meta.type)}</select></label>
    <label>Status<select id="cwfst">${workflowOptions(['Draft', 'Active'], meta.status)}</select></label></div>`;
}
function readWorkflowEditor() {
  return { n: (document.getElementById('cwfn').value.trim() || 'Untitled workflow'), specialty: document.getElementById('cwfs').value,
    type: document.getElementById('cwft').value, status: document.getElementById('cwfst').value };
}
function vWorkflows() {
  if (!S.ui) S.ui = {};
  const ui = S.ui, wc = S.wc, W = R.wc, india = ui.wfIndia === '1';
  const editing = ui.wfEdit === '1';
  const rows = wc.wf.map((w, i) => ({ w, i, meta: workflowMeta(w) })).filter(({w, meta}) =>
    (!ui.wfSearch || w.n.toLowerCase().includes(ui.wfSearch.trim().toLowerCase())) &&
    (!ui.wfSpecialty || meta.specialty === ui.wfSpecialty) && (!ui.wfType || meta.type === ui.wfType) && (!ui.wfStatus || meta.status === ui.wfStatus));
  if (!rows.some(x => x.i === ui.wfSel)) ui.wfSel = rows.length ? rows[0].i : -1;
  const selected = ui.wfSel;
  const filter = (label, path, values, all) => `<label>${label}<select data-p="ui.${path}" aria-label="${label}">${workflowOptions(values, ui[path] || '', all)}</select></label>`;
  const toolbar = `<div class="wf-toolbar"><label class="wf-search">Search workflows<input type="search" id="workflow-search" placeholder="Search by workflow name…" value="${esc(ui.wfSearch || '')}" aria-label="Search workflows"></label>
    ${filter('Speciality','wfSpecialty',WF_SPECIALTIES,'All specialities')}${filter('Type of workflow','wfType',WF_TYPES,'All types')}${filter('Status','wfStatus',['Draft','Active'],'All statuses')}
    <button class="btn" data-act="addcatwf">+ New</button></div>`;
  const list = `<section class="card wf-directory"><div class="wf-count">${rows.length} of ${wc.wf.length} workflows</div><div class="tw"><table class="wf-directory-table"><thead><tr><th>Workflow</th><th>Speciality</th><th>Workflow type</th><th>Status</th><th>Locations</th><th>Cost / loc / mo</th></tr></thead><tbody>${rows.map(({w,i,meta}) => {
    const c=W.wf[i];
    return `<tr class="${selected === i ? 'wf-is-selected' : ''}" data-wf-row="${i}" data-set="ui.wfSel" data-val="${i}" data-n="1"><td><button class="wf-select" data-set="ui.wfSel" data-val="${i}" data-n="1" aria-pressed="${selected === i}" aria-controls="workflow-detail">${o(esc(w.n))}</button>${selected === i ? '<span class="wf-selected-caption">Selected</span>' : ''}</td>
      <td>${esc(meta.specialty)}</td><td>${esc(meta.type)}</td><td><span class="wf-status">${esc(meta.status)}</span></td><td>${o(nf(w.locs,0))}</td><td>${o(usd(india ? c.T : c.O,2),'b')}</td></tr>`;
  }).join('')}</tbody></table></div>${!rows.length ? '<div class="wf-empty">No workflows match. Adjust your search or filters.</div>' : ''}</section>`;
  let detail = '';
  if (selected >= 0) {
    const w=wc.wf[selected], c=W.wf[selected], meta=workflowMeta(w), p='wc.wf.'+selected, rates=india?W.rI:W.rU;
    const denominator=wc.recovery*w.locs, buildTotal=india?c.Ri:c.H, recovery=india?c.Si:c.K;
    const running=(w.lic||0)+w.run+(w.sup||0)+(w.sec||0)+(w.rd||0)+c.N, combined=india?c.T:c.O;
    const contribution=(amount)=>denominator>0?amount/denominator:0;
    const editable=(path,opts)=>num(path,opts).replace('<input ',editing?'<input ':'<input disabled ');
    const input=(key,opts={})=>editable(p+'.'+key,{w:'xs',min:0,...opts});
    const costRow=(label,unit,qty,rate,result,type)=>`<tr><td><span class="wf-item-name">${label}</span><small>${unit} · ${type}</small></td><td>${qty}</td><td>${rate}</td><td>${o(usd(result,2))}</td></tr>`;
    const buildRows=[['Development','dev',0],['Architecture / BA','arch',1],['QA testing','qa',2],['Project management','pm',3],['Onboarding','onb',0]].map(([label,key,role])=>costRow(label,'One-time hours',input(key),o(usd(rates[role],2)),contribution((w[key]||0)*rates[role]),'Controllable')).join('')+
      costRow('API integration','One-time fee ($)',input('api'),'—',contribution(w.api),'Uncontrollable');
    const runRows=[['Cloud hosting & compute','run','Uncontrollable'],['Workflow / platform licenses','lic','Controllable'],['Customer support','sup','Uncontrollable'],['Security & infrastructure','sec','Uncontrollable'],['R&D / maintenance','rd','Controllable']].map(([label,key,type])=>costRow(label,'$ / location / month',input(key),'—',w[key]||0,type)).join('')+
      costRow('AI tokens included','M tokens / location / month',input('tok'),o(usd(W.tokCost,2)+'/M'),c.N,'Uncontrollable');
    const applet=(title,tag,label,total,body,footer)=>`<section class="wf-applet"><div class="wf-applet-head"><h3>${title}</h3><span class="wf-status">${tag}</span></div><div class="wf-applet-total"><span>${label}</span>${o(usd(total,2),'wf-amount')}</div><div class="tw"><table class="wf-cost-table"><thead><tr><th>Cost item</th><th>Qty / $</th><th>Rate $</th><th>$/loc/mo</th></tr></thead><tbody>${body}</tbody></table></div><div class="wf-applet-foot">${footer}</div></section>`;
    detail=`<section id="workflow-detail" class="wf-workspace${editing?' is-editing':''}"><div class="wf-detail-heading"><div><h2>${o(esc(w.n))}</h2><p>${esc(meta.specialty)} · ${esc(meta.type)} · ${esc(meta.status)}</p></div><div class="wf-detail-actions">${seg('ui.wfIndia',[['','USA'],['1','India']])}<button class="btn ghost" data-act="editwf" data-i="${selected}">Edit</button><button class="btn ghost wf-delete" data-act="delcatwf" data-i="${selected}">Delete</button>${editing?'<button class="btn" data-set="ui.wfEdit" data-val="">Done</button>':''}</div></div>
    <div class="wf-shared"><label>Subscribing locations ${editable(p+'.locs',{w:'xs',min:1,step:1})}</label><label>Build recovery ${editable('wc.recovery',{w:'xs',min:1,step:1,suf:'months'})}</label><div><small>Build billing units</small>${o(nf(denominator,0),'b')} <span class="mut">unit-months</span></div></div>
    <div class="wf-applet-grid">
      ${applet('New Build Effort','ONE-TIME','Total build investment',buildTotal,buildRows,`<span>Total effort</span>${o(nf(w.dev+w.arch+w.qa+w.pm+(w.onb||0),1)+' hours','b')}<span>Build recovery / loc / mo</span>${o(usd(recovery,2),'b')}`)}
      ${applet('Ongoing Cost','MONTHLY','Operating cost / location / month',running,runRows,`<span>All subscribing locations / month</span>${o(usd(running*w.locs,2),'b')}<span>Basis</span><span>Recurring per location</span>`)}
    </div><div class="wf-combined"><div><b>Total cost / location / month</b><small>Build recovery + ongoing operations · ${india?'India':'USA'} rates</small></div>${o(usd(combined,2),'wf-combined-amount')}<div><small>After build recovery</small>${o(usd(running,2)+' / loc / mo','b')}</div>${!india?`<div><small>List price at target margin</small>${o(usd(c.P,2),'b')}</div>`:''}</div>
    <p class="wf-footnote">Build recovery is shared across the workflow catalogue. Operating inputs are per location per month; recovery months apply only to the build. ${editing?'Changes save automatically.':'Choose Edit to update workflow details and cost inputs.'}</p></section>`;
  }
  return `<div class="workflow-screen">${head('Workflow Catalogue','Select a workflow to review its build investment and ongoing costs.')} ${toolbar}${list}${detail}</div>`;
}

// ---------- TIER CONFIGURATOR
function vTiers() {
  const W = R.wc, wc = S.wc;
  const ass = card('Assumptions', `<div class="stats">
    ${[['Developer rate', W.rU[0], W.rI[0]], ['Architect / BA rate', W.rU[1], W.rI[1]], ['QA rate', W.rU[2], W.rI[2]], ['PM rate', W.rU[3], W.rI[3]]].map(([n, u, i]) => `<div><span>${n}</span>${o(usd(u) + '/hr')}<small>${o('India ' + usd(i) + '/hr')}</small></div>`).join('')}
    <div><span>AI token cost / 1M</span>${o(usd(W.tokCost))}<small>Overage price ${o(usd(W.overPrice))}</small></div>
    <div><span>Platform cost / loc / mo</span>${o(usd(W.platCost))}<small>India ${o(usd(W.platCostIN))}</small></div>
    <div><span>Platform fee / loc / mo</span>${o(usd(W.platFee))}<small>at ${pct(R.ps.tm[0], 0)} target margin</small></div>
    </div><div class="row"><label>Dev cost recovery period</label>${num('wc.recovery', { suf: 'months', w: 'm', min: 1 })}</div>`);
  const T = W.tiers;
  const trows = wc.wf.map((w, i) => tr([esc(w.n), ...[0, 1, 2].map(t => chk(`wc.inc.${i}.${t}`, '', true))]));
  const line = (lab, f, cls = '') => tr([`<b>${lab}</b>`, ...T.map((t, i) => f(t, i))], cls);
  trows.push(line('# workflows included', t => o(t.count)));
  trows.push(line('Workflow cost / loc / mo', t => o(usd(t.wfCost))));
  trows.push(line('Workflow list price, unbundled', t => o(usd(t.list))));
  trows.push(line('Bundle discount', (t, i) => num('wc.disc.' + i, { pct: 1, w: 's' })));
  trows.push(line('Bundled workflow price', t => o(usd(t.bundled))));
  trows.push(line('Platform fee', t => o(usd(t.fee))));
  trows.push(line('Tier price / loc / mo', t => o(usd(t.price), 'b big'), 'hl'));
  trows.push(line('Tier cost / loc / mo', t => o(usd(t.cost))));
  trows.push(line('Tier margin', t => o(pct(t.margin)) + ' ' + badge(t.floorOK)));
  trows.push(line('Included AI tokens (M) / loc / mo', t => o(nf(t.incTok))));
  const tiers = card('Tier bundles', `<p class="sub">Tier price = Platform fee + bundled workflows (list × (1 − bundle discount)). Tick which workflows each tier includes.</p>` + table(['', ...wc.tiers.map((n, i) => `<input class="txt c" data-p="wc.tiers.${i}" data-txt="1" value="${esc(n)}">`)], trows, 'tiers-t'));
  return head('Tier Configurator', 'Platform assumptions, tier composition and bundle pricing.') + ass + tiers;
}

// ---------- RATES
function vRates() {
  const rc = S.rc;
  const settings = card('Delivery mix & market settings', `<div class="grid3">
    <div class="row col"><label>US market – share of hours from India</label>${num('rc.usShare', { pct: 1, w: 's' })}</div>
    <div class="row col"><label>India market – share of hours from India</label>${num('rc.inShare', { pct: 1, w: 's' })}</div>
    <div class="row col"><label>Hours per consultant day</label>${num('rc.hrsDay', { w: 's' })}</div>
    <div class="row col"><label>Hours per FTE month</label>${num('rc.hrsMonth', { w: 's' })}</div>
    <div class="row col"><label>FX rate (INR per USD)</label>${num('rc.fx', { w: 's', pre: '₹' })}</div>
    <div class="row col"><label>India price index (% of US list)</label>${num('rc.index', { pct: 1, w: 's' })}</div>
    <div class="row col"><label>India rate cap ($/hr)</label>${num('rc.cap', { w: 's', pre: '$' })}</div></div>`);
  const rows = rc.roles.map((r, i) => { const c = R.roles[i], p = 'rc.roles.' + i;
    return tr([`<b>${esc(r.n)}</b>`, num(p + '.us', { pre: '$', w: 's' }), num(p + '.in', { pre: '$', w: 's' }) + ' ' + o(c.capWarn ? 'Above cap' : '', c.capWarn ? 'badge bad' : ''),
      num(p + '.usS', { pct: 1, w: 's', nul: 1, ph: rnd(rc.usShare * 100, 2) }), o(usd(c.bUS), 'b'), num(p + '.inS', { pct: 1, w: 's', nul: 1, ph: rnd(rc.inShare * 100, 2) }), o(usd(c.bIN), 'b')]); });
  return head('Rate calculator', 'Blended rate = US rate × (1 − India share) + India rate × India share. Leave a share blank to use the default above.') + settings +
    card('Role cost rates — loaded $/hr', table(['Role', 'US rate', 'India rate', 'US mkt: India share', 'US mkt blended', 'India mkt: India share', 'India mkt blended'], rows));
}

// ---------- METHODS (overview + one detailed screen per service)
const MC_TABS = [{ t: 'Subscription', icon: '▣', unit: 'location / month' }, { t: 'Usage meters', icon: '⏲', unit: '1M tokens' }, { t: 'Custom builds', icon: '⚒', unit: 'workflow project' },
  { t: 'Technology advisory', icon: '✎', unit: 'consultant day' }, { t: 'Application build', icon: '⌂', unit: 'application' }, { t: 'Application run', icon: '↻', unit: 'application / month' }];
function vMethods() {
  if (!S.ui) S.ui = {};
  const cur = S.ui.mcTab ?? -1;
  const tabs = `<div class="ctabs seven"><button class="ctab ${cur === -1 ? 'on' : ''}" data-set="ui.mcTab" data-val="-1" data-n="1"><span class="ci">⚖</span><span><b>Overview</b><small>All six services</small></span></button>
    ${MC_TABS.map((x, i) => `<button class="ctab ${cur === i ? 'on' : ''}" data-set="ui.mcTab" data-val="${i}" data-n="1"><span class="ci">${x.icon}</span><span><b>${x.t}</b><small>${o(usd(R.mc[i].rec) + ' / ' + x.unit)}</small></span></button>`).join('')}</div>`;
  return head('Method calculator', 'Prices each service four ways — Cost-plus, Competitive, Value-based and Economic Value Estimation (EVE) — blends the primary and secondary method, and never goes below the margin-floor price.') +
    tabs + (cur === -1 ? mcOverview() : mcDetail(cur));
}
function mcOverview() {
  const M = R.mc;
  const r = (lab, f, cls = '', note = '') => tr([`<b>${lab}</b>${note ? `<div class="mut">${note}</div>` : ''}`, ...M.map((m, i) => f(m, i))], cls);
  const rows = [r('Primary · secondary', (m, i) => `${S.mc.primary[i]} · ${S.mc.secondary[i]}<div class="mut">${pct(S.mc.weight[i], 0)} / ${pct(1 - S.mc.weight[i], 0)}</div>`),
    r('Cost per billing unit', m => o(usd(m.cost))), r('Cost-plus price', m => o(usd(m.cp))), r('Competitive price', m => o(usd(m.comp))), r('Value-based price', m => o(usd(m.vb))), r('EVE price', m => o(usd(m.eve))),
    r('Floor price', m => o(usd(m.floor))), r('Blended price', m => o(usd(m.blend))), r('Recommended price / unit', m => o(usd(m.rec), 'b big'), 'hl', 'MAX(Floor, Blend)'), r('Floor check', m => badge(!m.floorApplied, 'OK', 'Floor applied')),
    r('Implied margin', m => o(pct(m.margin))), r('Deal gross profit', m => o(usd(m.gp), 'b')), r('Pricing summary list price', m => o(usd(m.list))), r('Variance vs list', m => o(usd(m.varc), m.varc >= 0 ? 'pos' : 'neg'), '', 'Positive = method supports a higher price'),
    tr(['', ...M.map((m, i) => `<button class="lnkb" data-set="ui.mcTab" data-val="${i}" data-n="1">Open detail →</button>`)])];
  return card('Price by method — all services', table(['', ...SERVICES], rows, 'dense methods'));
}
function mcDetail(i) {
  const m = R.mc[i], mc = S.mc, me = R.mech, T = MC_TABS[i], P = 'mc.', byM = { 'Cost-Plus': m.cp, 'Competitive': m.comp, 'Value-Based': m.vb, 'EVE': m.eve };
  const tile = (lab, val, sub = '', cls = '') => `<div class="ctile ${cls}"><span>${lab}</span>${val}<small>${sub}</small></div>`;
  const summary = `<section class="card csum"><div class="ch"><h3>${T.icon} ${SERVICES[i]} — price by method</h3><span class="mut">${SVC_MODEL[i]} · ${SVC_FREQ[i]} · per ${T.unit}</span></div>
    <div class="ctiles">
      ${tile('Cost per ' + T.unit, o(usd(m.cost)), 'from Cost build-up')}
      ${tile('Floor price', o(usd(m.floor)), o('at ' + pct(m.fl) + ' min margin'))}
      ${tile('Recommended price', o(usd(m.rec), 'b'), badge(!m.floorApplied, 'Blend above floor', 'Floor applied'), 'hl')}
      ${tile('Implied margin', o(pct(m.margin)), o('Target ' + pct(m.tm)))}
      ${tile('Vs Pricing summary list', o(usd(m.varc), m.varc >= 0 ? 'pos' : 'neg'), o('List ' + usd(m.list) + (i === 0 ? ' · tier price incl. workflows; cost here is platform only' : '')))}
    </div></section>`;
  // price ladder
  const items = [['Cost', m.cost, 'cost'], ['Floor price', m.floor, 'floor'], ['Cost-plus', m.cp, 'meth'], ['Competitive', m.comp, 'meth'], ['Value-based', m.vb, 'meth'], ['EVE', m.eve, 'meth'], ['Blended', m.blend, 'blend'], ['Recommended', m.rec, 'rec']];
  const max = Math.max(...items.map(x => x[1]), mc.high[i], 1) * 1.08;
  const role = n => n === 'Cost-plus' ? 'Cost-Plus' : n === 'Value-based' ? 'Value-Based' : n;
  const ladder = card('Price ladder', `<p class="sub">Each method’s price for one ${T.unit}. The dashed line is the floor; the recommended price can never sit left of it.</p>
    <div class="ladder" style="--fl:${m.floor / max * 100}%">${items.map(([n, v, cls]) => { const r = role(n), tag = mc.primary[i] === r ? 'Primary' : mc.secondary[i] === r ? 'Secondary' : '';
      return `<div class="lrow ${cls} ${tag ? 'picked' : ''}"><span class="ln">${n}${tag ? ` <em>${tag}</em>` : ''}</span><span class="lb">${o(`<i style="width:${Math.max(0, v / max * 100)}%"></i>`, 'lbar')}</span>${o(usd(v), 'lv')}</div>`; }).join('')}
      <div class="lfloor"></div></div>`);
  // blend
  const blend = card('Blend & recommendation', `<div class="grid3">
      <div class="row col"><label>Primary method</label>${sel(P + 'primary.' + i, METHODS)}</div>
      <div class="row col"><label>Secondary method</label>${sel(P + 'secondary.' + i, METHODS)}</div>
      <div class="row col"><label>Primary weight · ${o(pct(mc.weight[i], 0) + ' / ' + pct(1 - mc.weight[i], 0))}</label><input type="range" min="0" max="100" step="5" data-p="${P}weight.${i}" data-pct="1" value="${rnd(mc.weight[i] * 100, 0)}" class="rng"></div></div>
    <div class="calc">
      ${o(`${mc.primary[i]} ${usd(m.p1)} × ${pct(mc.weight[i], 0)} + ${mc.secondary[i]} ${usd(m.p2)} × ${pct(1 - mc.weight[i], 0)} = <b>${usd(m.blend)}</b> blended`)}<br>
      ${o(`MAX(floor ${usd(m.floor)}, blended ${usd(m.blend)}) = <b>${usd(m.rec)}</b> recommended per ${T.unit}`)}</div>
    <div class="kv2 deal"><span>Deal quantity <small class="mut">(from the current quote)</small></span>${o(nf(m.qty))}<span>Deal price</span>${o(usd(m.dealP), 'b')}<span>Deal cost</span>${o(usd(m.dealC))}<span>Deal gross profit</span>${o(usd(m.gp) + ' · ' + pct(m.margin), 'b')}</div>`);
  const mcard = (key, title, sub, body, price) => { const tag = mc.primary[i] === key ? 'Primary' : mc.secondary[i] === key ? 'Secondary' : '';
    return `<section class="card mth ${tag ? 'picked' : ''}"><div class="ch"><h3>${title}</h3>${tag ? `<span class="badge good">${tag}</span>` : ''}</div><p class="sub">${sub}</p>${body}
      <div class="mres"><span>${title} price</span>${o(usd(price), 'b big')}</div></section>`; };
  const tmCell = i === 2 ? `${o(pct(m.tm))} <small class="mut">from ${pct(S.ps.markup, 0)} markup</small>` : num(`ps.tm.${i}`, { pct: 1, w: 'xs' });
  const costPlus = mcard('Cost-Plus', 'Cost-plus', 'Cost ÷ (1 − target margin). Sets the floor and the baseline.', `<div class="kv2">
      <span>Cost per ${T.unit}</span>${o(usd(m.cost))}<span>Target margin</span><span>${tmCell}</span><span>Min margin floor</span>${num(`ps.fl.${i}`, { pct: 1, w: 'xs' })}<span>Floor price</span>${o(usd(m.floor))}</div>`, m.cp);
  const pos = mc.high[i] > mc.low[i] ? Math.min(100, Math.max(0, (m.comp - mc.low[i]) / (mc.high[i] - mc.low[i]) * 100)) : 50;
  const comp = mcard('Competitive', 'Competitive', 'Position against the market range for comparable offers.', `<div class="kv2">
      <span>Competitor – low</span>${num(P + 'low.' + i, { pre: '$', w: 's' })}<span>Competitor – mid</span>${num(P + 'mid.' + i, { pre: '$', w: 's' })}<span>Competitor – high</span>${num(P + 'high.' + i, { pre: '$', w: 's' })}
      <span>Positioning vs mid <small class="mut">+ premium / − discount</small></span>${num(P + 'pos.' + i, { pct: 1, w: 'xs' })}</div>
      <div class="range">${o(`<i style="left:${pos}%"></i>`, 'rtrack')}<div class="rl"><span>${o(usd(mc.low[i]))}</span><span>${o(usd(mc.mid[i]))}</span><span>${o(usd(mc.high[i]))}</span></div></div>`, m.comp);
  const roi = m.vb ? m.value / m.vb : 0;
  const val = mcard('Value-Based', 'Value-based', 'A share of the measurable benefit to the customer.', `<div class="kv2">
      <span>Staff hours saved</span>${num(P + 'hrs.' + i, { w: 'xs' })}<span>Loaded staff rate</span>${num(P + 'rate.' + i, { pre: '$', w: 'xs' })}<span>Labor value</span>${o(usd(m.labor))}
      <span>Revenue leakage recovered</span>${num(P + 'leak.' + i, { pre: '$', w: 's' })}<span>Total customer value</span>${o(usd(m.value), 'b')}<span>Value capture</span>${num(P + 'capture.' + i, { pct: 1, w: 'xs' })}</div>
      <div class="note">${o(`Customer keeps ${usd(m.value - m.vb)} of ${usd(m.value)} — about <b>${nf(roi, 1)}×</b> return on the price.`)}</div>`, m.vb);
  const eve = mcard('EVE', 'Economic value estimation', 'Next-best alternative plus a share of the net differentiation.', `<div class="kv2">
      <span>Reference value <small class="mut">= competitor mid</small></span>${o(usd(m.ref))}<span>Positive differentiation</span>${num(P + 'posd.' + i, { pre: '$', w: 's' })}<span>Negative differentiation</span>${num(P + 'negd.' + i, { pre: '$', w: 's' })}
      <span>Total economic value</span>${o(usd(m.tev), 'b')}<span>Share of differentiation captured</span>${num(P + 'share.' + i, { pct: 1, w: 'xs' })}</div>`, m.eve);
  let mech = '';
  if (i === 1) mech = card('Usage meter mechanics', `<div class="kv2"><span>Included allowance</span>${o(nf(me.allowance) + 'M')}<span>Expected usage</span>${o(nf(me.expected) + 'M')}<span>Billable overage</span>${o(nf(me.ovr) + 'M')}<span>Price per 1M (recommended)</span>${o(usd(me.overPrice))}<span><b>Monthly overage charge</b></span>${o(usd(me.overCharge), 'b')}</div>`);
  if (i === 2) mech = card('Custom build mechanics — ownership, payments & royalty', `<div class="grid3"><div class="kv2"><span>Private (100% IP) price</span>${o(usd(me.priv))}<span>Co-develop factor</span>${num('mc.codev', { pct: 1, w: 'xs' })}<span>Co-develop price</span>${o(usd(me.codevP))}<span>Discount to co-develop</span>${o(usd(me.codevDisc))}</div>
      <div class="kv2">${['Kickoff', 'Mid-build', 'Go-live'].map((n, k) => `<span>${n} ${num('mc.pay.' + k, { pct: 1, w: 'xxs' })}</span>${o(usd(me.payPriv[k]) + ' / ' + usd(me.payCo[k]))}`).join('')}<span>Payments total</span>${o(pct(me.paySum), me.paySum === 1 ? '' : 'badge bad')}</div>
      <div class="kv2"><span>Royalty on revenue</span>${num('mc.royalty', { pct: 1, w: 'xxs' })}<span>Cap multiple</span>${num('mc.capMult', { w: 'xxs', suf: '×' })}<span>Royalty cap</span>${o(usd(me.royCap))}<span>Customer annual revenue</span>${num('mc.custRev', { pre: '$', w: 's' })}<span>Annual royalty (capped)</span>${o(usd(me.annRoy), 'b')}<span>Years to cap</span>${o(nf(me.yrsCap))}</div></div>`);
  if (i === 4 || i === 5) mech = card('Application build + run — contract value', `<div class="kv2"><span>One-time build price</span>${o(usd(me.y1Build))}<span>Monthly run price</span>${o(usd(me.y1Run))}<span>Months</span>${num('mc.months', { w: 'xxs' })}<span><b>Contract value</b></span>${o(usd(me.y1V), 'b')}<span>Delivery cost</span>${o(usd(me.y1C))}<span>Margin</span>${o(pct(me.y1M))}</div>`);
  return summary + `<div class="mgrid"><div>${ladder}</div><div>${blend}</div></div>` + `<div class="mgrid4">${costPlus}${comp}${val}${eve}</div>` + mech;
}
// ---------- MARKET
function vMarket() {
  const rows = R.mp.map((m, i) => tr([`<b>${esc(m.name)}</b><div class="mut">${esc(m.unit)}</div>`, o(usd(m.usCost)), o(pct(m.tm)), o(usd(m.usList), 'b'), o(pct(m.usM)),
    o(usd(m.inCost)), num('mp.idx.' + i, { pct: 1, w: 's', nul: 1, ph: rnd(S.rc.index * 100, 2) }), o(usd(m.J)), o(pct(m.fl)), o(usd(m.Lf)), o(usd(m.M), 'b'), o(inr(m.INR), 'b'), o(pct(m.inM)),
    o(m.floorApplied ? 'Floor applied' : 'Index price', 'badge ' + (m.floorApplied ? 'amber' : 'good')), o(pct(m.save))]));
  return head('USA vs India', 'India price = US list × India price index, never below India cost ÷ (1 − margin floor), converted to INR at the FX rate. Leave the index blank to use the Rate card default.') +
    card('Market pricing', table(['Service', 'US cost / unit', 'Target margin', 'US list / unit', 'US margin', 'India cost / unit', 'India price index', 'Index price', 'Min floor', 'Floor price', 'India price ($)', 'India price (₹)', 'India margin', 'Basis', 'India cost saving'], rows, 'dense')) +
    `<p class="foot">Non-labor costs (cloud, AI tokens, licenses, audits, travel) are assumed equal in both markets; edit India unit costs on the Cost build-up tab.</p>`;
}

// ---------- RATES & INDIA PRICING (merged Rate calculator + USA vs India)
function vRatesMarket() {
  const rc = S.rc;
  // ── Settings
  const settings = card('Market & delivery settings', `
    <div class="idx-banner">
      <div class="idx-main">
        <div class="idx-label">India price index <span class="mut">— applied to all India market prices</span></div>
        <div class="idx-ctl">${num('rc.index', { pct: 1, w: 's' })} <span class="idx-pct">${o(rnd(rc.index * 100, 1) + '%')}</span> <span class="mut">of US list</span>
          <span class="badge ${rc.index < 0.4 ? 'amber' : rc.index < 0.6 ? 'good' : 'bad'}">${rc.index < 0.4 ? 'Deep discount' : rc.index < 0.6 ? 'Moderate' : 'Near parity'}</span>
        </div>
      </div>
      <div class="idx-side">
        <div class="row col"><label>FX rate (INR per USD)</label>${num('rc.fx', { w: 's', pre: '₹' })}</div>
        <div class="row col"><label>India rate cap ($/hr)</label>${num('rc.cap', { w: 's', pre: '$' })}</div>
      </div>
    </div>
    <div class="grid3" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">
      <div class="row col"><label>US market – India share</label>${num('rc.usShare', { pct: 1, w: 's' })}</div>
      <div class="row col"><label>India market – India share</label>${num('rc.inShare', { pct: 1, w: 's' })}</div>
      <div class="row col"><label>Hours per consultant day</label>${num('rc.hrsDay', { w: 's' })}</div>
      <div class="row col"><label>Hours per FTE month</label>${num('rc.hrsMonth', { w: 's' })}</div>
    </div>`);
  // ── Role blended rates
  const rateRows = rc.roles.map((r, i) => { const c = R.roles[i], p = 'rc.roles.' + i;
    return tr([`<b>${esc(r.n)}</b>`, num(p + '.us', { pre: '$', w: 's' }), num(p + '.in', { pre: '$', w: 's' }) + ' ' + o(c.capWarn ? 'Above cap' : '', c.capWarn ? 'badge bad' : ''),
      num(p + '.usS', { pct: 1, w: 's', nul: 1, ph: rnd(rc.usShare * 100, 2) }), o(usd(c.bUS), 'b'), num(p + '.inS', { pct: 1, w: 's', nul: 1, ph: rnd(rc.inShare * 100, 2) }), o(usd(c.bIN), 'b')]); });
  const rateCard = card('Role blended rates — loaded $/hr', table(['Role', 'US rate', 'India rate', 'US mkt: India share', 'US mkt blended', 'India mkt: India share', 'India mkt blended'], rateRows));
  // ── USA vs India service pricing
  const mpRows = R.mp.map((m, i) => tr([`<b>${esc(m.name)}</b><div class="mut">${esc(m.unit)}</div>`, o(usd(m.usCost)), o(pct(m.tm)), o(usd(m.usList), 'b'), o(pct(m.usM)),
    o(usd(m.inCost)), num('mp.idx.' + i, { pct: 1, w: 's', nul: 1, ph: rnd(S.rc.index * 100, 2) }), o(usd(m.J)), o(pct(m.fl)), o(usd(m.Lf)), o(usd(m.M), 'b'), o(inr(m.INR), 'b'), o(pct(m.inM)),
    o(m.floorApplied ? 'Floor applied' : 'Index price', 'badge ' + (m.floorApplied ? 'amber' : 'good')), o(pct(m.save))]));
  const mpCard = card('USA vs India — service pricing',
    `<p class="sub">India price = US list × India price index, never below India cost ÷ (1 − margin floor). Leave per-service index blank to use the global setting above.</p>` +
    table(['Service', 'US cost/unit', 'Target margin', 'US list/unit', 'US margin', 'India cost/unit', 'India index', 'Index price', 'Min floor', 'Floor price', 'India ($)', 'India (₹)', 'India margin', 'Basis', 'Saving'], mpRows, 'dense') +
    `<p class="foot">Non-labor costs (cloud, AI tokens, licenses, audits, travel) are equal in both markets; edit India costs on Cost build-up.</p>`);
  return head('Rates & India Pricing', 'Blended rate = US rate × (1 − India share) + India rate × India share. India market price = US list × price index.') + settings + rateCard + mpCard;
}

function renderView() { OC = 0; document.getElementById('view').innerHTML = VIEWS[VIEW].f(); }
function patch() {
  OC = 0; const tmp = document.createElement('div'); tmp.innerHTML = VIEWS[VIEW].f();
  const live = document.getElementById('view');
  tmp.querySelectorAll('[data-o]').forEach(n => { const l = live.querySelector(`[data-o="${n.dataset.o}"]`); if (!l) return;
    if (l.innerHTML !== n.innerHTML) l.innerHTML = n.innerHTML; if (l.className !== n.className) l.className = n.className; });
  // placeholders of nullable inputs
  tmp.querySelectorAll('input[data-nul]').forEach(n => { const l = live.querySelector(`input[data-p="${n.dataset.p}"]`); if (l && l.placeholder !== n.placeholder) l.placeholder = n.placeholder; });
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } }
function recalc(full) { R = compute(S); renderKPI(); full ? renderView() : patch(); save(); }

function fallbackCopy(text) { openDialog('Copy quote', `<textarea class="copyta" readonly>${esc(text)}</textarea>`, 'Done', () => { }, true); setTimeout(() => { const ta = document.querySelector('.copyta'); if (ta) { ta.focus(); ta.select(); } }, 30); }
function openDialog(title, body, okLabel, onOk, single) {
  const d = document.getElementById('dlg');
  d.innerHTML = `<div class="dbox"><h3>${title}</h3><div class="dbody">${body}</div><div class="dact">${single ? '' : '<button class="btn ghost" data-d="x">Cancel</button>'}<button class="btn" data-d="ok">${okLabel}</button></div></div>`;
  d.classList.add('open');
  d.onclick = ev => { const k = ev.target.dataset.d; if (ev.target === d || k === 'x') d.classList.remove('open'); if (k === 'ok') { d.classList.remove('open'); onOk(); } };
}
let tt; function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }