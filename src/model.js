// ===== CareTech360.AI pricing model (port of CareTech360-Pricing-Methods.xlsx) =====
const ROLE_NAMES = ['Developer / Engineer','Solution Architect','QA / Test Engineer','Project Manager','Deployment / Support Engineer','Technology Consultant / Advisor','Clinical Informatics SME','UX / UI Designer','Customer Success / Support','Onboarding / Implementation Specialist'];
const ROLE_RATES = [[85,28],[100,35],[65,20],[70,32],[60,25],[70,30],[90,30],[75,25],[47,12],[85,25]];
const SERVICES = ['Subscription','Usage Meters','Custom Builds','Technology Advisory','Application Build – Build','Application Build – Run'];
const SVC_KEYS = ['sub','usage','custom','advisory','appBuild','appRun'];
const SVC_UNITS = ['Per location (platform + tier bundle)','Per 1M AI tokens above allowance','Per workflow project','Per consultant day','Per application','Per application'];
const SVC_MODEL = ['Value-Based / Competitive','Cost-Plus','Cost-Plus (Cost + 40%)','Cost-Plus (Effort-Based)','Cost-Plus','Value-Based'];
const SVC_FREQ = ['Monthly','Monthly','One-time (30/40/30)','Per engagement','One-time','Monthly'];
const METHODS = ['Cost-Plus','Competitive','Value-Based','EVE'];
const SEC_KEYS = ['platform','usage','custom','advisory','appBuild','appRun'];

function DEFAULTS() {
  return {
    rc: { usShare: .7, inShare: .9, hrsDay: 8, hrsMonth: 160, fx: 95, index: .38, cap: 35,
      roles: ROLE_RATES.map((r, i) => ({ n: ROLE_NAMES[i], us: r[0], in: r[1], usS: null, inS: null })) },
    cb: { amort: 12, locs: 100, tokAllow: 1, tokExp: 4, projects: 1, advDays: 10, apps: 1, appsLive: 1,
      sec: {
        platform: [
          { l: 'Product initial development cost', t: 'C', d: 'Platform build cost, amortized over the amortization period', q: 1, us: 60000, s: 12, am: 1 },
          { l: 'Workflow engine / platform licenses', t: 'U', d: 'Platform license per month', q: 1, us: 1500, s: 1 },
          { l: 'API integration fees', t: 'U', d: 'API calls (thousands) per month', q: 200, us: 2.5, s: 1 },
          { l: 'Onboarding & implementation labor', t: 'C', d: 'Locations onboarded × hrs per location × rate', link: 'locs', role: 9, h: 4, s: 12 },
          { l: 'Customer support & success staff', t: 'C', d: 'Support FTEs × hrs per FTE month × rate', q: .5, role: 8, h: 'month', s: 1 },
          { l: 'Security, HIPAA compliance & infrastructure', t: 'U', d: 'Annual HIPAA audit / compliance', q: 1, us: 12000, s: 12 },
          { l: 'Cloud hosting & compute', t: 'U', d: 'Locations hosted × cost per location / month', link: 'locs', us: 20, s: 1 },
          { l: 'Product R&D / maintenance (amortized)', t: 'C', d: 'Annual R&D / maintenance budget', q: 1, us: 30000, s: 12 }],
        usage: [
          { l: 'LLM / AI token costs (per 1K tokens)', t: 'U', d: '1K-token blocks × vendor rate per 1K', link: 'ovr1000', us: .01, s: 1 },
          { l: 'Data storage (DB, documents, backups)', t: 'U', d: 'GB stored × $/GB', link: 'ovr', us: .5, s: 1 },
          { l: 'Data egress / bandwidth', t: 'U', d: 'GB egress × $/GB', link: 'ovr', us: .09, s: 1 },
          { l: 'SMS, voice, fax & email messaging', t: 'U', d: 'Messages sent × $/message', q: 50, us: .01, s: 1 },
          { l: 'Monitoring & logging', t: 'U', d: 'GB logs × $/GB', q: 1, us: .5, s: 1 },
          { l: 'Payment processing fees', t: 'U', d: 'Billed $ × 2.9% card rate', q: 30, us: .029, s: 1 }],
        custom: [
          { l: 'Engineer / developer labor', t: 'C', d: 'Developer hours × loaded $/hr', q: 60, role: 0, h: 1, s: 1 },
          { l: 'Solution architect & business analyst', t: 'C', d: 'Architect / BA hours × fixed $/hr', q: 12, us: 100, inr: 20, s: 1 },
          { l: 'QA & testing effort', t: 'C', d: 'QA hours × $/hr', q: 15, role: 2, h: 1, s: 1 },
          { l: 'Project management', t: 'C', d: 'PM hours × $/hr', q: 10, role: 3, h: 1, s: 1 },
          { l: 'Dev / test environments & tooling', t: 'U', d: 'Per project', q: 1, us: 400, s: 1 },
          { l: 'Third-party components & licenses', t: 'U', d: 'Per project', q: 1, us: 500, s: 1 },
          { l: 'Deployment & support', t: 'C', d: 'Deployment / hypercare hours × $/hr', q: 10, role: 4, h: 1, s: 1 }],
        advisory: [
          { l: 'Consultant / advisor time', t: 'C', d: 'Consultant days × hrs per day × rate', link: 'advDays', role: 5, h: 'day', s: 1 },
          { l: 'Clinical informatics SME time', t: 'C', d: 'SME hours × $/hr', q: 20, role: 6, h: 1, s: 1 },
          { l: 'Assessment tools & licenses', t: 'U', d: 'Tool licenses per engagement', q: 1, us: 500, s: 1 },
          { l: 'Workshop preparation & facilitation', t: 'C', d: 'Prep & facilitation hours × $/hr', q: 16, role: 5, h: 1, s: 1 },
          { l: 'Travel & on-site expenses', t: 'U', d: 'On-site trips × cost per trip', q: 1, us: 1200, s: 1 },
          { l: 'Report & roadmap preparation', t: 'C', d: 'Report / roadmap hours × $/hr', q: 24, role: 5, h: 1, s: 1 },
          { l: 'Pre-sales / discovery effort', t: 'C', d: 'Discovery hours × $/hr', q: 12, role: 5, h: 1, s: 1 }],
        appBuild: [
          { l: 'Mobile / web development labor', t: 'C', d: 'Developer hours × loaded $/hr', q: 60, role: 0, h: 1, s: 1 },
          { l: 'UX / UI design', t: 'C', d: 'Design hours × $/hr', q: 20, role: 7, h: 1, s: 1 },
          { l: 'EHR integration (HL7/FHIR) & interface engine', t: 'U', d: 'Interface build & engine setup per app', q: 1, us: 2000, s: 1 },
          { l: 'Pen testing & HIPAA security compliance', t: 'U', d: 'Pen test + HIPAA review per app', q: 1, us: 1500, s: 1 }],
        appRun: [
          { l: 'App store & marketplace fees', t: 'U', d: 'Apple $99 + Google $25 per year', q: 1, us: 124, s: 12 },
          { l: 'Backend hosting', t: 'U', d: 'Apps hosted × cost per app / month', link: 'appsLive', us: 300, s: 1 },
          { l: 'Maintenance & OS/EHR version updates', t: 'C', d: 'Maintenance hours per month × $/hr', q: 8, role: 0, h: 1, s: 1 }]
      } },
    wc: { recovery: 24,
      wf: [
        { n: 'Patient Intake & Registration', dev: 250, arch: 25, qa: 37.5, pm: 25, onb: 40, api: 2000, locs: 100, lic: 2, run: 15, sup: 3, sec: 5, rd: 2, tok: .5 },
        { n: 'Appointment Scheduling & Reminders', dev: 350, arch: 20, qa: 25, pm: 16, onb: 30, api: 1500, locs: 100, lic: 2, run: 20, sup: 3, sec: 5, rd: 2, tok: .3 },
        { n: 'Prior Authorization', dev: 400, arch: 40, qa: 50, pm: 30, onb: 60, api: 5000, locs: 60, lic: 3, run: 25, sup: 5, sec: 8, rd: 3, tok: 1.5 },
        { n: 'Referral Management', dev: 350, arch: 30, qa: 35, pm: 20, onb: 40, api: 2500, locs: 70, lic: 2, run: 15, sup: 4, sec: 5, rd: 2, tok: .8 },
        { n: 'Billing / RCM Claims Scrubbing', dev: 250, arch: 45, qa: 55, pm: 35, onb: 80, api: 6000, locs: 50, lic: 4, run: 30, sup: 6, sec: 10, rd: 4, tok: 2 },
        { n: 'Patient Outreach & Follow-up', dev: 250, arch: 18, qa: 22, pm: 14, onb: 25, api: 1000, locs: 80, lic: 1, run: 20, sup: 2, sec: 4, rd: 1, tok: .6 }],
      tiers: ['Starter', 'Growth', 'Premium'],
      inc: [[1, 1, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
      disc: [0, .1, .15] },
    ps: { tm: [.75, .5, null, .45, .35, .55], fl: [.6, .3, .2, .3, .25, .35], markup: .4, disc: [0, 0, 0, 0, 0, 0, 0, 0] },
    q: { client: '', tier: 1, locs: 5, usage: 4, customQty: 1, owner: 'private', appBuildQty: 1, appRunQty: 1,
      inc: { sub: true, usage: true, custom: true, advisory: true, appBuild: true, appRun: true, appsMo: true, appsOne: true },
      market: 'US', cur: 'USD', term: 12 },
    mc: {
      primary: ['Value-Based', 'Cost-Plus', 'Cost-Plus', 'Cost-Plus', 'Cost-Plus', 'Value-Based'],
      secondary: ['Competitive', 'Competitive', 'Value-Based', 'Competitive', 'Competitive', 'EVE'],
      weight: [.7, 1, 1, .7, .8, .7],
      low: [350, 20, 12000, 1800, 12000, 1500], mid: [500, 30, 16000, 2400, 18000, 2000], high: [750, 45, 22000, 3200, 25000, 3000],
      pos: [0, 0, -.05, -.1, 0, 0],
      hrs: [20, 1, 400, 40, 200, 80], rate: [45, 45, 45, 45, 45, 45], leak: [600, 15, 10000, 1000, 5000, 2400], capture: [.35, .4, .5, .4, .5, .35],
      posd: [200, 5, 6000, 500, 4000, 800], negd: [50, 0, 2000, 200, 1000, 200], share: [.5, .5, .5, .5, .5, .5],
      codev: .8, pay: [.3, .4, .3], royalty: .05, capMult: 3, custRev: 50000, months: 12 },
    mp: { idx: [null, null, null, null, null, null, null, null] },
    pk: [{ k: 'starter', n: 'Starter', count: 3, disc: 0, prov: 3, tag: 'Essentials for a focused clinic' },
      { k: 'growth', n: 'Growth', count: 5, disc: .1, prov: 5, tag: 'Most popular' },
      { k: 'premium', n: 'Premium', count: 7, disc: .15, prov: 8, tag: 'Full practice coverage' }],
    w: WIZ_DEFAULTS(),
    // Product structure: Platform → Modules (specialty packs) → Workflows, each running on a Product
    mod: { platCost: null, platM: null, disc: .1, appFloorOne: .25, appFloorMo: .35,
      products: [
        { n: 'Care Avatar', d: 'Patient-facing AI avatar for intake, education, prep and follow-up', drv: 'Avatar sessions', src: 0, cost: null, m: .75, tok: null },
        { n: 'Pre-Auth Agent', d: 'Gathers documentation, checks payer criteria, prepares and tracks submissions', drv: 'Pre-auth submissions', src: 2, cost: null, m: .75, tok: null },
        { n: 'Injection Management', d: 'Tracks injection series, intervals, drug lots and J-codes, scheduling', drv: 'Active patients or episodes', src: 5, cost: null, m: .75, tok: null },
        { n: 'Clinical Huddle', d: 'Daily huddle board: schedule, open auths, flags, tasks', drv: 'Included (low cost)', src: 1, cost: null, m: .75, tok: null },
        { n: 'Referral Intake', d: 'Captures, triages and routes incoming referrals', drv: 'Referrals processed', src: 3, cost: null, m: .75, tok: null }],
      modules: [
        { n: 'Spine and Pain', d: 'Starter (pick 3) or Growth (all 5)', wf: [
          { id: 'w2', n: 'Pre-clinic avatar intake', p: 0, sel: 1 }, { id: 'w3', n: 'Pre-auth for ESI, RFA, SCS', p: 1, sel: 1 }, { id: 'w4', n: 'Injection series tracker', p: 2, sel: 1 },
          { id: 'w5', n: 'Daily huddle', p: 3, sel: 1 }, { id: 'w6', n: 'Post-procedure follow-up avatar', p: 0, sel: 1 }] },
        { n: 'Interventional Radiology', d: 'Growth', wf: [
          { id: 'w8', n: 'IR procedure education avatar', p: 0, sel: 0 }, { id: 'w9', n: 'IR pre-auth', p: 1, sel: 0 }, { id: 'w10', n: 'Referral intake', p: 4, sel: 0 },
          { id: 'w11', n: 'Daily huddle', p: 3, sel: 0 }, { id: 'w12', n: 'Post-procedure follow-up', p: 0, sel: 0 }] },
        { n: 'Cardiology', d: 'Growth or Pro', wf: [
          { id: 'w14', n: 'Pre-visit avatar', p: 0, sel: 0 }, { id: 'w15', n: 'Imaging pre-auth (echo, stress, cardiac CT)', p: 1, sel: 0 }, { id: 'w16', n: 'Device & remote-monitoring follow-up', p: 0, sel: 0 },
          { id: 'w17', n: 'Daily huddle', p: 3, sel: 0 }, { id: 'w18', n: 'Referral intake', p: 4, sel: 0 }] }],
      apps: [
        { n: 'Branded experience layer', d: 'Clinic-branded React front end: logo, colors, domain, patient portal look', own: 'Care-Tech360 (clinic owns brand assets)', sel: 0, qty: 1, c1: 1200, m1: .4, c2: 25, m2: .75 },
        { n: 'Patient mobile app', d: 'White-label app (PWA first, native later) for intake, avatar, reminders', own: 'Care-Tech360', sel: 0, qty: 1, c1: null, m1: null, c2: null, m2: null, link: 1 },
        { n: 'EHR or PM connector', d: 'FHIR, HL7 or vendor API link (eClinicalWorks, ModMed, athenahealth, Epic)', own: 'Care-Tech360, reusable', sel: 0, qty: 1, c1: 3000, m1: .4, c2: 40, m2: .75 },
        { n: 'Analytics add-on', d: 'Dashboards: auth turnaround, denial rate, avatar completion, injection compliance', own: 'Care-Tech360', sel: 0, qty: 1, c1: 0, m1: .4, c2: 30, m2: .8 },
        { n: 'API access for MSOs & partners', d: 'Secure API to push or pull workflow data', own: 'Care-Tech360', sel: 0, qty: 1, c1: 1500, m1: .4, c2: 125, m2: .75 },
        { n: 'Partner marketplace app', d: 'A third party builds on Care-Tech360 and sells to clinics (certification)', own: 'Partner', sel: 0, qty: 1, c1: 2000, m1: .6, c2: 0, m2: .75 }] }
  };
}
const safeDiv = (c, m) => m < 1 ? c / (1 - m) : 0;
function newQuoteNo() { const d = new Date(); return 'CT360-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + Math.floor(100 + Math.random() * 900); }
function WIZ_DEFAULTS() {
  return { step: 1,
    hosp: { name: '', specialty: 'Spine and Pain', contact: '', title: '', email: '', phone: '', addr: '', city: '', state: '', zip: '', ehr: '', notes: '' },
    quoteNo: newQuoteNo(), validDays: 30, preparedBy: 'Ensemble Digital Labs', providers: 10,
    mode: 'growth', customDisc: .1, customProv: 5, sel: [], filter: 'all',
    provCost: 19.75, provM: .75, setupCost: 250, setupM: .75, setupFloor: .5,
    inc: { pkg: 1, prov: 1, usage: 1, setup: 1, custom: 0, advisory: 0, appsMo: 1, appsOne: 1, appBuild: 0, appRun: 0 },
    disc: { pkg: 0, prov: 0, usage: 0, setup: 0, custom: 0, advisory: 0, appsMo: 0, appsOne: 0, appBuild: 0, appRun: 0 },
    showMargin: false };
}

function compute(S) {
  const R = {}, rc = S.rc;
  R.roles = rc.roles.map(r => {
    const us = r.usS ?? rc.usShare, is = r.inS ?? rc.inShare;
    return { usS: us, inS: is, bUS: r.us * (1 - us) + r.in * us, bIN: r.us * (1 - is) + r.in * is, capWarn: r.in > rc.cap };
  });

  // ---- Cost Build-Up
  const cb = S.cb, ovr = Math.max(0, cb.tokExp - cb.tokAllow);
  const links = { locs: cb.locs, ovr1000: ovr * 1000, ovr: ovr, advDays: cb.advDays, appsLive: cb.appsLive };
  const div = { platform: cb.locs, usage: 1, custom: cb.projects, advisory: cb.advDays, appBuild: cb.apps, appRun: cb.appsLive };
  R.cb = { ovr, div };
  for (const k of SEC_KEYS) {
    let tUS = 0, tIN = 0;
    const lines = cb.sec[k].map(L => {
      const hv = L.h === 'day' ? rc.hrsDay : L.h === 'month' ? rc.hrsMonth : L.h;
      const qty = L.link ? links[L.link] : L.q;
      const uUS = L.role != null ? R.roles[L.role].bUS * hv : L.us;
      const uIN = L.role != null ? R.roles[L.role].bIN * hv : (L.inr != null ? L.inr : L.us);
      const sp = L.am ? cb.amort : L.s, pUS = sp ? qty * uUS / sp : 0, pIN = sp ? qty * uIN / sp : 0;
      tUS += pUS; tIN += pIN;
      return { qty, hv, uUS, uIN, pUS, pIN, sp };
    });
    const d = div[k];
    R.cb[k] = { lines, tUS, tIN, perUS: d ? tUS / d : 0, perIN: d ? tIN / d : 0 };
  }

  // ---- Workflow Catalogue
  const wc = S.wc, tm0 = S.ps.tm[0], fl0 = S.ps.fl[0];
  const rU = [0, 1, 2, 3].map(i => R.roles[i].bUS), rI = [0, 1, 2, 3].map(i => R.roles[i].bIN);
  const tokCost = R.cb.usage.perUS;
  const platCost = R.cb.platform.perUS, platCostIN = R.cb.platform.perIN, platFee = platCost / (1 - tm0);
  const K6 = S.ps.markup / (1 + S.ps.markup);
  const tm = S.ps.tm.map((v, i) => i === 2 ? K6 : v), fl = S.ps.fl;
  const overPrice = tokCost / (1 - tm[1]);
  R.wc = { rU, rI, tokCost, overPrice, platCost, platCostIN, platFee };
  R.wc.wf = wc.wf.map(w => {
    const onb = w.onb || 0, lic = w.lic || 0, sup = w.sup || 0, sec = w.sec || 0, rd = w.rd || 0;
    const H = w.dev * rU[0] + w.arch * rU[1] + w.qa * rU[2] + w.pm * rU[3] + onb * rU[0] + w.api;
    const den = wc.recovery * w.locs;
    const K = den ? H / den : 0, N = w.tok * tokCost;
    const O = K + lic + w.run + sup + sec + rd + N, P = O / (1 - tm0);
    const pb = (P - lic - w.run - sup - sec - rd - N) * w.locs, Q = pb <= 0 ? 0 : H / pb;
    const Ri = w.dev * rI[0] + w.arch * rI[1] + w.qa * rI[2] + w.pm * rI[3] + onb * rI[0] + w.api;
    const Si = den ? Ri / den : 0, T = Si + lic + w.run + sup + sec + rd + N;
    return { H, K, N, O, P, Q, Ri, Si, T };
  });
  R.wc.tot = { H: sum(R.wc.wf.map(x => x.H)), O: sum(R.wc.wf.map(x => x.O)), P: sum(R.wc.wf.map(x => x.P)), Ri: sum(R.wc.wf.map(x => x.Ri)), T: sum(R.wc.wf.map(x => x.T)) };
  R.wc.tiers = [0, 1, 2].map(t => {
    const inc = wc.inc.map(r => r[t] ? 1 : 0);
    const sp = key => sum(inc.map((v, i) => v * R.wc.wf[i][key]));
    const count = sum(inc), cost = sp('O'), list = sp('P'), bundled = list * (1 - wc.disc[t]);
    const price = bundled + platFee, tcost = platCost + cost, margin = price ? 1 - tcost / price : 0;
    const incTok = sum(inc.map((v, i) => v * wc.wf[i].tok));
    const costIN = platCostIN + sp('T');
    return { name: wc.tiers[t], inc, count, wfCost: cost, list, bundled, fee: platFee, price, cost: tcost, margin, floorOK: margin >= fl0, incTok, costIN };
  });

  // ---- Module calculator (product structure, custom bundle, apps)
  const md = S.mod, q = S.q;
  const prods = md.products.map(p => {
    const L = R.wc.wf[p.src], W = wc.wf[p.src];
    const linkCost = L ? L.O : 0, linkIN = L ? L.T : 0, linkTok = W ? W.tok : 0;
    const cost = p.cost ?? linkCost, tok = p.tok ?? linkTok;
    return { linkCost, linkTok, linkName: W ? W.n : '—', cost, costIN: p.cost != null ? p.cost : linkIN, m: p.m, price: safeDiv(cost, p.m), tok, uses: 0, used: 0 };
  });
  const mods = md.modules.map(mo => {
    const wfs = mo.wf.map(w => {
      const P = prods[w.p] || prods[0], cost = w.cost ?? P.cost, m = w.m ?? P.m;
      P.uses++; if (w.sel) P.used++;
      const list = safeDiv(cost, m), disc = w.disc || 0, price = list * (1 - disc);
      return { cost, m, costIN: w.cost != null ? w.cost : P.costIN, list, disc, price, effM: price ? 1 - cost / price : 0, tok: P.tok, sel: !!w.sel, pCost: P.cost, pM: P.m };
    });
    const s = wfs.filter(w => w.sel);
    return { wf: wfs, count: s.length, list: sum(s.map(w => w.price)) };
  });
  const selWf = mods.flatMap(x => x.wf).filter(w => w.sel);
  const platCostB = md.platCost ?? platCost, platM = md.platM ?? tm0, mfee = safeDiv(platCostB, platM);
  const mList = sum(selWf.map(w => w.price)), mWfCost = sum(selWf.map(w => w.cost)), mBundled = mList * (1 - md.disc);
  const mPrice = mfee + mBundled, mbCost = platCostB + mWfCost, mMargin = mPrice ? 1 - mbCost / mPrice : 0;
  const mCostIN = (md.platCost ?? platCostIN) + sum(selWf.map(w => w.costIN));
  const apps = md.apps.map(a => {
    const lc1 = a.link ? R.cb.appBuild.perUS : 0, lc2 = a.link ? R.cb.appRun.perUS : 0, lm1 = a.link ? tm[4] : .4, lm2 = a.link ? tm[5] : .75;
    const c1 = a.c1 ?? lc1, c2 = a.c2 ?? lc2, m1 = a.m1 ?? lm1, m2 = a.m2 ?? lm2, p1 = safeDiv(c1, m1), p2 = safeDiv(c2, m2), n = a.sel ? a.qty : 0;
    return { lc1, lc2, lm1, lm2, c1, c2, m1, m2, p1, p2, sel: !!a.sel, one: p1 * n, oneC: c1 * n, mo: p2 * n, moC: c2 * n };
  });
  const sa = apps.filter(a => a.sel);
  R.mod = { prods, mods, platCostB, platM, fee: mfee, count: selWf.length, list: mList, wfCost: mWfCost, bundled: mBundled, price: mPrice, cost: mbCost,
    margin: mMargin, floorOK: mMargin >= fl0 - 1e-9, incTok: sum(selWf.map(w => w.tok)), costIN: mCostIN,
    inPrice: Math.max(mPrice * rc.index, safeDiv(mCostIN, fl0)), apps, appCount: sa.length,
    oneP: sum(sa.map(a => a.one)), oneC: sum(sa.map(a => a.oneC)), moP: sum(sa.map(a => a.mo)), moC: sum(sa.map(a => a.moC)) };
  const Mo = R.mod;
  Mo.monthly = Mo.price * q.locs + Mo.moP; Mo.monthlyC = Mo.cost * q.locs + Mo.moC;
  Mo.y1 = Mo.monthly * q.term + Mo.oneP; Mo.y1C = Mo.monthlyC * q.term + Mo.oneC;
  Mo.tier = { name: 'Custom bundle', price: Mo.price, cost: Mo.cost, margin: Mo.margin, incTok: Mo.incTok, count: Mo.count, costIN: Mo.costIN, inc: [] };

  // ---- Pricing Summary (USA)
  const tier = q.tier === 3 ? Mo.tier : R.wc.tiers[q.tier];
  const overPerLoc = Math.max(0, q.usage - tier.incTok), overTot = overPerLoc * q.locs;
  const costU = [tier.cost, tokCost, R.cb.custom.perUS, R.cb.advisory.perUS, R.cb.appBuild.perUS, R.cb.appRun.perUS];
  const qty = [q.locs, overTot, q.customQty, cb.advDays, q.appBuildQty, q.appRunQty];
  const P4 = tier.cost ? 1 - tier.price / (tier.cost / (1 - tm[0])) : 0;
  R.ps = { tm, fl, K6, overPerLoc, overTot, rows: costU.map((I, i) => {
    const H = qty[i], K = tm[i], N = fl[i], J = H * I, L = I / (1 - K), M = L * H, O = 1 - (1 - K) / (1 - N);
    const P = i === 0 ? P4 : S.ps.disc[i], Qv = M * (1 - P), Rv = Qv === 0 ? 0 : (Qv - J) / Qv;
    return { H, I, J, K, L, M, N, O, P, Q: Qv, R: Rv, ok: P <= O + 1e-12 };
  }) };

  // ---- Market Pricing (USA vs India)
  const mpSrc = [
    ...[0, 1, 2].map(t => ({ name: 'Subscription – ' + R.wc.tiers[t].name + ' tier', unit: 'Per location / month', usCost: R.wc.tiers[t].cost, tm: tm[0], usList: R.wc.tiers[t].price, inCost: R.wc.tiers[t].costIN, fl: fl[0] })),
    ...[1, 2, 3, 4, 5].map(i => ({ name: SERVICES[i], unit: SVC_UNITS[i], usCost: costU[i], tm: tm[i], usList: R.ps.rows[i].L, inCost: R.cb[SEC_KEYS[i]].perIN, fl: fl[i] }))];
  R.mp = mpSrc.map((m, r) => {
    const idx = S.mp.idx[r] ?? rc.index, usM = m.usList ? 1 - m.usCost / m.usList : 0;
    const J = m.usList * idx, Lf = m.inCost / (1 - m.fl), M = Math.max(J, Lf);
    return { ...m, idx, usM, J, Lf, M, INR: M * rc.fx, inM: M ? 1 - m.inCost / M : 0, floorApplied: J < Lf, save: m.usCost ? 1 - m.inCost / m.usCost : 0 };
  });

  // ---- Method Calculator
  const mc = S.mc;
  const mCost = [platCost, tokCost, R.cb.custom.perUS, R.cb.advisory.perUS, R.cb.appBuild.perUS, R.cb.appRun.perUS];
  const mQty = [q.locs, ovr, q.customQty, cb.advDays, q.appBuildQty, q.appRunQty];
  R.mc = mCost.map((c, i) => {
    const cp = c / (1 - tm[i]), floor = c / (1 - fl[i]), comp = mc.mid[i] * (1 + mc.pos[i]);
    const labor = mc.hrs[i] * mc.rate[i], value = labor + mc.leak[i], vb = value * mc.capture[i];
    const ref = mc.mid[i], net = mc.posd[i] - mc.negd[i], tev = ref + net, eve = ref + net * mc.share[i];
    const byM = { 'Cost-Plus': cp, 'Competitive': comp, 'Value-Based': vb, 'EVE': eve };
    const p1 = byM[mc.primary[i]], p2 = byM[mc.secondary[i]], blend = p1 * mc.weight[i] + p2 * (1 - mc.weight[i]);
    const rec = Math.max(floor, blend), m = rec ? 1 - c / rec : 0;
    return { cost: c, psCost: costU[i], qty: mQty[i], tm: tm[i], cp, fl: fl[i], floor, comp, labor, value, vb, ref, net, tev, eve, p1, p2, blend, rec,
      floorApplied: blend < floor, margin: m, dealP: rec * mQty[i], dealC: c * mQty[i], gp: rec * mQty[i] - c * mQty[i], list: R.ps.rows[i].L, varc: rec - R.ps.rows[i].L };
  });
  const priv = R.mc[2].rec, codevP = priv * mc.codev, codevDisc = priv - codevP, royCap = codevDisc * mc.capMult;
  const annRoy = Math.min(mc.custRev * mc.royalty, royCap), yrsCap = mc.custRev * mc.royalty ? royCap / (mc.custRev * mc.royalty) : 0;
  const y1V = R.mc[4].rec + R.mc[5].rec * mc.months, y1C = R.mc[4].cost + R.mc[5].cost * mc.months;
  R.mech = { allowance: cb.tokAllow, expected: cb.tokExp, ovr, overPrice: R.mc[1].rec, overCharge: ovr * R.mc[1].rec,
    priv, codevP, codevDisc, payPriv: mc.pay.map(p => p * priv), payCo: mc.pay.map(p => p * codevP), paySum: sum(mc.pay),
    royCap, annRoy, yrsCap, y1Build: R.mc[4].rec, y1Run: R.mc[5].rec, y1V, y1C, y1M: y1V ? 1 - y1C / y1V : 0 };

  // ---- Quote (customer deal)
  const IN = q.market === 'IN', ownF = q.owner === 'codev' ? mc.codev : 1;
  const mpRow = [q.tier, 3, 4, 5, 6, 7];
  const names = ['Subscription – ' + tier.name + (q.tier === 3 ? '' : ' tier'), 'AI usage overage', 'Custom workflow build' + (q.owner === 'codev' ? ' (co-develop)' : ' (private IP)'), 'Technology advisory', 'Application build', 'Application run'];
  const units = ['location / mo', '1M tokens / mo', 'project', 'consultant day', 'application', 'app / mo'];
  const recurring = [true, true, false, false, false, true];
  const lines = SVC_KEYS.map((k, i) => {
    let price, cost;
    if (i === 0 && q.tier === 3) { price = IN ? Mo.inPrice : Mo.price; cost = IN ? Mo.costIN : Mo.cost; }
    else { price = IN ? R.mp[mpRow[i]].M : (i === 0 ? tier.price : R.ps.rows[i].L); cost = IN ? R.mp[mpRow[i]].inCost : costU[i]; }
    if (i === 2) price *= ownF;
    const disc = S.ps.disc[i], net = price * (1 - disc), n = qty[i], on = !!q.inc[k];
    const total = on ? net * n : 0, tcost = on ? cost * n : 0;
    const margin = net ? 1 - cost / net : 0, maxDisc = price ? Math.max(0, 1 - cost / (price * (1 - fl[i]))) : 0;
    return { k, name: names[i], unit: units[i], recurring: recurring[i], on, qty: n, price, disc, net, cost, total, tcost, margin, floor: fl[i], maxDisc, ok: margin >= fl[i] - 1e-9 };
  });
  // bundle apps (from Module calculator)
  const appNames = md.apps.filter(a => a.sel).map(a => a.n + (a.qty > 1 ? ' ×' + a.qty : '')).join(', ');
  [['appsMo', 'Bundle apps – monthly', 'month', true, Mo.moP, Mo.moC, md.appFloorMo, 7], ['appsOne', 'Bundle apps – one-time', 'set', false, Mo.oneP, Mo.oneC, md.appFloorOne, 6]].forEach(([k, name, unit, recur, p, c, floor, di]) => {
    let price = p; if (IN && p) price = Math.max(p * rc.index, safeDiv(c, floor));
    const disc = S.ps.disc[di] || 0, net = price * (1 - disc), n = Mo.appCount && p ? 1 : 0, on = !!q.inc[k];
    lines.push({ k, name, sub: appNames, unit, recurring: recur, on, qty: n, price, disc, net, cost: c, total: on ? net * n : 0, tcost: on ? c * n : 0,
      margin: net ? 1 - c / net : 0, floor, maxDisc: price ? Math.max(0, 1 - c / (price * (1 - floor))) : 0, ok: !net || 1 - c / net >= floor - 1e-9 });
  });
  const rec = lines.filter(l => l.recurring), one = lines.filter(l => !l.recurring);
  const mrr = sum(rec.map(l => l.total)), mcost = sum(rec.map(l => l.tcost));
  const otc = sum(one.map(l => l.total)), ocost = sum(one.map(l => l.tcost));
  const y1 = mrr * q.term + otc, y1c = mcost * q.term + ocost;
  const custom = lines[2];
  R.quote = { lines, mrr, mcost, mMargin: mrr ? 1 - mcost / mrr : 0, otc, ocost, oMargin: otc ? 1 - ocost / otc : 0,
    acv: mrr * 12, y1, y1c, gp: y1 - y1c, margin: y1 ? 1 - y1c / y1 : 0,
    warn: lines.filter(l => l.on && l.qty > 0 && !l.ok).length,
    pay: mc.pay.map(p => p * custom.total), overPerLoc, overTot, tier,
    royalty: q.owner === 'codev' ? { rate: mc.royalty, cap: (custom.price / mc.codev - custom.price) * custom.qty * mc.capMult } : null };
  // ---- Easy Quote (wizard)
  R.w = wizard(S, R, { IN, ownF, costU, tm, fl, tokCost, platCostIN });
  return R;
}
function wizard(S, R, X) {
  const w = S.w, q = S.q, md = S.mod, rc = S.rc, Mo = R.mod, IN = X.IN, fl = X.fl;
  const svcs = [];
  md.modules.forEach((mo, i) => mo.wf.forEach((wf, j) => { const c = Mo.mods[i].wf[j];
    svcs.push({ id: wf.id, mi: i, mod: mo.n, n: wf.n, p: wf.p, list: c.list, disc: c.disc, price: c.price, cost: c.cost, costIN: c.costIN, tok: c.tok, sel: w.sel.includes(wf.id) }); }));
  const sel = svcs.filter(s => s.sel);
  const P = w.mode === 'custom' ? { k: 'custom', n: 'Custom bundle', count: null, disc: w.customDisc, prov: w.customProv } : (S.pk.find(p => p.k === w.mode) || S.pk[1]);
  const locs = q.locs, list = sum(sel.map(s => s.price)), bundled = list * (1 - P.disc);
  const unitPrice = Mo.fee + bundled, unitCost = Mo.platCostB + sum(sel.map(s => s.cost));
  const unitCostIN = (md.platCost ?? X.platCostIN) + sum(sel.map(s => s.costIN));
  const need = P.count ? Math.max(0, P.count - sel.length) : 0, complete = sel.length > 0 && need === 0 && (!P.count || sel.length === P.count);
  const provIncl = P.prov * locs, extraProv = Math.max(0, w.providers - provIncl), provPrice = safeDiv(w.provCost, w.provM);
  const incTok = sum(sel.map(s => s.tok)), overPerLoc = Math.max(0, q.usage - incTok), overTot = overPerLoc * locs;
  const setupPrice = safeDiv(w.setupCost, w.setupM);
  const inP = (p, c, f) => IN ? Math.max(p * rc.index, safeDiv(c, f)) : p;
  const L = [];
  const add = (k, name, desc, unit, recurring, qty, price, cost, floor, extra = {}) => {
    const disc = w.disc[k] || 0, net = price * (1 - disc), on = !!w.inc[k] && qty > 0;
    L.push({ k, name, desc, unit, recurring, qty, price, disc, net, cost, total: on ? net * qty : 0, tcost: on ? cost * qty : 0, on, enabled: !!w.inc[k],
      margin: net ? 1 - cost / net : 0, floor, maxDisc: price ? Math.max(0, 1 - cost / (price * (1 - floor))) : 0, ok: !net || 1 - cost / net >= floor - 1e-9, ...extra });
  };
  const pkgName = P.n + (P.k === 'custom' ? '' : ' package');
  add('pkg', pkgName, sel.length + ' services · platform, hosting, security, support', 'location / month', true, sel.length ? locs : 0,
    IN ? Math.max(unitPrice * rc.index, safeDiv(unitCostIN, fl[0])) : unitPrice, IN ? unitCostIN : unitCost, fl[0]);
  add('prov', 'Additional providers', `${P.prov} providers per location included (${provIncl} total)`, 'provider / month', true, extraProv, inP(provPrice, w.provCost, fl[0]), w.provCost, fl[0]);
  const overPrice = IN ? R.mp[3].M : R.wc.overPrice, overCost = IN ? R.mp[3].inCost : X.tokCost;
  add('usage', 'AI usage above allowance', `${+incTok.toFixed(2)}M tokens per location included; est. ${+q.usage}M used`, '1M tokens / month', true, overTot, overPrice, overCost, fl[1]);
  const appNames = md.apps.filter(a => a.sel).map(a => a.n + (a.qty > 1 ? ' ×' + a.qty : '')).join(', ');
  add('appsMo', 'Apps — hosting, support & updates', appNames, 'month', true, Mo.appCount && Mo.moP ? 1 : 0, inP(Mo.moP, Mo.moC, md.appFloorMo), Mo.moC, md.appFloorMo);
  add('appRun', 'Custom application run', 'Hosting, maintenance and OS/EHR updates per live app', 'app / month', true, q.appRunQty,
    IN ? R.mp[7].M : R.ps.rows[5].L, IN ? R.mp[7].inCost : X.costU[5], fl[5]);
  add('setup', 'Clinic setup & onboarding', 'Configuration, branding, training and go-live', 'location', false, locs, inP(setupPrice, w.setupCost, w.setupFloor), w.setupCost, w.setupFloor);
  add('custom', 'Custom workflow build' + (q.owner === 'codev' ? ' (co-develop)' : ' (private IP)'), 'Cost + 40%, paid 30 / 40 / 30', 'project', false, q.customQty,
    (IN ? R.mp[4].M : R.ps.rows[2].L) * X.ownF, IN ? R.mp[4].inCost : X.costU[2], fl[2]);
  add('advisory', 'Technology advisory', 'Workshops, assessment and roadmap', 'consultant day', false, S.cb.advDays, IN ? R.mp[5].M : R.ps.rows[3].L, IN ? R.mp[5].inCost : X.costU[3], fl[3]);
  add('appsOne', 'Apps — build & setup', appNames, 'set', false, Mo.appCount && Mo.oneP ? 1 : 0, inP(Mo.oneP, Mo.oneC, md.appFloorOne), Mo.oneC, md.appFloorOne);
  add('appBuild', 'Custom application build', 'Mobile/web development, UX and EHR integration', 'application', false, q.appBuildQty,
    IN ? R.mp[6].M : R.ps.rows[4].L, IN ? R.mp[6].inCost : X.costU[4], fl[4]);
  const rec = L.filter(l => l.recurring), one = L.filter(l => !l.recurring);
  const mrr = sum(rec.map(l => l.total)), mcost = sum(rec.map(l => l.tcost)), otc = sum(one.map(l => l.total)), ocost = sum(one.map(l => l.tcost));
  const y1 = mrr * q.term + otc, y1c = mcost * q.term + ocost, custom = L.find(l => l.k === 'custom');
  return { svcs, sel, P, pkgName, list, bundled, unitPrice, unitCost, need, complete, provIncl, extraProv, provPrice, setupPrice, incTok, overPerLoc, overTot,
    lines: L, mrr, mcost, otc, ocost, acv: mrr * 12, y1, y1c, gp: y1 - y1c, margin: y1 ? 1 - y1c / y1 : 0, mMargin: mrr ? 1 - mcost / mrr : 0,
    warn: L.filter(l => l.on && !l.ok).length, pay: S.mc.pay.map(p => p * custom.total) };
}
function sum(a) { return a.reduce((x, y) => x + (+y || 0), 0); }
if (typeof module !== 'undefined') module.exports = { DEFAULTS, WIZ_DEFAULTS, compute };
