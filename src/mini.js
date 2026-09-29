// mini.js: Mini character, painted in watercolour and ink. v2 — readable silhouette.
// Big cloud head (6u x 4.8u) over a small round belly, stubby side flippers, two round feet.
// (x, y) = ground point between the feet; total height ~7.6u. Eyes: '>' + '_' terminal prompt, glowing; mouth: '<'.
// options: view(front|q|side|qback|back), flip, dx, dy(u), sq, rot, walk, aL, aR, eyes, mouth, lookX, lookY,
//          squint, tear, glowK, tint+tintK, dim, boilKey, noShadow, blinkSeed, draw(u,sw), armL, armR.

let MINI_N = 0;
const MINI_COL = { body: '#4C6EF5', dk: '#2F44A8', lt: '#8CA2FF', glow: '#F4FFFF', glow2: '#9BE8FF', line: '#242F63' };

function cloudPts(cx, cy, rx, ry, n, j, ph, amp) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const r = 1 + (amp || .16) * Math.sin(5 * a + (ph || 0)) + .05 * Math.sin(9 * a + 1.3) + jit(j);
    P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return P;
}
function dropPts(cx, cy, rx, ry, rot) {
  const P = [];
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, r = 1 + .25 * Math.cos(a - (rot || 0));
    P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return P;
}
function tGlobal() { return (typeof T === 'number') ? T : 0; }

// ---- eye kinds: chev('>') / line('_') / closed / happy / sleepy / sad / cry / wide / scared

function miniStroke(P, w, col) {
  paint(ribbon(P, w * .95, w * .68), { wash: col, washOp: 255, fill: col, fillOp: 255, bleed: .02, tex: .08, border: .18, ink: null, curv: .95 });
}
function miniEye(x, y, s, kind, look, sw, col) {
  if (kind === 'line' || kind === 'underscore') { miniStroke([[x - .55 * s, y + .3 * s], [x + .55 * s, y + .3 * s]], sw * 1.25, col); return; }
  if (kind === 'closed') { miniStroke([[x - .5 * s, y + .1 * s], [x + .5 * s, y + .1 * s]], sw, col); return; }
  if (kind === 'happy') { miniStroke(through([[x - .55 * s, y + .3 * s], [x, y - .45 * s], [x + .55 * s, y + .3 * s]], 4), sw * 1.15, col); return; }
  if (kind === 'sleepy') { miniStroke(through([[x - .55 * s, y - .1 * s], [x, y + .35 * s], [x + .55 * s, y - .1 * s]], 4), sw, col); return; }
  if (kind === 'sad') {
    miniStroke([[x - .5 * s, y - .45 * s], [x + .35 * s, y + .1 * s]], sw * 1.15, col);
    miniStroke([[x - .4 * s, y + .6 * s], [x + .5 * s, y + .35 * s]], sw, col);
    return;
  }
  if (kind === 'cry') {
    miniStroke([[x - .5 * s, y - .4 * s], [x + .05 * s, y + .05 * s]], sw * 1.15, col);
    miniStroke([[x + .05 * s, y + .05 * s], [x - .5 * s, y + .5 * s]], sw * 1.15, col);
    return;
  }
  if (kind === 'wide' || kind === 'scared') {
    paint(ellPts(x, y, .62 * s, .68 * s, 14), { wash: col, ink: null });
    paint(ellPts(x + look.x * .2 * s, y + look.y * .2 * s, .24 * s, .3 * s, 10), { wash: MINI_COL.dk, ink: null });
    return;
  }
  // default '>'
  const t = kind === 'squint' ? .35 : 0;
  miniStroke([[x - .45 * s, y - .55 * s + t * s], [x + .5 * s, y + .05 * s + look.y * .12 * s]], sw * 1.25, col);
  miniStroke([[x + .5 * s, y + .05 * s + look.y * .12 * s], [x - .45 * s, y + .65 * s - t * s]], sw * 1.25, col);
}

function miniMouth(x, y, s, kind, sw, col) {
  if (kind === 'o') { paint(ellPts(x, y, .34 * s, .4 * s, 12), { wash: MINI_COL.dk, ink: null }); return; }
  if (kind === 'flat') { miniStroke([[x - .5 * s, y], [x + .5 * s, y]], sw, col); return; }
  if (kind === 'smile') { miniStroke(through([[x - .55 * s, y - .3 * s], [x, y + .35 * s], [x + .55 * s, y - .3 * s]], 4), sw, col); return; }
  if (kind === 'frown') { miniStroke(through([[x - .55 * s, y + .35 * s], [x, y - .35 * s], [x + .55 * s, y + .35 * s]], 4), sw, col); return; }
  if (kind === 'wob') { miniStroke(through([[x - .55 * s, y], [x - .2 * s, y + .3 * s], [x + .15 * s, y - .25 * s], [x + .55 * s, y + .1 * s]], 4), sw, col); return; }
  // default '<'
  miniStroke([[x + .45 * s, y - .48 * s], [x - .4 * s, y]], sw * 1.15, col);
  miniStroke([[x - .4 * s, y], [x + .45 * s, y + .48 * s]], sw * 1.15, col);
}

function mini(x, y, u, o = {}) {
  MINI_N++;
  const key = o.boilKey ?? 'mini' + MINI_N;
  const view = o.view || 'front';
  const sideish = view === 'side', backish = view === 'qback' || view === 'back';
  const f = o.flip ? -1 : 1;
  const sq = o.sq || 0;
  const dim = o.dim || 0;
  const body = o.tint ? mixCol(MINI_COL.body, o.tint, o.tintK || .6) : MINI_COL.body;
  const bodyDk = mixCol(body, '#101A3A', .35 + dim * .35);
  const bodyLt = mixCol(body, '#CFE0FF', .5);
  const gcol = mixCol(MINI_COL.glow, body, .12 + dim * .5);
  const look = { x: (o.lookX || 0), y: (o.lookY || 0) };
  const blink = o.eyes === 'closed' || (!o.eyes && frac((o.blinkSeed || 0) + tGlobal() / 4.3) < .05);

  let bob = 0, fL = 0, fR = 0;
  if (o.walk !== undefined) {
    bob = -Math.abs(Math.sin(o.walk * Math.PI)) * .14 * u;
    fL = Math.max(0, Math.sin(o.walk * TAU)) * .3 * u;
    fR = Math.max(0, Math.sin(o.walk * TAU + Math.PI)) * .3 * u;
  }

  if (!o.noShadow) {
    boilSeed(key + 'sh');
    paint(ellPts(x + .35 * u, y + .10 * u, 2.05 * u * (1 + sq * .35), .34 * u, 20, 0), { fill: '#5A4A3A', fillOp: 36, bleed: .18, ink: null });
  }

  push(); translate(x, y); rotate(o.rot || 0);
  scale(1 + sq * .45, 1 - sq * .45);
  translate((o.dx || 0) * u, (o.dy || 0) * u + bob);

  // ---- feet (drawn first, visible below the belly)
  boilSeed(key + 'ft');
  paint(ellPts(-.94 * u, -.36 * u - fL, .68 * u, .38 * u, 18, 0), { wash: bodyDk, washOp: 180, fill: bodyDk, fillOp: 210, ink: MINI_COL.line, sw: .52, curv: .98 });
  paint(ellPts(.94 * u, -.36 * u - fR, .68 * u, .38 * u, 18, 0), { wash: bodyDk, washOp: 180, fill: bodyDk, fillOp: 210, ink: MINI_COL.line, sw: .52, curv: .98 });

  // ---- arms: small flippers hinged at the belly sides
  const pivY = -2.15 * u, pivX = 1.52 * u, armL = .90 * u;
  function arm(side, ang) {
    boilSeed(key + 'arm' + side);
    push(); translate(side * pivX * (side < 0 ? f : f), pivY);
    if (side < 0) scale(f, 1); else scale(f, 1);
    rotate(side * ang);
    paint(ellPts(armL * .52, 0, armL * .50, armL * .31, 18, 0), { wash: body, washOp: 170, fill: body, fillOp: 220, ink: MINI_COL.line, sw: .50, curv: .98 });
    if (side > 0 && o.armR) { boilSeed(key + 'armR'); o.armR(armL, .5 * u / 24); }
    if (side < 0 && o.armL) { boilSeed(key + 'armL'); o.armL(armL, .5 * u / 24); }
    pop();
  }
  const swing = o.walk !== undefined ? Math.sin(o.walk * TAU) * .2 : 0;
  arm(-1, -(o.aL ?? 0) + swing);   // left flipper: negative angle lifts it
  // ---- belly
  boilSeed(key + 'be');
  paint(cloudPts(0, -1.98 * u, 1.70 * u, 1.32 * u, 44, 0, 2.1, .032), { wash: body, washOp: 150, fill: body, fillOp: 225, bleed: .04, tex: .18, border: .24, ink: MINI_COL.line, sw: .62, curv: .98 });

  // ---- head: the big cloud, drawn last so its outline separates it from the belly
  boilSeed(key + 'hd');
  paint(cloudPts(0, -5.18 * u, 2.60 * u, 2.08 * u, 60, 0, .5, .046), { wash: body, washOp: 150, fill: body, fillOp: 230, bleed: .04, tex: .16, border: .26, ink: MINI_COL.line, sw: .68, curv: .98 });
  // top light + under-head shade
  paint(ellPts(-.72 * u * f, -6.32 * u, 1.18 * u, .44 * u, 20, 0), { wash: bodyLt, washOp: 95, ink: null });
  paint(ellPts(0, -3.62 * u, 1.32 * u, .28 * u, 20, 0), { wash: bodyDk, washOp: 85, ink: null });
  // side strip for q / side
  if (view === 'q' || view === 'side' || view === 'qback') {
    boilSeed(key + 'st');
    paint(ellPts(-1.52 * u * f * (backish ? -1 : 1), -5.12 * u, .52 * u, 1.34 * u, 18, 0), { wash: bodyDk, washOp: 125, ink: null });
  }

  // ---- face
  if (!backish) {
    const fx = (view === 'side' ? .9 : view === 'q' ? .55 : 0) * u * f;
    const s = u * .78, sw = .2 * u;
    boilSeed(key + 'facefield');
    paint(ellPts(fx, -4.72 * u, 1.70 * u, 1.28 * u, 30, 0), { wash: bodyDk, washOp: 42, ink: null });
    boilSeed(key + 'fc');
    const eL = fx - .94 * u * (sideish ? 0 : 1), eR = fx + (sideish ? .74 : .88) * u;
    const eyY = -5.34 * u + look.y * .14 * u;
    const kind = blink ? 'closed' : (o.eyes || 'normal');
    const lk = { x: look.x * f, y: look.y };
    if (kind !== 'closed') {
      if (!sideish) { glow(eL, eyY + .10 * s, .76 * u, MINI_COL.glow2, .17 + (o.glowK || 0) * .30); glow(eR, eyY + .18 * s, .68 * u, MINI_COL.glow2, .15 + (o.glowK || 0) * .28); }
      else glow(eR, eyY + .14 * s, .74 * u, MINI_COL.glow2, .20 + (o.glowK || 0) * .30);
    }
    if (!sideish) miniEye(eL + lk.x * .12 * u, eyY, s, kind === 'normal' ? 'chev' : kind, lk, sw, gcol);
    miniEye(eR + lk.x * .12 * u, eyY + (kind === 'normal' ? .22 * s : 0), s * .92, kind === 'normal' ? 'line' : kind, lk, sw, gcol);
    miniMouth(fx + look.x * .10 * u, -3.92 * u, .52 * u, o.mouth || 'lt', .16 * u, gcol);
    if ((o.tear || 0) > 0) {
      boilSeed(key + 'tr');
      const ty = -4.9 * u + frac(tGlobal() * .7) * 2.1 * u * o.tear;
      paint(dropPts(eR + .12 * u, Math.min(-3.3 * u, ty), .17 * u, .27 * u, 0), { wash: '#BFE4F0', ink: '#7FB6C9', sw: .3, curv: .9 });
    }
  }
  if (o.draw) { boilSeed(key + 'dr'); o.draw(u, .55); }

  arm(1, (o.aR ?? 0) - swing);
  pop();
  boilSeed(key + 'done' + MINI_N);
}

// ---- moods ----
const MINI_EMO = {
  neutral:   { eyes: 'normal', mouth: 'lt' },
  happy:     { eyes: 'happy', mouth: 'smile', tint: '#FFD98A', tintK: .18, body: t => ({ dy: Math.abs(Math.sin(t * 2 * Math.PI / BEAT * 2)) * .12 }) },
  excited:   { eyes: 'wide', mouth: 'o', glowK: .8, body: t => ({ dy: Math.abs(Math.sin(t * 3)) * .2, sq: Math.sin(t * 3) * .04 }) },
  sad:       { eyes: 'sad', mouth: 'frown', tint: '#5A6AA8', tintK: .3, body: t => ({ dy: Math.sin(t * .8) * .06 }) },
  cry:       { eyes: 'cry', mouth: 'wob', tint: '#5A6AA8', tintK: .35, body: t => ({ sq: Math.sin(t * 5) * .03 }) },
  scared:    { eyes: 'scared', mouth: 'o', tint: '#B8C4E8', tintK: .4, body: t => ({ sq: Math.sin(t * 7) * .05, dy: Math.sin(t * 9) * .04 }) },
  surprised: { eyes: 'wide', mouth: 'o', glowK: .9, body: t => ({ dy: take(t, 0, 1).dy * .3 }) },
  determined:{ eyes: 'normal', mouth: 'flat', glowK: .6, body: t => ({ sq: Math.sin(t * 2) * .015 }) },
  sleepy:    { eyes: 'sleepy', mouth: 'flat', tint: '#8890B8', tintK: .3, body: t => ({ dy: Math.sin(t * .6) * .1 }) },
  idea:      { eyes: 'wide', mouth: 'smile', glowK: .5 },
  love:      { eyes: 'happy', mouth: 'smile', tint: '#FF9DA8', tintK: .22 },
  bored:     { eyes: 'sleepy', mouth: 'flat', tint: '#8890B8', tintK: .35, body: t => ({ dy: Math.sin(t * .5) * .08 }) },
  proud:     { eyes: 'normal', mouth: 'smile', tint: '#FFD98A', tintK: .25 },
};

function mfeel(name, t, over = {}) {
  const e = MINI_EMO[name] || MINI_EMO.neutral;
  const b = e.body ? e.body(t) : {};
  return { eyes: e.eyes, mouth: e.mouth, tint: e.tint, tintK: e.tintK, glowK: e.glowK || 0, ...b, ...over };
}

function memotions(t, keys) {
  let i = 0; for (let k = 0; k + 1 < keys.length && t >= keys[k + 1][0]; k++) i++;
  const [t0, name, ov] = keys[i];
  const e = MINI_EMO[name] || MINI_EMO.neutral;
  const tk = take(t, t0, e.takeK ?? .5);
  const b = e.body ? e.body(t) : {};
  return { eyes: e.eyes, mouth: e.mouth, tint: e.tint, tintK: e.tintK, glowK: e.glowK || 0,
           dy: (b.dy || 0) + tk.dy * .35, sq: (b.sq || 0) + tk.sq * .4, ...ov };
}
