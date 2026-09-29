(() => {
// shuishou.js — 《水手》 lyric MV. One beach, one city, one dream. Mini by mini.js, old sailor by sailor() below.
// Every frame is a pure function of t. All coords are world px on a 1920x1080 canvas.

sailor = window.sailor || sailor; // V5 override loaded before this scene IIFE

const SC = {
  duskSky1: '#F6C46B', duskSky2: '#E98A4B', duskSea: '#3E6E8E', duskSeaHi: '#6FA3BC', sand: '#EBCD96', sandDk: '#C9A66B',
  stormSky1: '#5A6678', stormSky2: '#42506B', stormSea: '#2E4A62', stormSeaHi: '#5E7E96', rain: '#AEC2D2',
  citySky: '#96A0B4', citySky2: '#7C88A0', bld1: '#3E4A5E', bld2: '#2E384A', win: '#F2C36B',
  room1: '#5E5470', room2: '#4A4258', nightSky: '#2A3450',
  dream1: '#6A74C8', dream2: '#525CB0', dreamSea: '#4A54A0',
  dawnSky1: '#F8D98A', dawnSky2: '#F2AE62', dawnSea: '#4E7E9E', dawnSeaHi: '#7FAEC4',
};

// ---------- shared bits ----------

function skyFill(cTop, cBot, yHor) {
  paint(rectPts(-100, -100, W + 200, H + 200), { fill: cTop, fillOp: 255, bleed: .12, tex: .35, ink: null });
  paint(rectPts(-100, yHor - 320, W + 200, 420), { fill: cBot, fillOp: 200, bleed: .3, tex: .5, ink: null });
}

function seaBand(yHor, h, c, cHi, t, seed, waves) {
  paint(rectPts(-100, yHor, W + 200, h + 120), { fill: c, fillOp: 255, bleed: .15, tex: .4, ink: null });
  if (!waves) return;
  for (let r = 0; r < 6; r++) {
    boilSeed('sea' + seed + r);
    const y = yHor + 14 + r * (h - 20) / 6, ph = t * (.6 + r * .25) + r * 1.7;
    const P = [];
    for (let x = -60; x <= W + 60; x += 64) P.push([x, y + Math.sin(x * .013 + ph) * (3 + r) + jit(2.5)]);
    inkLine(P, .8, mixCol(cHi, '#FFFFFF', .1 + r * .06), 'ink', .8);
    if (r > 2 && hash(seed * 9 + r) > .4) {
      const fx = hash(seed * 5 + r) * W;
      inkLine([[fx, y + 2], [fx + 26 + jit(6), y + 2]], 2.2, mixCol('#FFFFFF', cHi, .5), 'ink', .6);
    }
  }
}

function sunGlow(x, y, r, col, a) { glow(x, y, r, col, a); paint(ellPts(x, y, r * .22, r * .22, 18), { wash: col, washOp: 240 * a, ink: null }); }

function cloudBlob(x, y, s, col, op, seed) {
  boilSeed('cl' + seed);
  const P = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU, r = 1 + .3 * Math.sin(3 * a + seed);
    P.push([x + Math.cos(a) * s * r * 1.7, y + Math.sin(a) * s * r * .62]);
  }
  paint(P, { fill: col, fillOp: op, bleed: .25, tex: .4, ink: null });
}

function gull(x, y, s, t, ph) {
  const w = Math.sin(t * 5 + ph) * .35;
  inkLine(through([[x - s, y - w * s], [x, y + s * .15], [x + s, y - w * s]], 4), 1.1, '#3A4454', 'ink', .8);
}

function rainFX(t, k, seed) {
  const n = Math.floor(125 * k);
  for (let i = 0; i < n; i++) {
    boilSeed('rn' + seed + i);
    const sp = 900 + hash(i + 3) * 600, x = hash(i) * (W + 200) - 100 + jit(4);
    const y = (frac(hash(i + 7) * 9 + t * sp / 1400) * (H + 340)) - 170;
    const len = 26 + hash(i + 11) * 18, slant = len * .30;
    paint(ribbon([[x, y], [x - slant, y + len]], 2.3, .9), { wash: '#DCEAF5', fill: '#DCEAF5', fillOp: 180, bleed: .02, tex: .05, ink: null, curv: .35 });
  }
}

function splashDrops(x, y, t0, t, n, s, col) {
  if (t < t0) return;
  const age = t - t0;
  for (let i = 0; i < n; i++) {
    boilSeed('sp' + i);
    const k = clamp(age / .5), a = hash(i * 3) * Math.PI - Math.PI / 2 - .4 + hash(i) * .8;
    const px = x + Math.cos(a) * age * (160 + hash(i + 2) * 120) * s / 40, py = y + Math.sin(a) * age * (220 + hash(i + 5) * 140) * s / 40 + age * age * 500;
    if (py > y + 8 || k >= 1) continue;
    paint(ellPts(px, py, 2.4 * s / 40 * (1 - k), 3 * s / 40 * (1 - k), 8), { wash: col, ink: null });
  }
}

function sandFore(y, c, cd, t) {
  const P = [];
  for (let x = -80; x <= W + 80; x += 90) P.push([x, y + Math.sin(x * .006 + 2) * 16 + jit(3)]);
  P.push([W + 120, H + 120], [-120, H + 120]);
  paint(P, { fill: c, fillOp: 255, bleed: .2, tex: .55, ink: null, curv: .8 });
  // a few darker wet patches
  for (let i = 0; i < 3; i++) {
    boilSeed('wet' + i);
    paint(ellPts(hash(i) * W, y + 40 + hash(i + 4) * 120, 90 + hash(i) * 80, 16, 14, 4), { fill: cd, fillOp: 90, bleed: .3, ink: null });
  }
}

function shell(cx, cy, u, rot, tipUp) {
  push(); translate(cx, cy); rotate(rot || 0);
  boilSeed('shell');
  // conch body: a plump drop
  paint(dropPts(0, 0, 1.1 * u, .8 * u, tipUp ? -Math.PI / 2 : 0), { wash: '#EFDDBB', ink: PAL.ink, sw: .55, curv: .9 });
  // spiral ridges
  inkLine(through([[.9 * u, 0], [.35 * u, -.42 * u], [-.35 * u, -.38 * u], [-.85 * u, -.08 * u]], 5), .45, '#B99B66', 'ink', .8);
  inkLine(through([[.8 * u, .3 * u], [.2 * u, -.05 * u], [-.5 * u, .05 * u], [-.85 * u, .3 * u]], 5), .45, '#B99B66', 'ink', .8);
  // tip
  paint(through([[-.7 * u, -.5 * u], [-1.25 * u, -.72 * u], [-1.05 * u, -.15 * u]], 4), { wash: '#EFDDBB', ink: PAL.ink, sw: .5, curv: .9 });
  pop();
}

function crab(cx, cy, u, t, ph, walk) {
  push(); translate(cx, cy); scale(1, 1);
  boilSeed('crab' + ph);
  const bob = walk ? Math.abs(Math.sin(t * 6 + ph)) * .12 * u : 0;
  // legs
  for (let i = -1; i <= 1; i += 2) for (let j = 0; j < 2; j++)
    inkLine([[i * .55 * u, -.3 * u + bob], [i * (1 + j * .35) * u, (j * .35 - .05) * u + (walk ? Math.sin(t * 8 + ph + i * 2 + j) * .1 * u : 0)]], .45, '#A8433A', 'ink', .5);
  // body + claws
  paint(ellPts(0, -.55 * u + bob, .95 * u, .62 * u, 14, 1), { wash: '#C4574A', ink: PAL.ink, sw: .55, curv: .9 });
  for (let i = -1; i <= 1; i += 2) {
    const cl = walk ? Math.sin(t * 5 + ph + i) * .18 : 0;
    paint(ellPts(i * 1.25 * u, -.8 * u + bob + cl * u, .34 * u, .26 * u, 10, 1), { wash: '#C4574A', ink: PAL.ink, sw: .5, curv: .9 });
    inkLine([[i * 1.25 * u - .12 * u, -.95 * u + bob + cl * u], [i * 1.25 * u + .12 * u, -.8 * u + bob + cl * u]], .4, PAL.ink, 'ink', .4);
  }
  // eyes
  paint(ellPts(-.3 * u, -.95 * u + bob, .1 * u, .2 * u, 8), { wash: '#C4574A', ink: PAL.ink, sw: .4, curv: .9 });
  paint(ellPts(.3 * u, -.95 * u + bob, .1 * u, .2 * u, 8), { wash: '#C4574A', ink: PAL.ink, sw: .4, curv: .9 });
  paint(ellPts(-.3 * u, -1.08 * u + bob, .05 * u, .05 * u, 6), { wash: PAL.ink, ink: null });
  paint(ellPts(.3 * u, -1.08 * u + bob, .05 * u, .05 * u, 6), { wash: PAL.ink, ink: null });
  pop();
}

// 半写实水彩老水手：V4。收敛轮廓、头颈领口连续，保留海风/雨中的连续呼吸与姿态。
// o: face('left'|'right'), pose('stand'|'point'|'wipe'|'brace'|'reach'|'row'|'walk'), point/wipe/reach/brace(0..1),
//    shout(0..1), lean(-1..1), walk(0..1), phase, sil(bool), coatFlap, chest(0..1)
function sailor(x, y, u, t, o = {}) {
  const f = (o.face === 'left') ? -1 : 1;
  const ph = o.phase || 0;
  const breath = Math.sin(t * 1.35 + ph);
  const wind = Math.sin(t * .48 + ph) * .5 + Math.sin(t * 1.19 + ph * 2.7) * .5;
  const sway = Math.sin(t * .74 + ph) * .016 + (o.lean || 0) * .065;
  const bob = o.walk !== undefined ? Math.abs(Math.sin(o.walk * TAU)) * .052 * u : breath * .026 * u;
  const pose = o.pose || (o.reach ? 'reach' : o.brace ? 'brace' : o.wipe ? 'wipe' : (o.point ? 'point' : 'stand'));
  const act = {
    point: clamp(o.point ?? (pose === 'point' ? 1 : 0)),
    wipe: clamp(o.wipe ?? (pose === 'wipe' ? 1 : 0)),
    brace: clamp(o.brace ?? (pose === 'brace' ? 1 : 0)),
    reach: clamp(o.reach ?? (pose === 'reach' ? 1 : 0)),
    walk: clamp(o.walk ?? (pose === 'walk' ? 1 : 0)),
    shout: clamp(o.shout ?? (pose === 'point' ? .62 : .16 + breath * .06)),
  };

  // 远景剪影：保留受风姿态，但用真实肩腰比例替代圆头简形。
  if (o.sil) {
    push(); translate(x, y); scale(f, 1); rotate(sway * .55);
    boilSeed('sailsilV4');
    paint(through([[-.48*u,-.32*u],[-.58*u,-1.42*u],[-.44*u,-2.55*u],[-.40*u,-3.36*u],[-.06*u,-3.68*u],[.30*u,-3.36*u],[.36*u,-2.48*u],[.30*u,-1.38*u],[.44*u,-.34*u],[.04*u,-.16*u]], 7), { wash:'#242D3B', fill:'#242D3B', fillOp:248, ink:null, curv:.86 });
    paint(ellPts(.06*u,-4.18*u,.33*u,.37*u,20), { wash:'#242D3B', fill:'#242D3B', fillOp:248, ink:null });
    paint(through([[-.54*u,-4.48*u],[-.02*u,-4.90*u],[.56*u,-4.56*u],[.86*u,-4.12*u],[.04*u,-4.28*u]],6), { wash:'#242D3B', fill:'#242D3B', fillOp:248, ink:null, curv:.88 });
    pop(); return;
  }

  push(); translate(x, y); scale(f, 1);

  // ---- legs / boots：下肢先定重心
  boilSeed('sailorLegsV4' + ph);
  const stride = act.walk ? Math.sin(o.walk * TAU) : Math.sin(t * .44 + ph) * .12;
  for (const [side, st] of [[-1, -stride], [1, stride]]) {
    const hx = side * .22 * u + st * .06 * u, hy = -1.72 * u + bob * .12;
    const kx = hx + side * .035 * u - st * .07 * u, ky = -.88 * u;
    const fx = hx + st * .14 * u, fy = -.03 * u;
    paint(ribbon(through([[hx, hy], [kx, ky], [fx, fy + .04*u]], 6), .215 * u, .175 * u), { wash:'#38444F', fill:'#38444F', fillOp:248, ink:'#252E36', sw:.40, bleed:.04, tex:.13, curv:.88 });
    paint(through([[fx-.22*u, fy+.03*u],[fx-.17*u, fy-.17*u],[fx+.12*u, fy-.22*u],[fx+.35*u, fy-.08*u],[fx+.30*u, fy+.06*u]], 5), { wash:'#332B24', fill:'#332B24', fillOp:252, ink:'#221B15', sw:.36, bleed:.05, tex:.14, curv:.92 });
    paint(ellPts(kx-.04*u, ky+.06*u, .10*u, .045*u, 10), { wash:'#D8E2EA', washOp:22, ink:null });
  }

  // ---- upper body
  push(); translate(0, -1.75 * u + bob * .18); rotate(sway); translate(0, 1.75 * u - bob * .18);
  const hipY=-1.75*u, waistY=-2.18*u, chestY=-2.95*u, shoulderY=-3.46*u, neckY=-3.75*u;
  const backShoulder=[-.56*u, shoulderY+.02*u], frontShoulder=[.57*u, shoulderY];

  // 姿态关键帧：肩/肘/腕三点，避免断臂。
  let bE=[-.56*u,-2.86*u], bH=[-.46*u,-2.30*u];
  let fE=[ .64*u,-2.90*u], fH=[ .48*u,-2.32*u];
  if(pose==='point'){ const k=act.point; bE=[-.58*u,-2.92*u]; bH=[-.46*u,-2.32*u];
    fE=[lerp(.64,.76,k)*u, lerp(-2.90,-3.72,k)*u]; fH=[lerp(.48,1.50,k)*u, lerp(-2.32,-4.26,k)*u]; }
  if(pose==='wipe'){ const k=act.wipe; bE=[-.56*u,-2.86*u]; bH=[-.44*u,-2.34*u];
    fE=[lerp(.64,.60,k)*u, lerp(-2.90,-3.66,k)*u]; fH=[lerp(.48,.19,k)*u, lerp(-2.32,-4.02,k)*u]; }
  if(pose==='brace'){ const k=act.brace; bE=[lerp(-.56,-.44,k)*u, lerp(-2.86,-3.14,k)*u]; bH=[lerp(-.46,-.16,k)*u, lerp(-2.30,-2.82,k)*u];
    fE=[lerp(.64,.74,k)*u, lerp(-2.90,-3.40,k)*u]; fH=[lerp(.48,1.04,k)*u, lerp(-2.32,-2.94,k)*u]; }
  if(pose==='reach'){ const k=act.reach; bE=[-.54*u,-2.92*u]; bH=[-.42*u,-2.40*u];
    fE=[lerp(.64,.84,k)*u, lerp(-2.90,-3.82,k)*u]; fH=[lerp(.48,1.74,k)*u, lerp(-2.32,-4.06,k)*u]; }
  if(pose==='row'){ bE=[-.46*u,-3.18*u]; bH=[-.05*u,-2.78*u]; fE=[.56*u,-3.20*u]; fH=[.13*u,-2.82*u]; }
  if(pose==='walk'){ const sw2=Math.sin(o.walk*TAU)*.17; bE=[-.58*u,-2.88*u+sw2*u*.18]; bH=[-.48*u+Math.sin(o.walk*TAU)*.11*u,-2.30*u-sw2*u*.08];
    fE=[.66*u,-2.88*u-sw2*u*.18]; fH=[.50*u-Math.sin(o.walk*TAU)*.11*u,-2.30*u+sw2*u*.08]; }

  function hand(h, s=1) {
    paint(ellPts(h[0], h[1], .115*u*s, .088*u*s, 12), { wash:'#C28B60', fill:'#C28B60', fillOp:250, ink:'#7E5335', sw:.24, bleed:.03, tex:.07, curv:.94 });
    for(let i=0;i<3;i++) inkLine([[h[0]-.035*u+i*.042*u, h[1]+.018*u], [h[0]-.052*u+i*.050*u, h[1]+.082*u]], Math.max(.8,.020*u), '#7E5335', 'ink', .38);
  }
  function arm(side, sx, sy, elbow, handPt, w=.155*u, col='#3C5B7A') {
    boilSeed('sailorArmV4' + side + ph);
    const c = side<0 ? mixCol(col,'#20344A',.25) : col;
    paint(ribbon(through([[sx, sy], elbow, handPt], 7), w, w*.74), { wash:c, fill:c, fillOp:252, ink:'#22314A', sw:.36, bleed:.04, tex:.10, curv:.84 });
    paint(ellPts(sx+side*.018*u, sy+.015*u, w*1.15, w*.82, 14), { wash:c, fill:c, fillOp:252, ink:'#22314A', sw:.24, curv:.90 });
    hand(handPt, side<0 ? .88 : 1);
  }

  // 后臂在躯干后面
  arm(-1, backShoulder[0], backShoulder[1], bE, bH, .145*u, '#3C5B7A');

  // 油布外套：肩宽收束到腰，长摆受风，不再是方形油桶。
  boilSeed('sailorTorsoV4' + ph);
  const coatFlap = ((o.coatFlap ?? .22) + wind*.075 + act.walk*.22 + act.brace*.09) * f;
  const hemB=hipY+.88*u, hemF=hipY+1.04*u;
  paint(through([
    [-.42*u+coatFlap*.38*u, hemB], [-.55*u+coatFlap*.22*u, hipY+.22*u], [-.54*u, waistY+.04*u],
    [-.64*u, chestY+.04*u], [-.62*u, shoulderY+.12*u], [-.18*u, neckY+.02*u], [.32*u, neckY+.02*u],
    [.60*u, shoulderY+.06*u], [.62*u, chestY+.10*u], [.50*u, waistY+.10*u], [.52*u, hipY+.24*u],
    [.68*u+coatFlap*.32*u, hemF], [.24*u+coatFlap*.48*u, hemF+.08*u], [-.06*u+coatFlap*.44*u, hemF+.02*u]
  ], 9), { wash:'#405F7F', fill:'#405F7F', fillOp:250, ink:'#22314A', sw:.48, bleed:.05, tex:.15, curv:.88 });
  // 背侧湿布阴影 + 正面受光，克制不糊
  paint(through([[-.54*u, waistY+.05*u], [-.64*u, chestY+.06*u], [-.60*u, shoulderY+.12*u], [-.34*u, chestY+.02*u], [-.30*u, waistY+.10*u], [-.34*u, hipY+.28*u]], 7), { wash:'#2F4A61', fill:'#2F4A61', fillOp:135, ink:null, curv:.82 });
  paint(through([[.42*u, chestY+.14*u], [.56*u, chestY+.22*u], [.44*u, waistY+.24*u], [.28*u, waistY+.17*u]], 6), { wash:'#6890B0', fillOp:0, washOp:38, ink:null, curv:.82 });
  // 黄铜扣与防水腰带
  paint(ribbon(through([[-.48*u, waistY+.16*u], [.04*u, waistY+.29*u], [.48*u, waistY+.15*u]], 6), .105*u, .085*u), { wash:'#D5AE58', fill:'#D5AE58', fillOp:246, ink:'#8B6A26', sw:.26, bleed:.04, tex:.08, curv:.84 });
  for(let i=0;i<3;i++) paint(ellPts((-.22+i*.25)*u, waistY+(.225-i*.012)*u, .042*u, .042*u, 10), { wash:'#EBCE7E', fill:'#EBCE7E', fillOp:250, ink:'#6C5220', sw:.14 });
  // 翻领/肩布
  paint(through([[-.54*u, shoulderY+.10*u], [-.10*u, neckY+.01*u], [.42*u, shoulderY+.02*u], [.16*u, chestY+.06*u], [-.32*u, chestY+.06*u]], 7), { wash:'#35536D', fill:'#35536D', fillOp:252, ink:'#22314A', sw:.28, curv:.90 });
  // 前臂与手
  arm(1, frontShoulder[0], frontShoulder[1], fE, fH, .165*u, '#405F7F');

  // ---- neck & head：先颈部，再面部；帽/须最后分层，避免颜色糊成一团。
  push(); translate(0, bob*.08); rotate(sway*.32 + breath*.004);
  boilSeed('sailorHeadV4' + ph);
  paint(ribbon(through([[-.04*u, neckY+.12*u], [.06*u, neckY-.18*u], [.18*u, neckY+.12*u]], 5), .125*u, .095*u), { wash:'#BE8258', fill:'#BE8258', fillOp:252, ink:null, curv:.72 });
  // 后发与鬓角
  paint(ellPts(-.07*u,-4.24*u,.36*u,.36*u,18), { wash:'#E6E0D1', fill:'#E6E0D1', fillOp:252, ink:null });
  // 头骨/脸颊：3/4 正面，轻微下颌角度
  paint(ellPts(.06*u,-4.22*u,.365*u,.375*u,24), { wash:'#D39A6E', fill:'#D39A6E', fillOp:252, ink:'#6B4128', sw:.28, bleed:.03, tex:.07, curv:.96 });
  paint(ellPts(.28*u,-4.10*u,.115*u,.095*u,14), { wash:'#B4744F', washOp:32, ink:null });
  paint(ellPts(-.08*u,-4.42*u,.135*u,.125*u,14), { wash:'#B4744F', washOp:18, ink:null });
  // 耳朵
  paint(ellPts(-.24*u,-4.18*u,.055*u,.072*u,12), { wash:'#C8855C', fill:'#C8855C', fillOp:250, ink:'#6B4128', sw:.16, curv:.90 });
  // 眉骨与皱纹
  paint(ribbon(through([[-.05*u,-4.48*u],[.05*u,-4.51*u],[.13*u,-4.48*u]],5), .032*u,.018*u), { wash:'#EDE6D8', fill:'#EDE6D8', fillOp:252, ink:null, curv:.60 });
  paint(ribbon(through([[.22*u,-4.50*u],[.31*u,-4.54*u],[.39*u,-4.48*u]],5), .032*u,.018*u), { wash:'#EDE6D8', fill:'#EDE6D8', fillOp:252, ink:null, curv:.60 });
  for(let i=0;i<2;i++) inkLine(through([[-.08*u,(-4.70+i*.048)*u],[.06*u,(-4.724+i*.048)*u],[.20*u,(-4.70+i*.048)*u]],5), Math.max(.8,.018*u), mixCol('#6B4128','#D39A6E',.62), 'ink', .40);
  // 眼窝、眼白、瞳孔、下睑
  for(const [ex,ew] of [[.01,.062],[.31,.058]]) {
    paint(ellPts(ex*u,-4.36*u,ew*1.22*u,ew*.70*u,14), { wash:'#A5613E', washOp:28, ink:null });
    paint(ellPts(ex*u,-4.36*u,ew*u,ew*.60*u,14), { wash:'#F6F2E9', fill:'#F6F2E9', fillOp:252, ink:null });
    paint(ellPts(ex*u+.010*u,-4.36*u,ew*.31*u,ew*.36*u,10), { wash:'#2D2C3A', fill:'#2D2C3A', fillOp:252, ink:null });
    paint(ellPts(ex*u+.022*u,-4.385*u,ew*.08*u,ew*.09*u,8), { wash:'#FFFFFF', fill:'#FFFFFF', fillOp:250, ink:null });
    inkLine(through([[(ex-.062)*u,(-4.30)*u],[(ex+.062)*u,(-4.292)*u]],4), Math.max(.7,.016*u), '#83502F', 'ink', .38);
  }
  // 鼻梁与鼻头
  paint(ribbon(through([[.17*u,-4.34*u],[.28*u,-4.14*u],[.34*u,-4.05*u]],5), .038*u,.052*u), { wash:'#C5825C', fill:'#C5825C', fillOp:252, ink:'#7A452B', sw:.14, curv:.64 });
  paint(ellPts(.34*u,-4.04*u,.035*u,.026*u,10), { wash:'#E9B58C', fill:'#E9B58C', fillOp:180, ink:null });
  // 短须：上唇与下巴分两笔，露出口型，不遮领口
  paint(through([[-.06*u,-3.96*u],[.12*u,-4.02*u],[.31*u,-3.96*u],[.32*u,-3.88*u],[.12*u,-3.83*u],[-.08*u,-3.87*u]],7), { wash:'#F2EDE3', fill:'#F2EDE3', fillOp:252, ink:'#A79F90', sw:.13, curv:.90 });
  paint(through([[-.14*u,-3.84*u],[.08*u,-3.90*u],[.30*u,-3.84*u],[.34*u,-3.66*u],[.10*u,-3.48*u],[-.14*u,-3.60*u],[-.19*u,-3.74*u]],8), { wash:'#E9E2D4', fill:'#E9E2D4', fillOp:250, ink:'#9C948A', sw:.16, curv:.92 });
  // 呼吸/呐喊口型
  const mo=.012*u + act.shout*.040*u + Math.sin(t*2.2+ph)*.003*u;
  paint(ellPts(.14*u,-3.92*u,.027*u + act.shout*.022*u, mo, 10), { wash:'#6C2F24', fill:'#6C2F24', fillOp:252, ink:'#4C2018', sw:.08 });
  // 帽下颈布/油布领：和短须末端自然重叠
  paint(through([[-.24*u,neckY+.20*u],[.04*u,neckY+.04*u],[.42*u,neckY+.20*u],[.18*u,neckY+.46*u],[-.10*u,neckY+.45*u]],6), { wash:'#D9CBA8', fill:'#D9CBA8', fillOp:252, ink:'#8B8063', sw:.18, curv:.90 });
  // sou'wester：后压檐 + 前檐，用两片构成，而不是一块三角布
  paint(through([[-.46*u,-4.48*u],[-.24*u,-4.82*u],[.14*u,-4.94*u],[.48*u,-4.74*u],[.60*u,-4.43*u],[.12*u,-4.56*u],[-.28*u,-4.50*u]],7), { wash:'#DFA92E', fill:'#DFA92E', fillOp:252, ink:'#8B5E11', sw:.30, bleed:.04, tex:.10, curv:.90 });
  paint(through([[-.70*u,-4.42*u],[-.14*u,-4.72*u],[.50*u,-4.54*u],[.88*u,-4.10*u],[.36*u,-4.28*u],[-.42*u,-4.35*u]],7), { wash:'#C08D1E', fill:'#C08D1E', fillOp:252, ink:'#7C540D', sw:.22, bleed:.04, tex:.11, curv:.88 });
  paint(through([[.05*u,-4.85*u],[.33*u,-4.72*u],[.51*u,-4.48*u]],5), { wash:'#F3D67C', washOp:72, ink:null, curv:.62 });
  pop(); // head
  pop(); // upper body
  pop();
}
function boat(x, y, u, t, rock, o = {}) {
  push(); translate(x, y); // boat owns its transform now, so callers keep theirs
  boilSeed('boat');
  // hull
  paint(through([[-2.2 * u, -.4 * u], [-1.6 * u, .5 * u], [1.6 * u, .5 * u], [2.4 * u, -.5 * u], [1.4 * u, -.6 * u], [-1.4 * u, -.7 * u]], 5), { wash: o.col || '#5E4632', ink: PAL.ink, sw: .6, curv: .85 });
  // mast + lantern
  inkLine([[0, -.6 * u], [0, -3.2 * u]], .35 * u * .5 + .3, '#4A3828', 'ink', .4);
  if (o.lantern) {
    glow(0, -3.35 * u, 1.6 * u, '#F2C36B', .5);
    paint(ellPts(0, -3.35 * u, .2 * u, .26 * u, 10), { wash: '#F2C36B', ink: PAL.ink, sw: .4, curv: .9 });
  }
  pop();
}
// ================= SHOTS A–L : childhood beach + storm choruses =================

// A 0–3 dusk beach wide, sand wind, Mini squints
function sA(t, lt, dur) {
  camBegin(960 + 14 * Math.sin(lt * .5), 545, 1 + .025 * lt);
  skyFill(SC.duskSky1, SC.duskSky2, 470);
  sunGlow(1420, 430, 300, '#F8D98A', .55);
  cloudBlob(300 + t * 8, 210, 60, '#F2D9A8', 130, 1);
  cloudBlob(1100 + t * 12, 150, 44, '#F2D9A8', 110, 2);
  gull(560, 240, 14, t, 1); gull(660, 210, 10, t, 2.4);
  seaBand(470, 190, SC.duskSea, SC.duskSeaHi, t, 1, true);
  sandFore(660, SC.sand, SC.sandDk, t);
  // wind-blown sand streaks
  for (let i = 0; i < 26; i++) {
    boilSeed('sa' + i);
    const y = 700 + hash(i) * 240, sp = 240 + hash(i + 3) * 260;
    const x = frac(hash(i + 7) * 9 + t * sp / 1900) * (W + 300) - 150;
    inkLine([[x, y], [x + 26 + jit(8), y + jit(3)]], 1.4, '#D8BC84', 'ink', .5);
  }
  const m = memotions(lt, [[0, 'bored', { lookX: .6 }], [1.6, 'scared', { lookX: .8 }]]);
  mini(1080, 880, 27, { ...m, view: 'q', rot: -.04 + Math.sin(t * 2.2) * .015, aL: -.5, aR: -.5 });
  camEnd();
  if (lt < .5) iris(960, 540, lerp(120, 2100, easeOut(lt / .5)), PAL.cream);
  if (lt > dur - .35) brushWipe((lt - (dur - .35)) / .7, [SC.sandDk, SC.duskSky2]);
}

// B 3–7 sand stings; memory bubble: father scolding silhouette
function sB(t, lt, dur) {
  camBegin(960, 540, 1.05);
  skyFill(SC.duskSky1, SC.duskSky2, 500);
  seaBand(500, 160, SC.duskSea, SC.duskSeaHi, t, 2, true);
  sandFore(680, SC.sand, SC.sandDk, t);
  for (let i = 0; i < 18; i++) {
    boilSeed('sb' + i);
    const y = 700 + hash(i) * 200, x = frac(hash(i + 2) * 7 + t * .3) * (W + 200) - 100;
    inkLine([[x, y], [x + 30 + jit(10), y + jit(4)]], 1.4, '#D8BC84', 'ink', .5);
  }
  const m = memotions(lt, [[0, 'scared'], [1.8, 'sad']]);
  mini(950, 900, 38, { ...m, view: 'q', aL: 1.15, aR: 1.15, sq: Math.sin(t * 5) * .02 }); // flippers up, shielding face
  // memory bubble drifts up-right
  const bk = easeOut(clamp((lt - 1.4) / .8));
  const bx = 1330, by = lerp(760, 470, bk);
  if (bk > 0) {
    boilSeed('bubB');
    paint(ellPts(bx, by, 200 * bk + 30, 150 * bk + 22, 22, 3), { fill: '#FBEED6', fillOp: 255 * bk, bleed: .2, tex: .3, ink: '#B99B66', sw: 1.1, curv: .9 });
    if (bk > .85) {
      boilSeed('dad');
      push(); translate(bx, by + 14); scale(1.15);
      paint(through([[-60, 60], [-50, -30], [0, -70], [50, -30], [60, 60]], 4), { wash: '#4A4258', ink: null, curv: .85 });
      paint(ellPts(0, -85, 30, 32, 12), { wash: '#4A4258', ink: null });
      inkLine([[20, -78], [85, -110]], 7, '#4A4258', 'ink', .5);          // pointing arm
      inkLine([[14, -96], [30, -84]], 5, '#4A4258', 'ink', .5);           // angry brow stroke
      pop();
    }
  }
  camEnd();
  if (lt < .3) brushWipe(.5 + lt / .7, [SC.sandDk, SC.duskSky2]);
  if (lt > dur - .3) iris(toScreen(1330, by)[0], toScreen(1330, by)[1], lerp(1400, 240, easeIn((lt - (dur - .3)) / .3)), PAL.cream);
}

// C 7–13 bubble: mother crying; drifts away and fades; Mini watches
function sC(t, lt, dur) {
  camBegin(960, 545, 1 + .01 * lt);
  skyFill(SC.duskSky1, SC.duskSky2, 490);
  seaBand(490, 170, SC.duskSea, SC.duskSeaHi, t, 3, true);
  sandFore(670, SC.sand, SC.sandDk, t);
  const fade = 1 - easeIn(clamp((lt - 4.2) / 1.8));
  const bx = 1290 + lt * 26, by = 470 - lt * 9;
  if (fade > 0) {
    boilSeed('bubC');
    paint(ellPts(bx, by, 190, 140, 22, 3), { fill: '#FBEED6', fillOp: 235 * fade, bleed: .2, tex: .3, ink: '#B99B66', sw: .8 * fade, curv: .9 });
    if (fade > .5) {
      boilSeed('mom');
      push(); translate(bx, by + 12); scale(.9); // mother silhouette dabbing eyes
      // Readable maternal silhouette: softer shoulders, A-line dress, bun, small handkerchief and visible tear.
      paint(through([[-58, 60], [-34, -22], [-18, -52], [0, -70], [18, -52], [34, -22], [58, 60]], 5), { wash: '#4A4258', ink: null, curv: .88 });
      paint(ellPts(0, -80, 24, 26, 18), { wash: '#4A4258', ink: null });
      paint(ellPts(-13, -96, 19, 18, 18), { wash: '#4A4258', ink: null });
      paint(ellPts(-31, -106, 10, 10, 14), { wash: '#4A4258', ink: null });
      paint(ellPts(12, -78, 5, 8, 10), { wash: '#8AC4E8', ink: null });
      paint(rectPts(-36, -95, 15, 11, 1), { wash: '#FBEED6', washOp: 235, ink: null });
      paint(ellPts(-26, -89, 7, 6, 10), { wash: '#4A4258', ink: null });
      pop();
      glow(bx - 14, by - 72, 26, '#8AC4E8', .4 * fade); // tear shine
    }
  }
  const m = memotions(lt, [[0, 'sad', { lookX: .9 }]]);
  mini(880, 905, 36, { ...m, view: 'q' });
  camEnd();
  if (lt > dur - .35) iris(toScreen(880, 760)[0], toScreen(880, 760)[1], lerp(1500, 200, easeIn((lt - (dur - .35)) / .35)), '#F3EBDC');
}

// D 13–16.5 alone on the rocks, hugging knees, looking at sea
function sD(t, lt, dur) {
  camBegin(960 + 10 * Math.sin(lt * .7), 540, 1.02);
  skyFill(SC.duskSky1, SC.duskSky2, 430);
  sunGlow(520, 380, 240, '#F8D98A', .5);
  gull(1300, 200, 12, t, .6); gull(1420, 240, 9, t, 2.9);
  seaBand(430, 240, SC.duskSea, SC.duskSeaHi, t, 4, true);
  sandFore(690, SC.sand, SC.sandDk, t);
  // rock Mini sits on
  boilSeed('rockD');
  paint(through([[700, 940], [760, 850], [900, 828], [1060, 856], [1130, 945]], 5), { wash: '#8E8276', ink: PAL.ink, sw: .6, curv: .9 });
  const m = memotions(lt, [[0, 'sad', { lookX: .5 }]]);
  mini(915, 850, 24, { ...m, view: 'q', aL: .9, aR: .9, dy: 0 }); // knees up (arms wrap)
  camEnd();
  if (lt < .3) iris(toScreen(915, 780)[0], toScreen(915, 780)[1], lerp(220, 1500, easeOut(lt / .3)), '#F3EBDC');
  if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [SC.duskSeaHi, SC.sand]);
}

// E 16.5–21 barefoot in the foam: steps in, wave chases, jumps, splashes, laughs
function sE(t, lt, dur) {
  camBegin(960, 560, 1.04 + .015 * Math.sin(lt));
  skyFill(SC.duskSky1, SC.duskSky2, 440);
  seaBand(440, 250, SC.duskSea, SC.duskSeaHi, t, 5, true);
  sandFore(700, SC.sand, SC.sandDk, t);
  // foam edge runs up the sand
  boilSeed('foamE');
  const fy = 760 - Math.sin(lt * 1.1) * 46;
  paint(through([[W + 80, fy + 30], [1150, fy - 6], [860, fy + 14], [560, fy - 10], [200, fy + 26], [-80, fy]], 5), { fill: '#CFE8EA', fillOp: 220, bleed: .25, ink: null, curv: .85 });
  const st = stroll(lt, .4, 3.2, 700, 1120, 26);
  const jp = jump(lt, 3.4, 4.05, 3.2);
  const hop2 = jump(lt, 4.6, 5.05, 1.4);
  const mood = memotions(lt, [[0, 'happy'], [3.35, 'surprised'], [4.1, 'happy'], [4.55, 'surprised'], [5.05, 'excited']]);
  mini(st.x + 60, 852, 27, { ...mood, view: st.view, flip: st.flip, walk: st.walk, dy: jp.dy + hop2.dy, sq: jp.sq + hop2.sq, aL: .4 + jp.dy * .06, aR: -.4 - jp.dy * .06,
    draw: (mu) => { for (const sx of [-.94, .94]) paint(ellPts(sx * mu, -.70 * mu, .44 * mu, .17 * mu, 16), { wash: '#F3EBDC', fill: '#F3EBDC', fillOp: 235, ink: PAL.ink, sw: .34, curv: .95 }); }
  });
  splashDrops(st.x + 60, 856, 3.62, lt, 8, 40, '#CFE8EA');
  splashDrops(st.x + 60, 856, 4.82, lt, 6, 30, '#CFE8EA');
  if (lt > 4.05 && lt < 4.3) sfx('!', st.x + 130, 700, 54, '#E8B23E', lt - 4.05);
  camEnd();
  if (lt < .25) brushWipe(.5 + lt / .5, [SC.duskSeaHi, SC.sand]);
  if (lt > dur - .3) iris(toScreen(st.x + 60, 740)[0], toScreen(st.x + 60, 740)[1], lerp(1500, 260, easeIn((lt - (dur - .3)) / .3)), '#FBEED6');
}

// F 21–25 gazing at the horizon; dream bubble: island + sail
function sF(t, lt, dur) {
  camBegin(960, 545, 1.03);
  skyFill(SC.duskSky1, SC.duskSky2, 450);
  sunGlow(1400, 420, 260, '#F8D98A', .5);
  seaBand(450, 220, SC.duskSea, SC.duskSeaHi, t, 6, true);
  sandFore(690, SC.sand, SC.sandDk, t);
  const m = memotions(lt, [[0, 'sad', { lookX: .8 }], [1.6, 'idea', { lookX: .9 }]]);
  mini(860, 900, 34, { ...m, view: 'q' });
  const bk = easeOut(clamp((lt - 1.5) / .9));
  if (bk > 0) {
    boilSeed('bubF');
    const bx = 1350, by = lerp(720, 420, bk);
    paint(ellPts(bx, by, 250 * bk + 20, 180 * bk + 16, 24, 3), { fill: '#FBEED6', fillOp: 255 * bk, bleed: .2, tex: .3, ink: '#B99B66', sw: 1.1, curv: .9 });
    if (bk > .9) {  // fantasy inside: floating island
      boilSeed('fanta');
      paint(ellPts(bx, by + 40, 148, 42, 18, 3), { wash: '#8FAE6B', ink: '#6B8A4E', sw: .6, curv: .9 });
      paint(through([[bx - 148, by + 46], [bx - 72, by + 108], [bx + 72, by + 108], [bx + 148, by + 46]], 4), { wash: '#B99B66', fillOp: 190, ink: null, curv: .85 });
      paint(ellPts(bx - 72, by + 16, 30, 16, 14), { wash: '#8FAE6B', ink: null });
      inkLine([[bx + 32, by + 40], [bx + 32, by - 24]], 3.2, '#6B4E32', 'ink', .4);
      paint(through([[bx + 32, by - 24], [bx + 112, by + 6], [bx + 32, by + 38]], 4), { wash: '#F2E2B8', ink: PAL.ink, sw: .5, curv: .8 });
      glow(bx - 18, by + 6, 52, '#F8D98A', .45);
    }
  }
  camEnd();
  if (lt > dur - .3) iris(toScreen(1350, 420)[0], toScreen(1350, 420)[1], lerp(1600, 130, easeIn((lt - (dur - .3)) / .3)), '#F8E8C8');
}

// G 25–29 inside the dream: heroic sailor on the bow, golden
function sG(t, lt, dur) {
  skyFill('#F2C98A', '#E89A55', 430);
  sunGlow(960, 360, 380, '#F8D98A', .6);
  cloudBlob(260 + t * 6, 180, 56, '#F8E2B0', 150, 3);
  cloudBlob(1500 - t * 8, 250, 64, '#F8E2B0', 140, 4);
  seaBand(430, 320, '#C87E4E', '#E8A86B', t, 7, true);
  push(); translate(0, Math.sin(t * 1.1) * 8);
  boat(900, 560, 120, t, 1, { col: '#6B4E32', lantern: true });
  sailor(900, 500, 95, t, { point: 1, face: 'right', rain: 0, wind: .38, coatFlap: .20 });
  pop();
  glow(900, 430, 200, '#F8D98A', .35);
  gull(500, 260, 16, t, 1.2); gull(620, 300, 12, t, 3.1);
  if (lt < .35) iris(960, 540, lerp(130, 2200, easeOut(lt / .35)), '#F8E8C8');
  if (lt > dur - .3) { // bubble pops: closing shaped iris
    const k = easeIn((lt - (dur - .3)) / .3);
    iris(960, 540, lerp(1600, 520, k), '#8FB8C4');
  }
}

// H 29–34.5 pop back to reality; crab pinches toe; panic hop
function sH(t, lt, dur) {
  camBegin(960, 560, 1.05 + .02 * Math.sin(lt * .8));
  skyFill(SC.duskSky1, SC.duskSky2, 470);
  seaBand(470, 200, SC.duskSea, SC.duskSeaHi, t, 8, true);
  sandFore(690, SC.sand, SC.sandDk, t);
  const pinchT = 1.6;
  const jp = jump(lt, pinchT, pinchT + .75, 4);
  const m = memotions(lt, [[0, 'happy'], [pinchT - .1, 'surprised'], [pinchT + .75, 'cry'], [3.4, 'sad']]);
  mini(980, 880, 34, { ...m, view: 'front', dy: jp.dy, sq: jp.sq, aL: 1.3 * clamp(jp.dy), aR: 1.3 * clamp(jp.dy), flip: Math.sin(lt * 9) > 0 });
  crab(905, 895, 20, t, 1, false);
  if (lt > pinchT && lt < pinchT + 1) sfx('!!', 1105, 715, 64, '#E8B23E', lt - pinchT);
  camEnd();
  if (lt < .3) irisShape(ellPts(960, 540, lerp(520, 1500, easeOut(lt / .3)), lerp(520, 1100, easeOut(lt / .3)), 24, 3), '#8FB8C4');
  if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [SC.sand, '#C98A5E']);
}

// I 34.5–40 crabs steal the shell; Mini slumps; the sailor watches from the lighthouse rock
function sI(t, lt, dur) {
  camBegin(960, 550, 1.03);
  skyFill('#EEB26B', '#D8834E', 450);
  seaBand(450, 210, '#3E6284', '#628CA8', t, 9, true);
  sandFore(680, '#E2BE88', '#B9945E', t);
  // lighthouse rock at right + sailor silhouette
  boilSeed('lhRock');
  paint(through([[1480, 700], [1560, 560], [1720, 545], [1880, 620], [1900, 760]], 5), { wash: '#7A6A5C', ink: PAL.ink, sw: .6, curv: .85 });
  boilSeed('lh');
  paint(rectPts(1665, 445, 46, 110, 2), { wash: '#E8E0D0', ink: PAL.ink, sw: .5 });
  paint(rectPts(1658, 425, 60, 26, 2), { wash: '#C4574A', ink: PAL.ink, sw: .5 });
  glow(1688, 462, 60, '#F2C36B', .55);
  sailor(1700, 548, 34, t, { sil: true, face: 'left' });
  // crabs carrying the shell away, leftward
  for (let i = 0; i < 3; i++) {
    const cx = 760 - lt * 34 - i * 90, cy = 830 + Math.sin(lt * 3 + i * 2) * 5 + i * 26;
    crab(cx, cy, 17 + i * 2, t, i, true);
  }
  const shx = 700 - lt * 34 + 60;
  shell(shx, 806, 26, .2, false);
  const m = memotions(lt, [[0, 'surprised'], [1.2, 'cry'], [2.6, 'sad', { lookX: .9 }]]);
  mini(1020, 890, 33, { ...m, view: 'q', aL: -.6, aR: -.6 });
  // sparkle of attention toward sailor at 3.2
  if (lt > 3.2) { boilSeed('glI'); glow(toScreen(1700, 545)[0], 545, 90, '#F2C36B', .3 * easeOut(clamp((lt - 3.2) / .8))); }
  camEnd();
  if (lt < .25) brushWipe(.5 + lt / .5, [SC.sand, '#C98A5E']);
  if (lt > dur - .35) iris(toScreen(1700, 500)[0], toScreen(1700, 500)[1], lerp(1600, 520, easeIn((lt - (dur - .35)) / .35)), '#2E3A50');
}

// J 40–50 chorus 1: storm sea, sailor shouts from the bow, Mini looks up from the deck
function sJ(t, lt, dur) {
  camBegin(960, 545 + Math.sin(t * 1.3) * 6, 1.04);
  skyFill(SC.stormSky1, SC.stormSky2, 400);
  cloudBlob(300, 150, 90, '#39445A', 200, 5); cloudBlob(1400, 190, 110, '#39445A', 210, 6);
  seaBand(400, 420, SC.stormSea, SC.stormSeaHi, t, 10, true);
  // big swells
  for (let r = 0; r < 2; r++) {
    boilSeed('swell' + r);
    const y = 620 + r * 180;
    paint(through([[W + 100, y], [1300, y - 60 - 40 * r], [700, y - 10], [100, y - 70], [-100, y - 20]], 5), { fill: mixCol(SC.stormSea, '#FFFFFF', .08), fillOp: 220, bleed: .2, ink: '#1E3244', sw: .8, curv: .85 });
  }
  push(); translate(760, 640 + Math.sin(t * 1.3) * 10); rotate(Math.sin(t * 1.3) * .05);
  boat(0, 40, 130, t, 1, { col: '#4A3828', lantern: true });
  sailor(0, -18, 92, t, { point: lt > 1 ? 1 : 0, face: 'right', rain: 1, wind: .82, coatFlap: .40 });
  glow(0, -80, 120, '#F2C36B', .4 + .2 * Math.sin(t * 2));
  pop();
  const m = memotions(lt, [[0, 'scared', { lookX: -.5 }], [2.4, 'sad', { lookX: -.5 }]]);
  mini(985, 628, 30, { ...m, view: 'q', dim: .12, boilKey: 'deckJ' });
  rainFX(t, 1, 1);
  const bolt = (lt > 2.5 && lt < 2.72) || (lt > 7.4 && lt < 7.6);
  if (bolt) flash(.5, '#EAF2F8');
  if (bolt) paint(ribbon(through([[500, 0], [560, 180], [520, 320], [600, 460]], 5), 7, 2), { wash: '#EAF2F8', fill: '#F7FFFF', fillOp: 250, ink: null, curv: .55 });
  camEnd();
  if (lt < .35) iris(1650, 520, lerp(520, 2300, easeOut(lt / .35)), '#2E3A50');
  if (lt > dur - .3 && lt < dur) {} // no out; K continues the storm (hard cut on the wave below)
}

// K 50–57 chorus 2: wave hits, sailor wipes his face, Mini copies
function sK(t, lt, dur) {
  camBegin(960, 550 + Math.sin(t * 1.4) * 8, 1.08);
  skyFill(SC.stormSky1, SC.stormSky2, 420);
  seaBand(420, 400, SC.stormSea, SC.stormSeaHi, t, 11, true);
  // one big wave crossing
  boilSeed('bigwave');
  const wx = lerp(W + 200, -300, lt / dur);
  paint(through([[wx - 300, 560], [wx - 100, 470], [wx + 120, 500], [wx + 320, 560]], 5), { fill: '#3E5E78', fillOp: 230, bleed: .2, ink: '#1E3244', sw: .9, curv: .85 });
  push(); translate(820, 660 + Math.sin(t * 1.4 + 1) * 12); rotate(Math.sin(t * 1.4 + 1) * .06);
  boat(0, 30, 140, t, 1, { col: '#4A3828' });
  sailor(0, -20, 96, t, { wipe: 1, face: 'right', rain: .72, wind: .64, coatFlap: .30 });
  pop();
  const wipeK = clamp((lt - 1.2) / .8);
  const m = memotions(lt, [[0, 'determined', { lookX: -.6 }]]);
  mini(1022, 648, 31, { ...m, view: 'front', aL: .3 + wipeK * 1.15, aR: .28, dim: .12, boilKey: 'deckK' });
  rainFX(t, .55, 2);
  camEnd();
  if (lt > dur - .3) {} // continue into L
}

// L 57–61 "why": Mini alone in the rain looks up; lightning; push-in
function sL(t, lt, dur) {
  const z = 1.05 + .18 * ease(clamp(lt / dur));
  camBegin(1330, 700, z);
  skyFill(SC.stormSky1, SC.stormSky2, 430);
  cloudBlob(400, 160, 100, '#39445A', 210, 7); cloudBlob(1500, 200, 90, '#39445A', 200, 8);
  seaBand(430, 400, SC.stormSea, SC.stormSeaHi, t, 12, true);
  paint(rectPts(-100, 780, W + 200, 320), { fill: '#4A3828', fillOp: 255, bleed: .15, ink: '#2E2418', sw: .8 });
  const m = memotions(lt, [[0, 'sad', { lookY: -1 }], [1.2, 'cry', { lookY: -1 }]]);
  mini(1330, 860, 40, { ...m, view: 'front', dim: .12, glowK: .4, boilKey: 'miniL' });
  if (lt > .8 && lt < 2.6) emote('?', 1330 + 90, 620, 64, easeOut((lt - .8) / .4), lt - .8);
  rainFX(t, .8, 3);
  if ((lt > 2.9 && lt < 3.12) || (lt > 3.5 && lt < 3.66)) flash(.55, '#EAF2F8');
  camEnd();
  if (lt > dur - .45) brushWipe((lt - (dur - .45)) / .9, ['#39445A', SC.citySky]);
}




// ================= SHOTS M–T : grown-up city, the dream, the dawn =================

// adult Mini add-ons via hooks
function tieHook(u, sw) {
  boilSeed('tie');
  paint(ellPts(0, -2.5 * u, .2 * u, .16 * u, 8), { wash: '#C4574A', ink: PAL.ink, sw: .4 });
  paint(through([[0, -2.45 * u], [-.26 * u, -1.5 * u], [0, -.75 * u], [.26 * u, -1.5 * u]], 4), { wash: '#C4574A', ink: PAL.ink, sw: .4, curv: .8 });
}
function briefHook(al, sw) {
  boilSeed('brief');
  paint(rrPts(al * .75, -.35 * al, .55 * al, .62 * al, .1 * al, 1), { wash: '#8A5A36', ink: PAL.ink, sw: .5 });
}
function maskHook(k, smile) {
  return (u, sw) => {
    boilSeed('mask');
    push(); scale(k, k);
    paint(ellPts(0, -5.05 * u, 1.75 * u, 1.6 * u, 18, 1.5), { wash: '#F2EFE6', ink: PAL.ink, sw: .6, curv: .95 });
    paint(ellPts(-.7 * u, -5.25 * u, .3 * u, .38 * u, 10), { wash: '#3A3444', ink: null });
    paint(ellPts(.7 * u, -5.25 * u, .3 * u, .38 * u, 10), { wash: '#3A3444', ink: null });
    inkLine(through([[-.45 * u, -4.35 * u], [0, -4.0 * u], [.45 * u, -4.35 * u]], 4), .5, PAL.ink, 'ink', .8);
    pop();
  };
}
function holeHook(k) {
  return (u, sw) => {
    boilSeed('hole');
    push(); scale(k, k);
    const P = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; const r = 1 + .18 * Math.sin(3 * a + 1); P.push([Math.cos(a) * .8 * u * r, -1.6 * u + Math.sin(a) * .6 * u * r]); }
    paint(P, { wash: '#241E30', ink: PAL.ink, sw: .5, curv: .9 });
    pop();
  };
}
function starHook(k) {
  return (u, sw) => {
    boilSeed('chestar');
    glow(0, -1.7 * u, 1.6 * u * k, '#F8D98A', .5 * k);
    paint(starPts(0, -1.7 * u, .5 * u * k, .45, 5), { wash: '#F8D98A', ink: PAL.ink, sw: .4, curv: .85 });
  };
}

// crowd silhouettes walking leftward (opposite to Mini)
function crowd(t, seed, y, n, speed, col, op) {
  for (let i = 0; i < n; i++) {
    boilSeed('cr' + seed + i);
    const u = 26 + hash(i + seed) * 22, x = frac(hash(i) * 7 - t * speed / 2100 - hash(i + 2) * .3) * (W + 400) - 200;
    const w = t * 4 + i;
    push(); translate(x, y); scale(.9 + hash(i + 5) * .25);
    paint(through([[-u * .55, 0], [-u * .45, -u * 1.5], [0, -u * 1.9], [u * .45, -u * 1.5], [u * .55, 0]], 5), { wash: col, washOp: op, ink: null, curv: .85 });
    paint(ellPts(0, -u * 2.15, u * .3, u * .32, 10), { wash: col, washOp: op, ink: null });
    inkLine([[0, -u * 1.2], [Math.sin(w) * u * .3, 0]], u * .09, col, 'ink', .4);
    inkLine([[0, -u * 1.2], [-Math.sin(w) * u * .3, 0]], u * .09, col, 'ink', .4);
    pop();
  }
}

// flying letters/envelopes blown leftward
function blownLetters(t, seed, n) {
  for (let i = 0; i < n; i++) {
    boilSeed('bl' + seed + i);
    const sp = 300 + hash(i) * 260, x = frac(hash(i + 3) * 8 - t * sp / 1900) * (W + 300) - 150;
    const y = 240 + hash(i + 6) * 260 + Math.sin(t * 3 + i) * 22, a = Math.sin(t * 2.6 + i * 2) * .3;
    push(); translate(x, y); rotate(a);
    paint(rectPts(-16, -11, 32, 22, 1), { wash: '#F2EFE6', ink: '#8A8274', sw: .5 });
    inkLine([[-16, -11], [0, 4], [16, -11]], .6, '#8A8274', 'ink', .5);
    pop();
  }
}

// M 61–75 grown-up city: crowd, blown letters, trampled postcard
function sM(t, lt, dur) {
  camBegin(960 + 12 * Math.sin(lt * .5), 560, 1.05);
  skyFill(SC.citySky, SC.citySky2, 480);
  // skyline
  for (let i = 0; i < 9; i++) {
    boilSeed('bld' + i);
    const bw = 150 + hash(i) * 140, bx = i * 230 - 80, bh = 260 + hash(i + 3) * 330;
    paint(rectPts(bx, 800 - bh, bw, bh + 60, 2), { wash: i % 2 ? SC.bld1 : SC.bld2, ink: '#222A38', sw: .5 });
    for (let w2 = 0; w2 < 6; w2++) if (hash(i * 9 + w2) > .55)
      paint(rectPts(bx + 18 + (w2 % 3) * 44, 800 - bh + 26 + Math.floor(w2 / 3) * 56, 22, 30, 1), { wash: SC.win, washOp: 200, ink: null });
  }
  paint(rectPts(-100, 790, W + 200, 320), { fill: '#6E7688', bleed: .1, ink: '#3A4252', sw: .7 }); // road
  crowd(t, 1, 900, 6, 240, '#2E384A', 235);
  crowd(t, 2, 1000, 5, 320, '#39445A', 245);
  blownLetters(t, 1, 7);
  // postcard falls onto Mini's path and is left behind under the crowd
  const pcT = 9.8, pk = clamp((lt - pcT) / .9);
  const st = stroll(lt, .3, dur - 1, 1250, 560, 30);
  if (pk > 0) {
    boilSeed('pc');
    const py = lerp(-60, 895, easeIn(pk));
    const px = lerp(1250, 560, ease(seg(pcT, .3, dur - 1))) + 35;
    push(); translate(px, py); rotate(.1 + pk * .1);
    paint(rectPts(-58, -40, 116, 80, 3), { wash: '#F2EFE6', fill: '#F2EFE6', fillOp: 245, ink: '#8A8274', sw: .6 });
    paint(rectPts(-48, -31, 96, 48, 2), { wash: SC.duskSky1, ink: null });
    paint(rectPts(-48, -6, 96, 23, 2), { wash: SC.duskSea, ink: null });
    paint(through([[-32, 17], [-21, -2], [-8, 17]], 4), { wash: '#C9A66B', ink: '#8A6A3E', sw: .5, curv: .8 }); // house
    paint(ellPts(26, -13, 6, 6, 8), { wash: '#4A4258', ink: null }); // two parents
    paint(ellPts(39, -10, 5, 5, 8), { wash: '#4A4258', ink: null });
    pop();
  }
  const m = memotions(lt, [[0, 'bored', { lookY: .4 }], [9.6, 'surprised', { lookY: .8 }], [11, 'bored', { lookY: .3 }]]);
  mini(st.x, 960, 30, { ...m, view: st.view, flip: st.flip, walk: st.walk, draw: tieHook, armR: briefHook, boilKey: 'adultM' });
  camEnd();
  if (lt < .3) brushWipe(.5 + lt / .6, ['#39445A', SC.citySky]);
  if (lt > dur - .3) {} // cut on the walk into N
}

// N 75–84 office cubicle: the mask goes on, the bow
function sN(t, lt, dur) {
  camBegin(960, 560, 1.02 + .02 * ease(clamp(lt / dur)));
  paint(rectPts(-100, -100, W + 200, H + 200), { fill: SC.room1, bleed: .1, ink: null });
  paint(rectPts(-100, -100, W + 200, 260), { fill: SC.room2, fillOp: 220, bleed: .2, ink: null }); // upper wall
  // cubicle walls + desk
  paint(rectPts(-100, 380, W + 200, 90, 3), { wash: '#8A8298', ink: '#5E5670', sw: .6 });
  paint(rectPts(300, 690, 900, 60, 3), { wash: '#A89CA8', ink: '#6E6480', sw: .6 });
  paint(rectPts(340, 750, 60, 180, 2), { wash: '#8A8298', ink: null });
  paint(rectPts(1100, 750, 60, 180, 2), { wash: '#8A8298', ink: null });
  // monitor with cold glow
  boilSeed('mon');
  paint(rectPts(560, 470, 380, 240, 6), { wash: '#2A2E3E', ink: '#1A1E28', sw: .7 });
  paint(rectPts(580, 490, 340, 190, 4), { wash: '#6E98B8', washOp: 255, ink: null });
  for (let i = 0; i < 5; i++) paint(rectPts(596, 505 + i * 34, 120 + hash(i) * 180, 14, 1), { wash: '#E8F2F8', washOp: 230, ink: null });
  glow(750, 585, 260, '#9AB8D8', .22);
  // client silhouette left
  boilSeed('client');
  push(); translate(180, 860);
  paint(through([[-70, 0], [-55, -120], [0, -170], [55, -120], [70, 0]], 5), { wash: '#2A2432', ink: null, curv: .85 });
  paint(ellPts(0, -195, 34, 36, 12), { wash: '#2A2432', ink: null });
  pop();
  // Mini behind the desk, types, then mask on, then bows
  const bowK = clamp((lt - 6.5) / 1.6), bow = Math.sin(clamp((lt - 6.5) / 1.6) * Math.PI) * .5;
  const maskK = easeOut(clamp((lt - 3.4) / .7));
  const m = memotions(lt, [[0, 'bored'], [3.3, 'idea'], [4.2, 'sad'], [6.4, 'neutral']]);
  const typing = lt < 3.2 ? Math.sin(t * 9) * .25 : 0;
  mini(900, 745, 30, { ...m, view: 'front', aL: .4 + typing, aR: .4 - typing, rot: bow * .35,
    draw: (u, sw) => { tieHook(u, sw); if (maskK > 0) maskHook(maskK, true)(u, sw); },
    boilKey: 'adultN', dim: .06 });
  camEnd();
  if (lt < .25) {} // continues from M visually (same walk cycle), fine
  if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [SC.room2, '#2A2438']);
}

// O 84–92 tiny trophy, then the hollow night street
function sO(t, lt, dur) {
  const half = 4.2;
  if (lt < half) { // office corner: raises the tiny trophy
    camBegin(960, 560, 1.06);
    paint(rectPts(-100, -100, W + 200, H + 200), { fill: SC.room1, bleed: .1, ink: null });
    paint(rectPts(-100, 700, W + 200, 420, 3), { wash: '#8A8298', ink: '#5E5670', sw: .6 });
    const m = memotions(lt, [[0, 'proud'], [2.4, 'sad']]);
    const droop = clamp((lt - 2.4) / 1.2);
    mini(930, 810, 46, { ...m, view: 'front', aR: 1.25 - droop * 1.0,
      armR: (al, sw) => {
        boilSeed('medal');
        const a = al * 1.8, gold = '#F2C36B';
        paint(ellPts(0, 0, .36 * a, .36 * a, 24), { wash: gold, fill: gold, fillOp: 240, ink: PAL.ink, sw: .45, curv: .98 });
        paint(starPts(0, 0, .24 * a, .45, 5), { wash: '#A8682A', fill: '#A8682A', fillOp: 225, ink: '#6E3E18', sw: .30, curv: .90 });
      },
      draw: tieHook, boilKey: 'adultO' });

    camEnd();
  } else { // night street with neon, the hollow chest
    const lt2 = lt - half;
    camBegin(960, 570, 1.05);
    skyFill('#1A2030', '#2A3448', 500);
    for (let i = 0; i < 7; i++) {
      boilSeed('nbld' + i);
      const bw = 170 + hash(i) * 160, bx = i * 300 - 150, bh = 300 + hash(i + 2) * 320;
      paint(rectPts(bx, 820 - bh, bw, bh + 60, 2), { wash: '#232C40', ink: '#141A28', sw: .5 });
    }
    // neon signs
    boilSeed('neon');
    paint(rectPts(240, 320, 90, 220, 8), { wash: '#E86A9A', washOp: 190, ink: null }); glow(285, 430, 190, '#E86A9A', .5);
    paint(rectPts(1450, 280, 80, 260, 8), { wash: '#5AC8B4', washOp: 190, ink: null }); glow(1490, 410, 180, '#5AC8B4', .45);
    paint(rectPts(-100, 800, W + 200, 320), { fill: '#232838', bleed: .08, ink: '#10141E', sw: .6 });
    crowd(t, 3, 980, 7, 300, '#1A2030', 130); // blurred passers-by
    rainFX(t, .4, 4);
    const m = memotions(lt2, [[0, 'sad', { lookY: .7 }]]);
    mini(960, 900, 36, { ...m, view: 'front', dim: .22, draw: (u, sw) => { tieHook(u, sw); holeHook(clamp(lt2 / .8))(u, sw); }, boilKey: 'adultO2' });
    camEnd();
    if (lt2 < .25) {} // hard cut under the wipe from N... actually O starts after wipe cover
    if (lt < half + .25 && lt > half) brushWipe(.5 + lt2 / .5, [SC.room2, '#2A2438']);
  }
  if (lt > dur - .3) iris(toScreen(960, 780)[0], toScreen(960, 780)[1], lerp(1600, 420, easeIn((lt - (dur - .3)) / .3)), '#241E30');
}

// P 92–98 the rented room: bottle, sleep
function sP(t, lt, dur) {
  camBegin(960, 570, 1.04);
  paint(rectPts(-100, -100, W + 200, H + 200), { fill: SC.room2, bleed: .12, ink: null });
  // window with city night
  boilSeed('winP');
  paint(rectPts(1180, 200, 420, 380, 6), { wash: SC.nightSky, ink: '#3A3450', sw: .8 });
  for (let i = 0; i < 14; i++) if (hash(i) > .4)
    paint(rectPts(1200 + hash(i + 1) * 370, 220 + hash(i + 2) * 330, 14, 18, 1), { wash: SC.win, washOp: 150 + jit(60), ink: null });
  inkLine([[1390, 200], [1390, 580]], .8, '#3A3450', 'ink', .4);
  glow(1260, 300, 120, '#E8A86B', .25);
  // bed
  boilSeed('bed');
  paint(rectPts(240, 700, 760, 200, 10), { wash: '#7A6A8A', ink: '#4A4058', sw: .7 });
  paint(ellPts(430, 700, 130, 40, 16, 4), { wash: '#E8E2D8', ink: '#B8B2A4', sw: .5, curv: .9 }); // pillow
  paint(through([[1000, 700], [1060, 640], [1150, 640], [1200, 700]], 4), { wash: '#5E5470', ink: '#3E3852', sw: .5, curv: .85 }); // bedpost
  // Mini on the bed edge, bottle, then slumps
  const slump = easeInOutFallback(clamp((lt - 4.4) / 1.4));
  const m = memotions(lt, [[0, 'sleepy'], [4.3, 'sleepy']]);
  mini(620, 715, 42, { ...m, view: 'front', dim: .18, rot: slump * .55, dy: -slump * .3,
    armR: (al, sw) => {
      boilSeed('bottle');
      const a = al * 1.7;
      const glass = '#5E8A5E';
      paint(ellPts(0, .02 * a, .38 * a, .48 * a, 20), { wash: glass, fill: glass, fillOp: 225, ink: PAL.ink, sw: .45, curv: .95 });
      paint(rrPts(-.17 * a, -.64 * a, .34 * a, .34 * a, .06 * a, .5), { wash: glass, fill: glass, fillOp: 225, ink: PAL.ink, sw: .40, curv: .95 });
      paint(rrPts(-.16 * a, -.84 * a, .32 * a, .15 * a, .04 * a, .3), { wash: '#3A4A3A', fill: '#3A4A3A', fillOp: 235, ink: PAL.ink, sw: .35, curv: .95 });
      paint(rrPts(-.26 * a, -.06 * a, .52 * a, .26 * a, .04 * a, .3), { wash: '#F2EFE6', fill: '#F2EFE6', fillOp: 225, ink: '#8A8274', sw: .30, curv: .95 });
      paint(ribbon([[-.22 * a, -.48 * a], [-.22 * a, .34 * a]], .06 * a, .03 * a), { wash: '#DFF2E8', fill: '#DFF2E8', fillOp: 190, ink: null, curv: .35 });
    },
    boilKey: 'adultP' });

  if (lt > 3.6 && lt < 5.8) emote('zzz', 700, 560, 54, 1, lt - 3.6);
  camEnd();
  if (lt < .3) iris(toScreen(960, 780)[0], toScreen(960, 780)[1], lerp(420, 2100, easeOut(lt / .3)), '#241E30');
  if (lt > dur - .4) { // the dream seeps in
    const k = easeIn((lt - (dur - .4)) / .4);
    irisShape(cloudPts(960, 540, lerp(1500, 120, k), lerp(1100, 90, k), 20, 6, 1), SC.dream1);
  }
}
function easeInOutFallback(k) { return k * k * (3 - 2 * k); }

// Q 98–104 the dream: the sailor walks on the waves, reaches out
function sQ(t, lt, dur) {
  camBegin(960, 550, 1.03 + .02 * Math.sin(lt * .6));
  skyFill(SC.dream1, SC.dream2, 460);
  for (let i = 0; i < 12; i++) { boilSeed('dst' + i); glow(hash(i) * W, 90 + hash(i + 4) * 280, 20, '#E8E8FF', .3 + .2 * Math.sin(t * 2 + i)); }
  seaBand(460, 380, SC.dreamSea, '#7A84D8', t, 20, true);
  glow(960, 300, 420, '#B8B0F0', .28);
  const sx = lerp(1560, 1150, ease(seg(lt, .5, dur - .6)));
  sailor(sx, 640 + Math.sin(t * 1.1) * 8, 62, t, { point: lt > dur - 1.4 ? 1 : 0, face: 'left', walk: true, rain: 0, wind: .32, coatFlap: .18 });
  glow(sx, 560, 150, '#F8D98A', .3);
  boilSeed('dcloudQ');
  paint(cloudPts(820, 892, 155, 44, 42, 0, 1, .038), { wash: '#B8B0F0', fill: '#B8B0F0', fillOp: 215, ink: '#7A74C0', sw: .6, curv: .98 });
  const m = memotions(lt, [[0, 'sleepy', { lookX: .8 }], [1.6, 'surprised', { lookX: .9 }], [3.4, 'cry', { lookX: .9 }]]);
  mini(820, 842, 40, { ...m, view: 'q', glowK: .5, boilKey: 'dreamMini' });
  camEnd();
  if (lt < .3) irisShape(cloudPts(960, 540, lerp(120, 1500, easeOut(lt / .3)), lerp(90, 1100, easeOut(lt / .3)), 20, 6, 1), SC.dream1);
}

// R 104–112 dream chorus: wipe the tears, the chest star lights
function sR(t, lt, dur) {
  camBegin(960, 550 + Math.sin(t * 1.2) * 6, 1.07);
  skyFill(SC.dream1, SC.dream2, 430);
  seaBand(430, 420, SC.dreamSea, '#7A84D8', t, 21, true);
  for (let r = 0; r < 2; r++) {
    boilSeed('dswell' + r);
    const y = 640 + r * 190;
    paint(through([[W + 100, y], [1300, y - 70], [700, y - 20], [100, y - 80], [-100, y - 30]], 5), { fill: mixCol(SC.dreamSea, '#FFFFFF', .08), fillOp: 210, ink: '#3A3E78', sw: .8, curv: .85 });
  }
  sailor(1180, 610, 74, t, { point: lt > 4 ? 1 : 0, face: 'left', rain: .35, wind: .50, coatFlap: .28 });
  glow(1180, 500, 170, '#F8D98A', .32);
  boilSeed('dcloudR');
  paint(cloudPts(800, 892, 165, 46, 44, 0, 2, .038), { wash: '#B8B0F0', fill: '#B8B0F0', fillOp: 215, ink: '#7A74C0', sw: .6, curv: .98 });
  const wipeK = clamp((lt - .6) / 1); const starK = easeOut(clamp((lt - 4.2) / 1.4));
  const m = memotions(lt, [[0, 'cry', { lookX: .6 }], [2.2, 'determined', { lookX: .6 }], [5.5, 'determined', { lookX: .8 }]]);
  mini(800, 822, 42, { ...m, view: 'front', aL: .4 + Math.sin(clamp(wipeK) * Math.PI) * 1.2, glowK: .6 + starK * .6,
    draw: starHook(starK), boilKey: 'dreamMini2' });
  if (starK > .1) glow(800, 700, 90 * starK, '#F8D98A', .4);
  rainFX(t, .3, 5);
  camEnd();
  if (lt > dur - .3) flash(easeIn((lt - (dur - .3)) / .3) * .9, '#EAF2F8');
}

// S 112–121 awake: throws the window open, faces the storm
function sS(t, lt, dur) {
  camBegin(960, 570, 1.05);
  paint(rectPts(-100, -100, W + 200, H + 200), { fill: '#3A3448', bleed: .12, ink: null });
  // window (big, center) + storm outside
  boilSeed('winS');
  paint(rectPts(430, 130, 1060, 640, 8), { wash: '#1E2838', ink: '#2E2840', sw: 1 });
  paint(rectPts(450, 150, 1020, 600, 6), { fill: SC.stormSky2, bleed: .1, ink: '#2E2840', sw: .8 });
  cloudBlob(700, 260, 80, '#39445A', 220, 9); cloudBlob(1250, 300, 95, '#39445A', 220, 10);
  seaBand(560, 190, SC.stormSea, SC.stormSeaHi, t, 30, true); // sea seen from the window
  rainFX(t, .8, 6);
  if ((lt > 7.4 && lt < 7.62)) { flash(.4, '#EAF2F8'); paint(ribbon(through([[800, 150], [860, 330], [820, 470], [900, 610]], 5), 7, 2), { wash: '#EAF2F8', fill: '#F7FFFF', fillOp: 250, ink: null, curv: .55 }); }
  // panes swing open at 4
  const openK = easeOut(clamp((lt - 4) / .7));
  for (const s of [-1, 1]) {
    boilSeed('pane' + s);
    push(); translate(960 + s * 510, 450); rotate(s * -1.9 * openK);
    paint(rectPts(s < 0 ? -510 : 0, -300, 510, 600, 4), { wash: '#E8E2D4', ink: '#6E6480', sw: .7 });
    pop();
  }
  // Mini: sits up (in bed until 3.2), runs and climbs to the sill, then faces the storm
  let mx = 500, walk, view = 'front', flip = false, my = 830, rotU = 0;
  if (lt < 3.2) { walk = undefined; mx = 500; my = 830; }
  else {
    const st = stroll(lt, 3.2, 4.4, 500, 960, 38), k = ease(seg(lt, 3.2, 4.4));
    mx = st.x; walk = st.walk; view = st.view; flip = st.flip; my = lerp(830, 762, k);
  }
  const m = memotions(lt, [[0, 'sleepy'], [1.2, 'surprised'], [3.2, 'determined'], [6.6, 'determined', { lookY: -0.2 }]]);
  const wipeK2 = clamp((lt - 6.6) / 1);
  mini(mx, my, 38, { ...m, view: view, flip: flip, walk: walk, dim: .1, glowK: .5,
    aL: .4 + Math.sin(clamp(wipeK2) * Math.PI) * 1.2, draw: tieHook, boilKey: 'adultS' });
  camEnd();
  if (lt < .3) flash(1 - easeIn(lt / .3), '#EAF2F8'); // in from the white flash of R
  if (lt > dur - .5) brushWipe((lt - (dur - .5)) / 1, ['#39445A', SC.dawnSky1]);
}

// T 121–127.8 dawn: footprints won't stay; the puddle holds the sea; iris out on the horizon
function sT(t, lt, dur) {
  camBegin(1060 + 10 * Math.sin(lt * .4), 700, 1.16);
  skyFill(SC.dawnSky1, SC.dawnSky2, 480);
  sunGlow(1500, 450, 340, '#F8D98A', .6);
  cloudBlob(420 + t * 5, 210, 60, '#F8E2B0', 150, 11);
  // wet street
  paint(rectPts(-100, 640, W + 200, 480), { fill: '#4A5060', bleed: .12, ink: '#2A3038', sw: .7 });
  for (let i = 0; i < 8; i++) { boilSeed('shine' + i); inkLine([[hash(i) * W, 680 + hash(i + 3) * 320], [hash(i) * W + 90 + jit(30), 690 + hash(i + 3) * 320]], 2, mixCol('#C8D4E0', SC.dawnSky1, .4), 'ink', .8); }
  // footprints behind Mini fade out — the asphalt is too hard
  const mx = lerp(560, 1120, ease(seg(lt, .2, 3.6)));
  for (let i = 0; i < 5; i++) {
    boilSeed('print' + i);
    const px = mx - 80 - i * 66, k = clamp(1 - i * .3);
    if (px > 60) paint(ellPts(px, 985 + (i % 2) * 30, 18 * k, 9 * k, 8), { wash: '#3A404E', washOp: 150 * k, ink: null });
  }
  // the puddle: a clean sea reflects in it
  boilSeed('puddle');
  paint(ellPts(1180, 950, 340, 125, 26, 3), { fill: SC.dawnSea, ink: '#3A5E78', sw: .8, curv: .95 });
  paint(ellPts(1180, 978, 315, 92, 22, 3), { fill: SC.dawnSky2, fillOp: 180, ink: null });
  paint(ellPts(1180, 922, 285, 64, 20, 2), { fill: SC.dawnSky1, fillOp: 220, ink: null });
  sunGlow(1270, 945, 90, '#F8D98A', .5);
  boat(1090, 948, 18, t, 0, { col: '#5E4632' });
  for (let i = 0; i < 3; i++) inkLine([[1010 + i * 70, 960 + i * 9], [1080 + i * 70, 960 + i * 9]], 1.3, '#E8F2F0', 'ink', .7);
  // Mini walks, stops, crouches, holds up the shell
  const stopK = seg(lt, 3.4, 4);
  const st = stroll(lt, .2, 3.6, 460, 940, 36);
  const crouch = Math.sin(clamp(seg(lt, 4.2, 5)) * Math.PI) * .5;
  const m = memotions(lt, [[0, 'sad'], [4, 'surprised', { lookY: .9 }], [5, 'love', { lookY: .9 }], [6.2, 'determined', { lookY: -.4 }]]);
  mini(st.x, 985, 36, { ...m, view: lt < 4.6 ? st.view : 'front', flip: st.flip, walk: lt < 3.6 ? st.walk : undefined,
    dy: -crouch * .8, sq: crouch * .3, dim: 0,
    aR: lt > 5 ? 1.3 : 0, armR: lt > 5 ? (al, sw) => { boilSeed('dawnshell'); shell(al * 1.15, 0, al * .68, -.4, true); glow(al * .7, 0, al * .8, '#F8D98A', .25); } : undefined,
    draw: tieHook, boilKey: 'dawnMini' });
  camEnd();
  if (lt < .3) brushWipe(.5 + lt / .6, ['#39445A', SC.dawnSky1]);
  // iris out on the horizon
  if (lt > dur - 1.3) iris(1470, 500, lerp(2200, 0, easeIn((lt - (dur - 1.3)) / 1.3)), PAL.cream);
}

// ================= timeline =================
shots([
  [0, sA], [3, sB], [7, sC], [13, sD], [16.5, sE], [21, sF], [25, sG], [29, sH], [34.5, sI],
  [40, sJ], [50, sK], [57, sL], [61, sM], [75, sN], [84, sO], [92, sP], [98, sQ],
  [104, sR], [112, sS], [121, sT],
]);
})();
