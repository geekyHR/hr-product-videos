// Scene layout and motion for this project. Uses the engine API (window.E):
//   E.sc.<id> scene element, E.enter(id) in/out, E.cue(id, key) time of a cue word, E.sentence(id, j) sentence times,
//   E.qshape(color, size, corner, css) brand quarter-circle, E.chatWindow({...}) chat UI, E.typeInto(...), E.L(land, vert).
// All people shown are fictional.
const { sc, L, C, tl, enter, cue, sentence, span, qshape, chatWindow, typeInto } = E;

// Scene 1: the problem.
sc.s1.innerHTML = `<div class="headline">One question. <b>Too many</b> places to look.</div>` +
  qshape(C.accent, L(280, 220), 'tl', 'right:0;bottom:0') +
  ['Policy PDF', 'Old email', 'Shared folder', 'Team chat'].map((t, i) =>
    `<div class="abs card4" style="left:${L(1000 + (i % 2) * 330, 120 + (i % 2) * 460)}px;top:${L(200 + Math.floor(i / 2) * 330, 700 + Math.floor(i / 2) * 380)}px;
     width:280px;height:260px;border-radius:18px;background:${[C.paper, C.soft2, C.soft1, C.soft3][i]};color:${C.primary};padding:24px;font-size:26px;font-weight:500">${t}</div>`).join('');
enter('s1');
sc.s1.querySelectorAll('.card4').forEach((c, i) => tl.from(c, { y: 60, opacity: 0, duration: 0.6 }, span('s1')[0] + 0.3 + i * 0.5));

// Scene 2: meet the product.
sc.s2.innerHTML = qshape(C.secondary, L(700, 760), 'tl', 'right:0;bottom:0') +
  `<div class="title">Ask <b>HR</b></div><div class="sub" id="s2sub" style="left:${L(124, 84)}px;top:${L(440, 380)}px">Your HR assistant in Microsoft Teams</div>`;
enter('s2');
tl.from('#s2sub', { y: 30, opacity: 0, duration: 0.5 }, sentence('s2').s + 0.8);

// Scene 3: ask and answer in a chat window.
const Q = 'How many days of leave can I carry forward?';
sc.s3.innerHTML = `<div class="headline">Ask in plain <b>language</b>.</div>` + qshape(C.accent, L(300, 220), 'tl', 'right:0;bottom:0') +
  chatWindow({ id: 'chat1', name: 'Ask HR', scroll: `<div class="qb">${Q}</div>
    <div class="ans"><div style="flex:1"><div class="meta r">Ask HR</div><div class="card r" id="ansA">
    <h4>Leave carry forward</h4><ul><li>Example answer. Replace with a real, confirmed answer from the product.</li></ul>
    <hr><div><b>References</b></div><ul><li><a>Leave policy.pdf</a></li></ul></div></div></div>` });
enter('s3');
{ const w = document.getElementById('chat1'), t0 = cue('s3', 'ask', 0.5) + 0.3, sent = t0 + 2.6;
  tl.from(w, { x: L(120, 0), y: L(0, 120), opacity: 0, duration: 0.8 }, span('s3')[0] + 0.2);
  typeInto(w, Q, t0, t0 + 2.2, sent);
  tl.to(w.querySelector('.qb'), { opacity: 1, duration: 0.35 }, sent);
  tl.to(w.querySelectorAll('.meta.r, #ansA'), { opacity: 1, duration: 0.4, stagger: 0.15 }, sent + 0.5); }

// End card.
sc.end.innerHTML = qshape(C.accent, L(420, 260), 'tl', 'right:0;bottom:0') + qshape(C.secondary, L(300, 240), 'br', 'left:0;top:0') +
  `<div class="title">Ask <b>HR</b></div>` +
  `<div class="sub" id="endsub" style="left:${L(124, 84)}px;top:${L(450, 400)}px;font-size:52px">Your questions, <b>answered</b>.</div>`;
enter('end', { until: null });
tl.from('#endsub', { y: 30, opacity: 0, duration: 0.5 }, cue('end', 'your', 1.5));
