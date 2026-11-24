// Demo of every motion template in engine/motion.js (E.fx). All names and figures are fictional examples.
const { sc, L, C, W, H, tl, enter, span, qshape } = E;
const { cardFan, photoCollage, textReveal, numberRoll, bigType, focusCards, wipe } = E.fx;
const tag = (id, name) => sc[id].insertAdjacentHTML('beforeend',
  `<div class="abs" style="left:${L(120, 80)}px;top:${L(90, 120)}px;font-family:'DejaVu Sans Mono',monospace;font-size:${L(26, 30)}px;opacity:0.6">E.fx.${name}</div>`);
const t0 = id => span(id)[0];

// m1: big type plus a reveal line.
tag('m1', 'bigType');
enter('m1');
bigType('m1', { text: 'Live', at: t0('m1') + 0.3, x: L(120, 80), y: L(300, 560), size: L(320, 300) });
textReveal('m1', { text: 'Now in *every* office.', at: t0('m1') + 1.2, x: L(130, 90), y: L(700, 940), size: L(64, 64) });

// m2: card fan.
tag('m2', 'cardFan');
sc.m2.insertAdjacentHTML('beforeend', qshape(C.secondary, L(300, 240), 'tl', 'right:0;bottom:0'));
enter('m2');
cardFan('m2', { at: t0('m2') + 0.3, cx: W / 2, cy: L(640, 1080), w: L(300, 320), h: L(400, 430), spread: L(52, 44), items: [
  { title: 'Leave', text: 'Plan time off', color: C.paper },
  { title: 'Pay', text: 'Payslips and benefits', color: C.soft2 },
  { title: 'Learning', text: 'Courses and paths', color: C.accent },
  { title: 'Wellbeing', text: 'Support when you need it', color: C.soft3, ink: '#fff' },
  { title: 'Travel', text: 'Trips and claims', color: C.soft1 } ] });

// m3: photo collage with fictional placeholders.
tag('m3', 'photoCollage');
enter('m3');
textReveal('m3', { text: 'Built for *every* employee.', at: t0('m3') + 0.4, x: L(120, 80), y: L(300, 260), width: L(620, 920), size: L(72, 76) });
photoCollage('m3', { at: t0('m3') + 0.2, x: L(820, 60), y: L(80, 560), w: L(1020, 960), h: L(920, 1260), seed: 11,
  items: ['AK', 'RM', 'SJ', 'PT', 'LN', 'DV', 'MC', 'KO'].map((l, i) => ({ label: l, color: [C.secondary, C.soft3, C.accent, C.soft2][i % 4] })) });

// m4: number roll (example figure).
tag('m4', 'numberRoll');
sc.m4.insertAdjacentHTML('beforeend', qshape(C.accent, L(320, 240), 'tl', 'right:0;bottom:0'));
enter('m4');
numberRoll('m4', { value: '1,248', at: t0('m4') + 0.4, x: L(120, 80), y: L(330, 640), size: L(220, 220), label: 'questions answered in week one (example)' });

// m5: focus cards.
tag('m5', 'focusCards');
enter('m5');
{ const a = t0('m5');
  focusCards('m5', { at: a + 0.3, x: L(120, 80), y: L(260, 400), cols: 2, w: L(560, 440), h: L(280, 360), items: [
    { title: 'Ask', text: 'Type a question in plain words' },
    { title: 'Read', text: 'Get the answer with the source' },
    { title: 'Check', text: 'Open the policy in one tap' },
    { title: 'Escalate', text: 'Raise a ticket if you need a person' } ],
    focus: [[a + 1.4, 0], [a + 2.3, 1], [a + 3.2, 2], [a + 4.1, 3]] }); }

// m6: wipe in, then a word-by-word reveal.
tag('m6', 'wipe + textReveal');
sc.m6.insertAdjacentHTML('beforeend', qshape(C.accent, L(440, 320), 'tl', 'right:0;bottom:0'));
enter('m6', { until: null });
wipe('m6', { color: C.accent, at: t0('m6') });
textReveal('m6', { text: 'Your questions, *answered*.', at: t0('m6') + 0.7, x: L(120, 80), y: L(380, 700), size: L(110, 100), width: L(1400, 920) });
