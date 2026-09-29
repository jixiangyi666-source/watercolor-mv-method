// sheets.js: Clawd's model sheets, as standalone loops. They're reference for you (and the model), not part of a video,
// so they're the one place labels are fine. Scrub them at studio.html?loop=views or ?loop=emotions, or render:
//   node render.mjs --loop=emotions --sheet=1 --cols=1 --w=1920 --out=docs/emotions.jpg
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });
  const floor = (y, x0 = 0, x1 = W) => inkLine([[x0 + 40, y + 6], [W / 2, y + 4], [x1 - 40, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5);

  // Every emotion in EMO, alive. Order follows EMO.
  LOOPS.emotions = t => {
    const names = Object.keys(EMO), cols = 8, cw = W / cols, ch = H / 4;
    names.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2, gy = ch * Math.floor(i / cols) + ch - 58;
      clawd(cx, gy, 11, feel(name, t, { seed: i }));
      label(name, cx, gy + 32);
    });
    for (let r = 0; r < 4; r++) floor(ch * r + ch - 58);
  };
  LOOPS.emotions.len = 4;

  // Views, motion helpers, hats.
  LOOPS.views = t => {
    // row 1: the five key views (flip any of them to face left)
    const views = ['front', 'q', 'side', 'qback', 'back'];
    views.forEach((v, i) => { const x = 240 + i * 360; clawd(x, 420, 19, { ...feel('neutral', t, { seed: i }), view: v }); label(v, x, 462, 24); });
    floor(420);
    // row 2: motion
    const y2 = 730, u2 = 13, row = [
      ['walk (side)', x => clawd(x, y2, u2, { ...move('walk', t), view: 'side' })],
      ['turn / spinView', x => clawd(x, y2, u2, { ...feel('happy', t), ...spinView(Math.floor(t * 2) / 8) })],
      ['smear', x => clawd(x, y2, u2, { ...feel('excited', t), view: 'side', smear: .8, smearDir: 1, dx: Math.sin(t * TAU / 2) * .3 })],
      ['jump', x => { const k = t % 1.5; clawd(x, y2, u2, { ...feel('happy', t), ...jump(k, .35, .95, 3) }); }],
      ['take', x => clawd(x, y2, u2, { ...feel('surprised', t), ...take(t % 2, .5, 1.2), emoteAge: (t % 2) - .5, emoteK: seg(t % 2, .5, .7) })],
      ['lid', x => clawd(x, y2, u2, { ...feel('laugh', t), mouth: null, lid: .35 + .3 * Math.abs(Math.sin(t * TAU * 1.5)) })],
    ];
    row.forEach(([name, f], i) => { const x = 180 + i * 312; f(x); label(name, x, y2 + 38); });
    floor(y2);
    // row 3: hats
    const hats = ['party', 'hard', 'crown', 'halo', 'wizard', 'top', 'fedora', 'band', 'beanie', 'bow', 'flower', 'headphones', 'cat', 'masq', 'bowtie'];
    hats.forEach((h, i) => { const x = 82 + i * 125.5; clawd(x, 985, 8, { ...feel('neutral', t, { seed: i }), hat: h }); label(h, x, 1015, 17); });
    floor(985);
  };
  LOOPS.views.len = 4;
})();

// Mini model sheet: character-only QA loop.
LOOPS.mini = t => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });
  const floor = (y, x0 = 80, x1 = W - 80) => inkLine([[x0, y + 5], [W / 2, y + 3], [x1, y + 6]], .7, mixCol(PAL.paper, PAL.ink, .32), 'inkfine', .4);
  const views = ['front', 'q', 'side', 'qback', 'back'];
  views.forEach((v, i) => { const x = 250 + i * 355, gy = 430; mini(x, gy, 30, { ...mfeel('neutral', t), view: v, boilKey: 'view' + v }); label(v, x, gy + 45, 24); });
  floor(430);
  const motions = [
    ['walk side', x => mini(x, 780, 24, { ...mfeel('determined', t), walk: (t * 1.1) % 1, view: 'side', boilKey: 'walk' })],
    ['jump', x => { const k = t % 1.5; const j = jump(k, .55, 1.05, 1.6); mini(x, 780, 24, { ...mfeel('happy', t), ...j, boilKey: 'jump' }); }],
    ['wave', x => mini(x, 780, 24, { ...mfeel('happy', t), aR: Math.sin(t * 7) * .75, boilKey: 'wave' })],
    ['sad', x => mini(x, 780, 24, { ...mfeel('sad', t), tear: .7, boilKey: 'sad' })],
    ['scared', x => mini(x, 780, 24, { ...mfeel('scared', t), boilKey: 'scared' })],
    ['determined', x => mini(x, 780, 24, { ...mfeel('determined', t), glowK: .8, boilKey: 'det' })],
  ];
  motions.forEach(([name, f], i) => { const x = 220 + i * 296; f(x); label(name, x, 825, 20); });
  floor(780);
  const emos = ['neutral', 'happy', 'excited', 'sad', 'cry', 'scared', 'surprised', 'determined', 'sleepy', 'idea', 'love', 'bored'];
  emos.forEach((name, i) => { const x = 105 + (i % 6) * 342, gy = 1035, u = 13; mini(x, gy, u, { ...mfeel(name, t), boilKey: 'emo' + name }); label(name, x, gy + 20, 16); });
};
LOOPS.mini.len = 4;
