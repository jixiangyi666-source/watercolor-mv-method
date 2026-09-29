// karaoke.js: brush-font karaoke with a character-by-character fill, drawn on the 2D compositor through
// window.overlayHook in core.js (crisp, above the paper grain). The bar covers y ≈ 975–1070 while a line shows.
//
// LY = [[start, end, "line", opts?]]. opts.sing = seconds the line takes to sing (for the fill); opts.pun =
// { from, to, at }: at time `at`, the characters `from` get a painted strike and `to` pops in above them (e.g. the fans'
// 大经理 → 大锦鲤 joke); opts.hold = seconds the line stays up after it ends, lifted above the next line.
// Times are clip times: the song's LRC time minus the clip start (see references/music-video.md). Let lines run into each other.


const LY = [
  [0.8, 3.0, '苦涩的沙'],
  [3.0, 6.0, '吹痛脸庞的感觉'],
  [6.0, 7.0, '像父亲的责骂'],
  [7.0, 10.0, '母亲的哭泣'],
  [10.0, 13.0, '永远难忘记'],
  [13.0, 14.0, '年少的我'],
  [14.0, 16.5, '喜欢一个人在海边'],
  [16.5, 21.0, '卷起裤管光着脚丫踩在沙滩上'],
  [21.0, 25.0, '总是幻想海洋的尽头有另一个世界'],
  [25.0, 29.0, '总是以为勇敢的水手是真正的男儿'],
  [29.0, 35.0, '总是一副弱不禁风孬种的样子'],
  [35.0, 40.0, '在受人欺负的时候总是听见水手说'],
  [40.0, 45.0, '他说风雨中这点痛算什么'],
  [45.0, 47.0, '擦干泪不要怕'],
  [47.0, 50.0, '至少我们还有梦'],
  [50.0, 55.0, '他说风雨中这点痛算什么'],
  [55.0, 57.0, '擦干泪不要问'],
  [57.0, 61.0, '为什么'],
  [61.0, 65.0, '长大以后'],
  [65.0, 68.0, '为了理想而努力'],
  [68.0, 71.0, '渐渐的忽略了'],
  [71.0, 75.0, '父亲母亲和故乡的消息'],
  [75.0, 78.0, '如今的我'],
  [78.0, 80.0, '生活就像在演戏'],
  [80.0, 81.0, '说着言不由衷的话'],
  [81.0, 84.0, '戴着伪善的面具'],
  [84.0, 88.0, '总是拿着微不足道的成就来骗自己'],
  [88.0, 92.0, '总是莫名其妙感到一阵的空虚'],
  [92.0, 98.0, '总是靠一点酒精的麻醉才能够睡去'],
  [98.0, 104.0, '在半梦半醒之间仿佛又听见水手说'],
  [104.0, 109.0, '他说风雨中这点痛算什么'],
  [109.0, 110.0, '擦干泪不要怕'],
  [110.0, 112.0, '至少我们还有梦'],
  [112.0, 117.0, '他说风雨中这点痛算什么'],
  [117.0, 121.0, '擦干泪不要问'],
  [121.0, 127.8, '为什么'],
];
const KFONT = '"Ma Shan Zheng", "KaiTi", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`64px ${KFONT}`, LY.map(l => l[2] + ((l[3] && l[3].pun && l[3].pun.to) || '')).join('')]];

window.overlayHook = (c, t) => {
  const i = LY.findIndex(l => t >= l[0] && t < l[1]);
  // a line with opts.hold stays up after its time, lifted and shrunk above the next one (two-row KTV style)
  const P = LY.find(l => l[3] && l[3].hold && t >= l[1] && t < l[1] + l[3].hold);
  if (P) { const a = t - P[1], k = ease(a / .15); kLine(c, P, t, 1024 - 108 * k, 1 - .3 * k, 1 - ease((a - (P[3].hold - .3)) / .3), true); }
  if (i >= 0) kLine(c, LY[i], t, 1024, 1, 1, false);
};
function kLine(c, L, t, y, sc, alpha, held) {
  const [a, b, txt, opt = {}] = L;
  const grow = held ? 1 : easeOut((t - a) / .18) * (opt.hold ? 1 : 1 - ease((t - (b - .1)) / .1));
  if (grow < .02 || alpha <= .01) return;
  c.save(); c.globalAlpha = alpha; c.translate(960, y); c.scale(sc, sc); c.translate(-960, -y);
  c.font = `64px ${KFONT}`; c.textBaseline = 'middle'; c.textAlign = 'left';
  const total = c.measureText(txt).width;
  // the bar: a ragged ink lozenge that grows from the centre and boils with the linework
  const w = (total + 120) * grow, x0 = 960 - w / 2, y0 = y - 48, r = n => hash(BOILN * 13 + n) * 8 - 4;
  c.globalAlpha = .86 * alpha; c.fillStyle = PAL.ink; c.beginPath();
  c.moveTo(x0 + r(1), y0 + r(2)); c.lineTo(x0 + w / 2, y0 - 5 + r(3)); c.lineTo(x0 + w + r(4), y0 + r(5));
  c.lineTo(x0 + w + 16, y0 + 46); c.lineTo(x0 + w + r(6), y0 + 92 + r(7)); c.lineTo(x0 + w / 2, y0 + 96 + r(8));
  c.lineTo(x0 + r(9), y0 + 92 + r(10)); c.lineTo(x0 - 16, y0 + 46); c.closePath(); c.fill();
  c.globalAlpha = alpha;
  if (grow > .85) {
    // characters fill left to right as they're sung (opt.sing = how long the line takes to sing)
    const n = [...txt].length, singDur = opt.sing ?? Math.min((b - a) * .85, n * .3), f = held ? 1 : clamp((t - a) / singDur);
    const x = 960 - total / 2;
    c.fillStyle = PAL.cream; c.fillText(txt, x, y);
    c.save(); c.beginPath(); c.rect(x - 2, y - 50, total * f + 2, 100); c.clip(); c.fillStyle = PAL.ochre; c.fillText(txt, x, y); c.restore();
    if (opt.pun && t > opt.pun.at) pun(c, txt, x, y, opt.pun, t - opt.pun.at);
  }
  c.restore();
}

// Strike through `from` with a red brush stroke, then pop `to` in above it, tilted, in gold with an ink shadow.
function pun(c, txt, x, y, p, age) {
  const i = txt.indexOf(p.from); if (i < 0) return;
  const px = x + c.measureText(txt.slice(0, i)).width, pw = c.measureText(p.from).width;
  const k = easeOut(age / .25);
  c.save(); c.strokeStyle = '#D8394E'; c.lineCap = 'round'; c.lineWidth = 9;
  c.beginPath(); c.moveTo(px - 8, y + 6);
  for (let j = 1; j <= 8; j++) { const q = j / 8 * k; c.lineTo(px - 8 + (pw + 16) * q, y + 6 - 12 * q + Math.sin(j * 1.7) * 2); }
  c.stroke(); c.restore();
  const pop = backOut(clamp((age - .2) / .35)); if (pop <= .01) return;
  c.save(); c.translate(px + pw / 2 + 10, y - 88); c.rotate(-.12 + Math.sin(age * 14) * .04 * Math.exp(-age * 2)); c.scale(pop, pop);
  c.font = `96px ${KFONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = PAL.ink; c.strokeText(p.to, 0, 0);
  c.fillStyle = PAL.ink; c.fillText(p.to, 5, 6);
  c.fillStyle = '#F4B63A'; c.fillText(p.to, 0, 0);
  c.restore();
}
