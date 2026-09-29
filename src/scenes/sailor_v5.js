// sailor_v5.js — 《水手》半写实水彩老水手 V5。
// 保持水彩/手绘边缘与纸纹，但强化：
//   1) 真实七头身重心与骨相；2) 风霜面部、皱纹、眼袋、鼻和须发；
//   3) 油布外套的接缝、腰带、袖口、下摆；4) 雨水/海风的连续微运动。
// 本文件在 shuishou.js 之后加载，用同名 sailor() 覆盖 V4；删除这一行即可回滚。

function sailor(x, y, u, t, o = {}) {
  const f = (o.face === 'left') ? -1 : 1;
  const ph = o.phase || 0;
  const poseRaw = o.pose || (o.reach ? 'reach' : o.brace ? 'brace' : o.wipe ? 'wipe' : o.point ? 'point' : o.walk !== undefined ? 'walk' : 'stand');
  const breath = Math.sin(t * 1.28 + ph);
  const breath2 = Math.sin(t * 2.17 + ph * 1.7);
  const wind = Math.sin(t * .47 + ph) * .55 + Math.sin(t * 1.17 + ph * 2.3) * .35 + Math.sin(t * 2.71 + ph * 4.1) * .10;
  const rainK = clamp(o.rain ?? 0);
  const windK = clamp(o.wind ?? (.38 + rainK * .42 + (poseRaw === 'brace' ? .26 : 0)));
  const sway = Math.sin(t * .72 + ph) * .012 + wind * .011 * windK + (o.lean || 0) * .058;
  const walkP = o.walk !== undefined ? o.walk : (t * .46 + ph) % 1;
  const bob = poseRaw === 'walk' ? Math.abs(Math.sin(walkP * TAU)) * .055 * u : breath * .024 * u + breath2 * .003 * u;
  const act = {
    point: clamp(o.point ?? (poseRaw === 'point' ? 1 : 0)),
    wipe: clamp(o.wipe ?? (poseRaw === 'wipe' ? 1 : 0)),
    brace: clamp(o.brace ?? (poseRaw === 'brace' ? 1 : 0)),
    reach: clamp(o.reach ?? (poseRaw === 'reach' ? 1 : 0)),
    walk: clamp(o.walk ?? (poseRaw === 'walk' ? 1 : 0)),
    shout: clamp(o.shout ?? (poseRaw === 'point' ? .64 : .15 + breath * .05)),
  };

  // ---------- 远景剪影：仍保留受风站姿，但身体结构更接近真人 ----------
  if (o.sil) {
    push(); translate(x, y); scale(f, 1); rotate(sway * .62);
    boilSeed('sailorSilV5' + ph);
    const sc = '#26303F';
    // 裤腿与靴子
    for (const [side, st] of [[-1, Math.sin(walkP * TAU + Math.PI) * .05], [1, Math.sin(walkP * TAU) * .05]])
      paint(ribbon(through([[side * .19 * u, -1.70 * u], [side * .22 * u + st * .06 * u, -.86 * u], [side * .21 * u + st * .15 * u, -.08 * u]], 5), .20 * u, .14 * u), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .84 });
    // 外套躯干：肩胸宽、腰腹收窄、下摆被风掀起
    const silFlap = (.16 + windK * .13 + wind * .04) * f;
    paint(through([
      [-.50 * u + silFlap * .20 * u, -.46 * u], [-.52 * u + silFlap * .13 * u, -1.42 * u], [-.44 * u, -2.44 * u],
      [-.56 * u, -3.34 * u], [-.08 * u, -3.68 * u], [.40 * u, -3.50 * u], [.48 * u, -2.52 * u],
      [.42 * u, -1.46 * u], [.58 * u + silFlap * .27 * u, -.36 * u], [.12 * u + silFlap * .40 * u, -.24 * u]
    ], 9), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .88 });
    // 后臂贴近体侧，前臂随姿态有一点动作
    paint(ribbon(through([[-.52 * u, -3.32 * u], [-.66 * u, -2.76 * u], [-.52 * u, -2.28 * u]], 5), .14 * u, .09 * u), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .84 });
    paint(ribbon(through([[.50 * u, -3.34 * u], [.68 * u, -2.82 * u], [.60 * u, -2.34 * u]], 5), .14 * u, .09 * u), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .84 });
    // 头颈与 sou'wester 宽檐
    paint(ribbon([[.02 * u, -3.58 * u], [.04 * u, -3.84 * u]], .13 * u, .10 * u), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .40 });
    paint(ellPts(.04 * u, -4.14 * u, .30 * u, .33 * u, 18), { wash: sc, fill: sc, fillOp: 250, ink: null });
    paint(through([[-.62 * u, -4.16 * u], [-.24 * u, -4.54 * u], [.24 * u, -4.58 * u], [.64 * u, -4.34 * u], [.80 * u, -3.98 * u], [.22 * u, -4.06 * u], [-.34 * u, -3.98 * u]], 7), { wash: sc, fill: sc, fillOp: 250, ink: null, curv: .90 });
    pop(); return;
  }

  push(); translate(x, y); scale(f, 1);

  // ---------- 下肢：骨盆、膝盖、靴筒和受风重心 ----------
  boilSeed('sailorLegsV5' + ph);
  const stride = act.walk ? Math.sin(walkP * TAU) : Math.sin(t * .43 + ph) * .10;
  const weightShift = Math.sin(t * .34 + ph) * .018 * u + (o.lean || 0) * .045 * u;
  // 骨盆/防水裤臀
  paint(through([[-.42 * u + weightShift, -1.44 * u], [-.46 * u + weightShift, -1.78 * u], [-.20 * u, -1.96 * u], [.24 * u, -1.94 * u], [.47 * u + weightShift, -1.74 * u], [.43 * u + weightShift, -1.40 * u], [.02 * u, -1.28 * u]], 7), { wash: '#39454F', fill: '#39454F', fillOp: 250, ink: '#222A31', sw: .34, bleed: .05, tex: .14, curv: .88 });
  for (const [side, st] of [[-1, -stride], [1, stride]]) {
    const hx = side * .21 * u + st * .055 * u + weightShift * .55, hy = -1.72 * u + bob * .14;
    const kx = hx + side * .028 * u - st * .075 * u, ky = -.86 * u + (act.walk ? Math.abs(st) * .016 * u : 0);
    const ax = hx + st * .115 * u, ay = -.30 * u;
    const fx = hx + st * .145 * u, fy = -.03 * u;
    const trouser = side < 0 ? '#303A43' : '#39454F';
    paint(ribbon(through([[hx, hy], [kx, ky], [ax, ay], [fx, fy + .10 * u]], 8), .215 * u, .155 * u), { wash: trouser, fill: trouser, fillOp: 250, ink: '#20272E', sw: .34, bleed: .04, tex: .13, curv: .88 });
    // 膝部弯折与裤脚湿痕
    inkLine(through([[kx - .12 * u, ky - .03 * u], [kx + .05 * u, ky + .02 * u], [kx + .13 * u, ky + .08 * u]], 4), Math.max(.7, .018 * u), '#1F262C', 'ink', .40);
    paint(ellPts(fx, fy + .11 * u, .19 * u, .035 * u, 10), { wash: '#5B6D76', washOp: rainK * 38 + 14, ink: null });
    // 短靴：鞋跟、鞋头、防水鞋口
    paint(through([[fx - .21 * u, fy + .03 * u], [fx - .20 * u, fy - .20 * u], [fx - .04 * u, fy - .26 * u], [fx + .16 * u, fy - .23 * u], [fx + .35 * u, fy - .08 * u], [fx + .38 * u, fy + .06 * u], [fx + .18 * u, fy + .10 * u], [fx - .10 * u, fy + .10 * u]], 8), { wash: '#332A22', fill: '#332A22', fillOp: 252, ink: '#1F1812', sw: .30, bleed: .05, tex: .14, curv: .92 });
    paint(ellPts(fx + .02 * u, fy - .24 * u, .17 * u, .035 * u, 10), { wash: '#443829', fill: '#443829', fillOp: 245, ink: '#241C15', sw: .20, curv: .88 });
    inkLine([[fx - .19 * u, fy + .05 * u], [fx + .36 * u, fy + .05 * u]], Math.max(.9, .025 * u), '#1A140F', 'ink', .30);
    // 靴面高光与雨水
    paint(through([[fx - .13 * u, fy - .16 * u], [fx + .03 * u, fy - .19 * u], [fx + .14 * u, fy - .12 * u]], 4), { wash: '#69543D', washOp: 42 + rainK * 22, ink: null, curv: .66 });
  }

  // ---------- 躯干：绕骨盆的呼吸/受风摆动 ----------
  push(); translate(0, -1.74 * u + bob * .20); rotate(sway); translate(0, 1.74 * u - bob * .20);
  const hipY = -1.74 * u, waistY = -2.20 * u, chestY = -2.94 * u, shoulderY = -3.46 * u, neckY = -3.74 * u;
  const backShoulder = [-.55 * u, shoulderY + .04 * u], frontShoulder = [.56 * u, shoulderY];

  // 姿态：肩-肘-腕三点，保留肘部弯折和手腕随呼吸的微调。
  let bE = [-.58 * u, -2.88 * u], bH = [-.45 * u, -2.30 * u];
  let fE = [.68 * u, -2.94 * u], fH = [.47 * u, -2.32 * u];
  let headTilt = breath * .008;
  if (poseRaw === 'point') {
    const k = act.point;
    bE = [-.62 * u, -2.94 * u]; bH = [-.43 * u, -2.34 * u];
    fE = [lerp(.68, .93, k) * u, lerp(-2.94, -3.70, k) * u + breath2 * .006 * u];
    fH = [lerp(.47, 1.72, k) * u, lerp(-2.32, -3.93, k) * u + Math.sin(t * 1.9 + ph) * .014 * u];
    headTilt += .045 * k; swayLocalExtra(sway * .22 * k);
  }
  if (poseRaw === 'wipe') {
    const k = act.wipe;
    bE = [-.58 * u, -2.86 * u]; bH = [-.43 * u, -2.34 * u];
    fE = [lerp(.68, .58, k) * u, lerp(-2.94, -3.58, k) * u];
    fH = [lerp(.47, .15, k) * u, lerp(-2.32, -4.19, k) * u + Math.sin(t * 3.2 + ph) * .012 * u];
    headTilt -= .055 * k;
  }
  if (poseRaw === 'brace') {
    const k = act.brace;
    bE = [lerp(-.58, -.46, k) * u, lerp(-2.88, -3.18, k) * u]; bH = [lerp(-.45, -.16, k) * u, lerp(-2.30, -2.84, k) * u];
    fE = [lerp(.68, .82, k) * u, lerp(-2.94, -3.36, k) * u]; fH = [lerp(.47, 1.06, k) * u, lerp(-2.32, -2.92, k) * u];
    headTilt += .028 * k;
  }
  if (poseRaw === 'reach') {
    const k = act.reach;
    bE = [-.56 * u, -2.92 * u]; bH = [-.43 * u, -2.38 * u];
    fE = [lerp(.68, .86, k) * u, lerp(-2.94, -3.80, k) * u]; fH = [lerp(.47, 1.76, k) * u, lerp(-2.32, -4.00, k) * u];
    headTilt += .035 * k;
  }
  if (poseRaw === 'row') {
    bE = [-.46 * u, -3.18 * u]; bH = [-.06 * u, -2.76 * u];
    fE = [.58 * u, -3.20 * u]; fH = [.14 * u, -2.80 * u];
  }
  if (poseRaw === 'walk') {
    const sw2 = Math.sin(walkP * TAU) * .17;
    bE = [-.58 * u, -2.88 * u + sw2 * u * .18];
    bH = [-.47 * u + Math.sin(walkP * TAU) * .12 * u, -2.30 * u - sw2 * u * .08];
    fE = [.66 * u, -2.88 * u - sw2 * u * .18];
    fH = [.49 * u - Math.sin(walkP * TAU) * .11 * u, -2.30 * u + sw2 * u * .08];
  }

  function hand(h, s = 1) {
    paint(ellPts(h[0], h[1], .112 * u * s, .084 * u * s, 12), { wash: '#C08A5C', fill: '#C08A5C', fillOp: 250, ink: '#77492C', sw: .20, bleed: .03, tex: .08, curv: .94 });
    for (let i = 0; i < 3; i++) inkLine(through([[h[0] - .030 * u + i * .042 * u, h[1] + .015 * u], [h[0] - .048 * u + i * .051 * u, h[1] + .078 * u - i * .005 * u]], 3), Math.max(.65, .018 * u), '#77492C', 'ink', .36);
    paint(ellPts(h[0] - .012 * u, h[1] - .026 * u, .048 * u, .025 * u, 9), { wash: '#E2B184', washOp: 48, ink: null });
  }
  function arm(side, sx, sy, elbow, handPt, w = .155 * u, col = '#41607F') {
    boilSeed('sailorArmV5' + side + ph);
    const c = side < 0 ? mixCol(col, '#22394F', .28) : col;
    paint(ribbon(through([[sx, sy], elbow, handPt], 8), w, w * .70), { wash: c, fill: c, fillOp: 252, ink: '#22303F', sw: .32, bleed: .04, tex: .11, curv: .86 });
    // 肩袖、袖口与布褶
    paint(ellPts(sx + side * .018 * u, sy + .012 * u, w * 1.12, w * .82, 14), { wash: c, fill: c, fillOp: 252, ink: '#22303F', sw: .22, curv: .90 });
    const cuff = [lerp(sx, handPt[0], .82), lerp(sy, handPt[1], .82)];
    paint(ribbon(through([[cuff[0] - .035 * u, cuff[1] - .055 * u], [cuff[0] + .015 * u, cuff[1] + .010 * u], [cuff[0] - .010 * u, cuff[1] + .062 * u]], 4), w * .82, w * .70), { wash: mixCol(c, '#18242F', .34), fill: mixCol(c, '#18242F', .34), fillOp: 245, ink: '#1D2732', sw: .18, curv: .82 });
    inkLine(through([[sx + side * .01 * u, sy + w * .4], [lerp(sx, elbow[0], .55), lerp(sy, elbow[1], .55) + w * .22], [lerp(elbow[0], handPt[0], .48), lerp(elbow[1], handPt[1], .48) + w * .16]], 5), Math.max(.65, .017 * u), '#1C2835', 'ink', .48);
    hand(handPt, side < 0 ? .88 : 1);
  }

  // 后臂在躯干后面
  arm(-1, backShoulder[0], backShoulder[1], bE, bH, .145 * u, '#3D5B79');

  // ---------- 油布外套：结构化剪裁与受风布料 ----------
  boilSeed('sailorCoatV5' + ph);
  const coatFlap = ((o.coatFlap ?? .18) + wind * .072 * windK + act.walk * .20 + act.brace * .07) * f;
  const hemB = hipY + .70 * u, hemF = hipY + .84 * u;
  // 主外套：肩宽、腰收、开衩摆
  paint(through([
    [-.44 * u + coatFlap * .40 * u, hemB], [-.55 * u + coatFlap * .24 * u, hipY + .22 * u], [-.55 * u, waistY + .04 * u],
    [-.64 * u, chestY + .02 * u], [-.62 * u, shoulderY + .12 * u], [-.18 * u, neckY + .00 * u], [.32 * u, neckY + .00 * u],
    [.60 * u, shoulderY + .04 * u], [.63 * u, chestY + .08 * u], [.51 * u, waistY + .10 * u], [.53 * u, hipY + .24 * u],
    [.70 * u + coatFlap * .36 * u, hemF], [.24 * u + coatFlap * .52 * u, hemF + .10 * u], [-.06 * u + coatFlap * .47 * u, hemF + .04 * u]
  ], 10), { wash: '#406081', fill: '#406081', fillOp: 250, ink: '#22303F', sw: .42, bleed: .05, tex: .16, curv: .88 });
  // 后侧湿布阴影
  paint(through([[-.56 * u, waistY + .06 * u], [-.64 * u, chestY + .05 * u], [-.60 * u, shoulderY + .13 * u], [-.35 * u, chestY + .02 * u], [-.31 * u, waistY + .10 * u], [-.36 * u, hipY + .30 * u]], 7), { wash: '#2C4861', fillOp: 0, washOp: 118, ink: null, curv: .82 });
  // 前胸受光与肩部雨水高光
  paint(through([[.30 * u, chestY + .18 * u], [.56 * u, chestY + .28 * u], [.46 * u, waistY + .26 * u], [.22 * u, waistY + .17 * u]], 6), { wash: '#7198B7', washOp: 38 + rainK * 20, ink: null, curv: .82 });
  paint(through([[-.46 * u, shoulderY + .10 * u], [-.10 * u, shoulderY + .18 * u], [.28 * u, shoulderY + .08 * u]], 5), { wash: '#8CA9C2', washOp: 22 + rainK * 28, ink: null, curv: .58 });
  // 胸前挡风片/双排接缝
  paint(through([[-.06 * u, neckY + .02 * u], [.24 * u, chestY + .08 * u], [.18 * u, waistY + .26 * u], [-.10 * u, hipY + .38 * u], [-.30 * u, hipY + .20 * u], [-.22 * u, chestY + .04 * u]], 7), { wash: '#34516C', fillOp: 0, washOp: 88, ink: '#23323F', sw: .18, curv: .84 });
  inkLine(through([[-.08 * u, neckY + .10 * u], [.10 * u, chestY + .12 * u], [.08 * u, waistY + .20 * u]], 5), Math.max(.55, .014 * u), mixCol('#24333F', '#41607F', .34), 'ink', .44);
  inkLine(through([[-.58 * u, chestY + .04 * u], [-.52 * u, waistY + .08 * u], [-.46 * u + coatFlap * .12 * u, hipY + .32 * u]], 5), Math.max(.6, .016 * u), mixCol('#24333F', '#406081', .28), 'ink', .42);
  // 布褶：腰腹、下摆，方向随风
  for (let i = 0; i < 2; i++) {
    const yy = waistY + .24 * u + i * .46 * u, ff = coatFlap * (.34 + i * .20);
    inkLine(through([[-.30 * u + ff * .18 * u, yy], [.02 * u, yy + .065 * u], [.32 * u + ff * .10 * u, yy + .012 * u]], 5), Math.max(.55, .014 * u), mixCol('#233240', '#517391', .60), 'ink', .42);
  }
  // 黄铜扣与防水腰带
  paint(ribbon(through([[-.48 * u, waistY + .18 * u], [.04 * u, waistY + .32 * u], [.48 * u, waistY + .18 * u]], 6), .105 * u, .082 * u), { wash: '#D3AC56', fill: '#D3AC56', fillOp: 246, ink: '#79591F', sw: .22, bleed: .04, tex: .08, curv: .84 });
  for (let i = 0; i < 3; i++) paint(ellPts((-.24 + i * .27) * u, waistY + (.25 - i * .012) * u, .040 * u, .040 * u, 10), { wash: '#EFD487', fill: '#EFD487', fillOp: 250, ink: '#685022', sw: .12, curv: .90 });
  // 袖口之上的肩育克，稍后叠在前臂根部，保持衣服连续
  paint(through([[-.58 * u, shoulderY + .12 * u], [-.10 * u, neckY + .02 * u], [.44 * u, shoulderY + .04 * u], [.16 * u, chestY + .08 * u], [-.32 * u, chestY + .06 * u]], 7), { wash: '#34516C', fill: '#34516C', fillOp: 235, ink: '#22303F', sw: .22, curv: .90 });

  // ---------- 颈、头、面部：先颈部，再骨相/皱纹/五官/帽 ----------
  push(); translate(0, bob * .08);
  boilSeed('sailorHeadV5' + ph);
  const headCY = -4.20 * u;
  // 颈胸锁乳突肌与晒痕
  paint(ribbon(through([[-.06 * u, neckY + .16 * u], [.06 * u, neckY - .17 * u], [.20 * u, neckY + .14 * u]], 5), .132 * u, .096 * u), { wash: '#BE8157', fill: '#BE8157', fillOp: 252, ink: null, curv: .72 });
  inkLine(through([[-.03 * u, neckY + .04 * u], [.04 * u, neckY - .10 * u], [.10 * u, neckY + .03 * u]], 4), Math.max(.6, .017 * u), '#8C5A34', 'ink', .42);

  // 头部独立倾角：wipe 时微仰，point 时轻微注视指向。
  push(); translate(0, headCY); rotate(sway * .30 + breath * .004 + headTilt);
  // 后发/颈后灰白发际
  paint(ellPts(-.10 * u, -.01 * u, .335 * u, .360 * u, 20), { wash: '#E6E1D2', fill: '#E6E1D2', fillOp: 252, ink: null, curv: .92 });
  // 头骨 + 颧骨下颌：3/4 正面，右侧为行进方向
  paint(ellPts(.03 * u, -.01 * u, .330 * u, .358 * u, 26), { wash: '#D59B6F', fill: '#D59B6F', fillOp: 252, ink: '#6B4128', sw: .24, bleed: .03, tex: .06, curv: .96 });
  paint(through([[-.28 * u, -.04 * u], [-.29 * u, .15 * u], [-.11 * u, .34 * u], [.10 * u, .41 * u], [.29 * u, .27 * u], [.37 * u, .04 * u], [.34 * u, -.08 * u]], 8), { wash: '#D59B6F', fill: '#D59B6F', fillOp: 250, ink: '#6B4128', sw: .20, curv: .90 });
  // 颧骨、鼻侧、下颌晒色，只保留大块水彩阴影
  paint(ellPts(.24 * u, .08 * u, .098 * u, .072 * u, 14), { wash: '#B5734C', washOp: 26, ink: null });
  paint(ellPts(-.08 * u, -.20 * u, .120 * u, .092 * u, 14), { wash: '#B5734C', washOp: 15, ink: null });
  paint(ellPts(.05 * u, .29 * u, .130 * u, .065 * u, 14), { wash: '#BA794F', washOp: 20, ink: null });
  // 耳朵与耳廓
  paint(ellPts(-.26 * u, .03 * u, .054 * u, .074 * u, 12), { wash: '#C9855C', fill: '#C9855C', fillOp: 250, ink: '#6B4128', sw: .14, curv: .90 });
  inkLine(through([[-.27 * u, .01 * u], [-.245 * u, .035 * u], [-.27 * u, .055 * u]], 4), Math.max(.55, .012 * u), '#7A452B', 'ink', .40);
  // 额纹：两道淡水彩线，避免年轮式杂线
  inkLine(through([[-.12 * u, -.24 * u], [.01 * u, -.264 * u], [.15 * u, -.24 * u]], 5), Math.max(.5, .014 * u), mixCol('#6B4128', '#D59B6F', .72), 'ink', .38);
  inkLine(through([[-.11 * u, -.18 * u], [.02 * u, -.202 * u], [.15 * u, -.18 * u]], 5), Math.max(.5, .012 * u), mixCol('#6B4128', '#D59B6F', .76), 'ink', .38);
  // 眼窝、眼白、虹膜、瞳孔、高光与眼袋
  for (const [ex, ew] of [[-.01, .074], [.28, .070]]) {
    paint(ellPts(ex * u, -.055 * u, ew * 1.18 * u, ew * .66 * u, 14), { wash: '#A2613F', washOp: 12, ink: null });
    paint(ellPts(ex * u, -.055 * u, ew * u, ew * .64 * u, 16), { wash: '#F6F2E9', fill: '#F6F2E9', fillOp: 252, ink: null });
    paint(ellPts((ex + .012 + act.shout * .006) * u, -.057 * u, ew * .32 * u, ew * .38 * u, 12), { wash: '#415061', fill: '#415061', fillOp: 252, ink: null });
    paint(ellPts((ex + .012) * u, -.057 * u, ew * .17 * u, ew * .20 * u, 10), { wash: '#1B1A22', fill: '#1B1A22', fillOp: 252, ink: null });
    paint(ellPts((ex + .028) * u, -.078 * u, ew * .090 * u, ew * .090 * u, 8), { wash: '#FFFFFF', fill: '#FFFFFF', fillOp: 250, ink: null });
    inkLine(through([[(ex - ew) * u, -.088 * u], [ex * u, -.108 * u], [(ex + ew) * u, -.086 * u]], 5), Math.max(.62, .015 * u), mixCol('#74452A', '#D59B6F', .24), 'ink', .46);
    inkLine(through([[(ex - ew * .90) * u, -.024 * u], [ex * u, -.014 * u], [(ex + ew * .90) * u, -.022 * u]], 5), Math.max(.50, .011 * u), mixCol('#83502F', '#D59B6F', .58), 'ink', .40);
  }
  // 灰白浓眉：形态明确，不用密集毛发填满
  paint(ribbon(through([[-.09 * u, -.135 * u], [.02 * u, -.155 * u], [.12 * u, -.136 * u]], 5), .030 * u, .020 * u), { wash: '#E9E3D5', fill: '#E9E3D5', fillOp: 252, ink: '#ABA395', sw: .10, curv: .62 });
  paint(ribbon(through([[.19 * u, -.155 * u], [.28 * u, -.172 * u], [.37 * u, -.152 * u]], 5), .030 * u, .020 * u), { wash: '#E9E3D5', fill: '#E9E3D5', fillOp: 252, ink: '#ABA395', sw: .10, curv: .62 });
  for (let i = 0; i < 5; i++) {
    const bx = lerp(-.07, .10, i / 4) * u, by = -.143 * u + Math.sin(i * 2.1) * .005 * u;
    inkLine([[bx, by], [bx + .024 * u, by - .009 * u]], Math.max(.60, .015 * u), '#DAD4C6', 'ink', .26);
  }
  // 鼻：骨梁、鼻翼、酒糟鼻头，曲线收敛
  paint(ribbon(through([[.13 * u, -.03 * u], [.23 * u, .11 * u], [.30 * u, .175 * u]], 6), .040 * u, .054 * u), { wash: '#C8845D', fill: '#C8845D', fillOp: 252, ink: '#75432A', sw: .12, curv: .60 });
  paint(ellPts(.31 * u, .185 * u, .040 * u, .030 * u, 12), { wash: '#DF9372', fill: '#DF9372', fillOp: 220, ink: '#75432A', sw: .09, curv: .90 });
  paint(through([[.25 * u, .200 * u], [.29 * u, .211 * u], [.34 * u, .202 * u]], 4), { wash: '#B26843', washOp: 22, ink: null, curv: .48 });
  // 法令纹与颊纹，只留两条关键线
  inkLine(through([[.20 * u, .075 * u], [.16 * u, .185 * u], [.10 * u, .245 * u]], 5), Math.max(.50, .013 * u), mixCol('#74452A', '#D59B6F', .58), 'ink', .42);
  inkLine(through([[.22 * u, .185 * u], [.19 * u, .222 * u], [.14 * u, .248 * u]], 5), Math.max(.45, .010 * u), mixCol('#74452A', '#D59B6F', .66), 'ink', .40);
  // 口型：呼吸微开，point/呼喊时更明显
  const mo = .013 * u + act.shout * .036 * u + Math.sin(t * 2.18 + ph) * .0032 * u;
  paint(ellPts(.13 * u, .285 * u, .027 * u + act.shout * .020 * u, mo, 12), { wash: '#6C2F24', fill: '#6C2F24', fillOp: 252, ink: '#4C2018', sw: .07, curv: .90 });
  // 白短须与下巴须：分两片，不遮口型
  paint(through([[-.08 * u, .238 * u], [.08 * u, .225 * u], [.29 * u, .233 * u], [.30 * u, .287 * u], [.12 * u, .292 * u], [-.09 * u, .286 * u]], 8), { wash: '#F2EDE2', fill: '#F2EDE2', fillOp: 252, ink: '#A89F91', sw: .11, curv: .90 });
  paint(through([[-.15 * u, .318 * u], [.08 * u, .308 * u], [.29 * u, .315 * u], [.32 * u, .412 * u], [.10 * u, .468 * u], [-.13 * u, .428 * u], [-.21 * u, .362 * u]], 9), { wash: '#EAE5D6', fill: '#EAE5D6', fillOp: 250, ink: '#9C9486', sw: .13, curv: .92 });
  for (let i = 0; i < 8; i++) {
    const a = i / 7, bx = lerp(-.16, .28, a) * u, by = lerp(.38, .44, Math.abs(a - .5) * 2) * u;
    inkLine([[bx, by], [bx + .010 * u, by + .026 * u]], Math.max(.45, .010 * u), mixCol('#EDE8DC', '#B2AB9D', i % 3 ? 0 : .35), 'ink', .28);
  }
  // 帽下颈布/油布领
  paint(through([[-.26 * u, neckY + .24 * u], [.04 * u, neckY + .06 * u], [.42 * u, neckY + .24 * u], [.18 * u, neckY + .50 * u], [-.10 * u, neckY + .49 * u]], 6), { wash: '#D9CBA8', fill: '#D9CBA8', fillOp: 252, ink: '#84795D', sw: .16, curv: .90 });
  // sou'wester：宽檐、冠顶、后颈护布；风影响前檐/后摆
  const capWind = wind * .045 * windK + act.walk * .03;
  paint(through([[-.58 * u + capWind * .20 * u, -.28 * u], [-.34 * u, -.50 * u], [.12 * u, -.64 * u], [.48 * u, -.54 * u], [.72 * u - capWind * .18 * u, -.22 * u], [.34 * u, -.28 * u], [-.22 * u, -.26 * u]], 8), { wash: '#C98F1D', fill: '#C98F1D', fillOp: 252, ink: '#6F4A0C', sw: .22, bleed: .04, tex: .11, curv: .90 });
  paint(through([[-.42 * u + capWind * .12 * u, -.40 * u], [-.18 * u, -.68 * u], [.20 * u, -.72 * u], [.48 * u, -.58 * u], [.46 * u, -.44 * u], [.02 * u, -.56 * u], [-.34 * u, -.50 * u]], 8), { wash: '#DFA92E', fill: '#DFA92E', fillOp: 252, ink: '#7E540D', sw: .24, bleed: .04, tex: .10, curv: .92 });
  paint(through([[-.52 * u + capWind * .18 * u, -.30 * u], [-.16 * u, -.62 * u], [.38 * u, -.56 * u], [.68 * u - capWind * .16 * u, -.24 * u]], 6), { wash: '#F3D67C', washOp: 70 + rainK * 20, ink: null, curv: .56 });
  inkLine(through([[-.34 * u + capWind * .12 * u, -.44 * u], [.04 * u, -.62 * u], [.42 * u, -.48 * u]], 5), Math.max(.60, .016 * u), '#6F4A0C', 'ink', .48);
  // 帽檐雨水：小水珠沿边缘周期滑落
  for (let i = 0; i < Math.floor(6 * rainK); i++) {
    boilSeed('capdrop' + i + ph);
    const age = frac(hash(i * 7 + ph) * 5 + t * (.55 + hash(i) * .35));
    const dx = lerp(-.42, .58, hash(i * 3)) * u, dy = -.28 * u + age * (.14 + hash(i) * .08) * u;
    paint(ellPts(dx, dy, .010 * u, .017 * u, 7), { wash: '#DCEAF5', fill: '#DCEAF5', fillOp: 205, ink: null, curv: .90 });
  }
  pop(); // face local transform
  pop(); // head bob

  // 前臂放在头之后：wipe 时手才能真实擦过眉骨
  arm(1, frontShoulder[0], frontShoulder[1], fE, fH, .162 * u, '#45678A');
  // 肩育克小补笔，让前臂根部不脱离外套
  paint(ellPts(frontShoulder[0], frontShoulder[1] + .010 * u, .155 * u, .105 * u, 12), { wash: '#34516C', fill: '#34516C', fillOp: 245, ink: '#22303F', sw: .18, curv: .88 });

  // ---------- 油布衣料上的雨/风细节 ----------
  if (rainK > .02) {
    // 帽檐和肩上的溅湿光斑
    for (let i = 0; i < Math.floor(8 * rainK); i++) {
      boilSeed('coatwet' + i + ph);
      const px = lerp(-.45, .48, hash(i)) * u, py = shoulderY + hash(i + 5) * .65 * u;
      paint(ellPts(px, py, .045 * u, .018 * u, 9), { wash: '#A9C7DB', washOp: 18 * rainK, ink: null });
    }
    // 沿衣摆滴落的雨水
    for (let i = 0; i < Math.floor(5 * rainK); i++) {
      boilSeed('coatdrop' + i + ph);
      const age = frac(hash(i + ph) * 7 + t * (.38 + hash(i + 3) * .22));
      const sx = (hash(i * 5) > .5 ? -.43 : .48) * u + coatFlap * .22 * u;
      const sy = waistY + .30 * u + age * (hipY + 1.25 * u - waistY - .30 * u);
      paint(ellPts(sx, sy, .009 * u, .019 * u, 7), { wash: '#DCEAF5', fill: '#DCEAF5', fillOp: 190 * rainK, ink: null, curv: .90 });
    }
  }
  // 常态微运动：外套摆尾和腰带反光不冻结
  if (windK > .15) {
    for (let i = 0; i < 2; i++) {
      boilSeed('windstreak' + ph + i);
      const yy = waistY + i * .42 * u, x0 = -.20 * u + wind * .06 * u;
      inkLine(through([[x0, yy], [x0 + .35 * u, yy - .025 * u + wind * .010 * u], [x0 + .62 * u, yy + .010 * u]], 4), Math.max(.45, .012 * u), mixCol('#7E9BB4', '#406081', .30), 'ink', .40);
    }
  }

  pop(); // torso
  pop(); // root
}

// 这里仍保留一个空函数引用，确保旧调用点的 extra sway 语法检查时不会误撞全局。
function swayLocalExtra(v) { return v; }
