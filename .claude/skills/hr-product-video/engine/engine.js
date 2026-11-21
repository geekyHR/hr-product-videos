// HR product video engine.
// A project page loads, in order: gsap.min.js, engine.css, brand.js (window.BRAND), script.js (window.SCRIPT),
// timing.js (window.TIMING, optional), engine.js (this file), the project's scenes.js, then calls E.finish().
// Everything is driven by window.seek(t), so every frame renders exactly the same each time.
//
// window.SCRIPT = { keepTogether: [["HR","policies"], ...], scenes: [
//   { id: "s1", headlineAt: 0, sentences: [{ show: "caption text", say: "what the voice reads" }], cues: { key: "word in say" } } ] }
// window.TIMING (written by tools/voice.py from the real recording) =
//   { scenes: [{ start, dur, sentences: [{ s, e, words: [{ w, s, e }] }], cues: { key: t } }], total }
(function () {
  const params = new URLSearchParams(location.search);
  const shape = params.get('shape') || 'land';
  const LAND = shape === 'land';
  const W = LAND ? 1920 : 1080, H = LAND ? 1080 : 1920;
  const B = window.BRAND || {};
  const col = B.colors || {};
  const root = document.documentElement.style;
  root.setProperty('--W', W + 'px'); root.setProperty('--H', H + 'px');
  root.setProperty('--bg', col.background || '#10005D'); root.setProperty('--fg', col.text || '#FFFFFF');
  root.setProperty('--font', B.font && B.font.family ? `"${B.font.family}"` : '"Inter"');
  if (B.font && B.font.files) B.font.files.forEach(f => {
    const st = document.createElement('style');
    st.textContent = `@font-face { font-family: "${B.font.family}"; src: url("${f.url}"); font-weight: ${f.weight || 400}; }`;
    document.head.appendChild(st);
  });

  const stage = document.getElementById('stage'); stage.className = shape;
  const SCRIPT = window.SCRIPT || { scenes: [] };
  const SCENES = SCRIPT.scenes;
  const L = (a, b) => (LAND ? a : b);
  const $ = s => stage.querySelector(s);

  // ---------- Timing: real (from the recording) or estimated (for drafts) ----------
  function estimate() {
    let t = 0; const out = [];
    SCENES.forEach(sc => {
      let c = t + 0.6; const sents = [], cues = {};
      sc.sentences.forEach(se => {
        const s = c, words = [];
        se.show.split(' ').forEach(w => { words.push({ w, s: c, e: c + 0.33 }); c += 0.36 + (/[.,?!]$/.test(w) ? 0.2 : 0); });
        se.say.split(' ').forEach((w, i) => {
          for (const [k, v] of Object.entries(sc.cues || {})) if (cues[k] === undefined && w.replace(/[^\w'-]/g, '') === v) cues[k] = s + i * 0.38;
        });
        sents.push({ s, e: c, words }); c += 0.3;
      });
      const dur = c - t + 0.6 + ((SCRIPT.holds || {})[sc.id] || 0);
      out.push({ start: t, dur, sentences: sents, cues }); t += dur;
    });
    return { scenes: out, total: t + 1.2, estimated: true };
  }
  const T = window.TIMING && window.TIMING.scenes.length === SCENES.length ? window.TIMING : estimate();

  // ---------- Scenes, logo, captions ----------
  const sc = {};
  SCENES.forEach(s => { const d = document.createElement('div'); d.className = 'scene'; d.id = s.id; stage.appendChild(d); sc[s.id] = d; });
  const logo = B.logo && (B.logo.onDark || B.logo.light);
  stage.insertAdjacentHTML('beforeend', (logo ? `<img class="logo" src="${logo}">` : '') + `<div class="captions" id="cap"></div>`);

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  const idx = id => SCENES.findIndex(s => s.id === id);
  const S = id => T.scenes[idx(id)];
  const cue = (id, k, fb = 0) => { const s = S(id); return s.cues[k] !== undefined ? s.cues[k] : s.start + fb; };
  const span = id => [S(id).start, S(id).start + S(id).dur];
  const sentence = (id, j = 0) => S(id).sentences[j];

  // Scene in and out. The headline waits for the sentence it echoes (headlineAt), never before the voice.
  function enter(id, opts = {}) {
    const [from, to] = span(id), el = sc[id];
    const until = opts.until !== undefined ? opts.until : to;
    tl.fromTo(el, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.5 }, from);
    tl.from(el.querySelectorAll('.q-shape'), { scale: 0, duration: 0.8, stagger: 0.08 }, from + 0.05);
    const h = el.querySelector('.headline, .title');
    const at = SCENES[idx(id)].headlineAt || 0, hs = S(id).sentences[at];
    if (h) tl.from(h, { y: 40, opacity: 0, duration: 0.5 }, Math.max(from + 0.15, hs ? hs.s : from + 0.15));
    if (until !== null) tl.to(el, { opacity: 0, scale: 0.98, duration: 0.4, ease: 'power2.in' }, until - 0.4);
  }

  // Quarter-circle brand motif. corner: tl | tr | br | bl (which corner is rounded).
  function qshape(color, size, corner, pos) {
    const r = { tl: '100% 0 0 0', tr: '0 100% 0 0', br: '0 0 100% 0', bl: '0 0 0 100%' }[corner];
    const o = { tl: '100% 100%', tr: '0 100%', br: '0 0', bl: '100% 0' }[corner];
    return `<div class="q-shape" style="width:${size}px;height:${size}px;background:${color};border-radius:${r};transform-origin:${o};${pos}"></div>`;
  }

  // Generic chat window. name/avatar are the product's; never real employee names.
  function chatWindow({ id, name, avatar, scroll = '', style = '' }) {
    return `<div class="chat" id="${id}" style="${style}"><div class="c-head">${avatar ? `<img src="${avatar}">` : ''}<span class="name">${name}</span></div>
      <div class="c-body"><div class="c-scroll">${scroll}</div></div>
      <div class="c-input"><span class="ph">Type a message</span><span class="typed"></span><span class="caret"></span></div></div>`;
  }
  const typers = [];
  // Types `text` into a chat window's input between t0 and t1; the input clears at `sent`.
  function typeInto(el, text, t0, t1, sent) { typers.push({ el, text, t0, t1, sent }); }
  const CURSOR = `<svg class="abs cursor" width="44" height="44" viewBox="0 0 24 24" style="z-index:60;opacity:0"><path d="M4 2 L4 20 L9 15 L12.5 22 L15 21 L11.5 14 L18 14 Z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`;

  // ---------- Captions: one-line phrases, timed to their first spoken word, no punctuation ----------
  const MAXC = LAND ? 40 : 34, capList = [];
  const KEEP = SCRIPT.keepTogether || [];
  const txt = ws => ws.map(x => x.w).join(' ');
  const bare = w => w.replace(/[^A-Za-z0-9]/g, '');
  function buildCaptions() {
    SCENES.forEach((s, i) => s.sentences.forEach((se, j) => {
      const tm = T.scenes[i].sentences[j];
      const words = tm.words && tm.words.length ? tm.words.map(x => ({ ...x }))
        : se.show.split(' ').map((w, k, a) => ({ w, s: tm.s + (tm.e - tm.s) * k / a.length, e: tm.s + (tm.e - tm.s) * (k + 1) / a.length }));
      for (let k = 0; k < words.length; k++) for (const p of KEEP) {
        if (p.every((x, q) => words[k + q] && bare(words[k + q].w) === bare(x))) {
          const g = words.splice(k, p.length); words.splice(k, 0, { w: txt(g), s: g[0].s, e: g[g.length - 1].e }); break;
        }
      }
      const clauses = []; let c = [];
      words.forEach((w, k) => { c.push(w); if (/[,.?!]$/.test(w.w) && k < words.length - 1) { clauses.push(c); c = []; } });
      if (c.length) clauses.push(c);
      const merged = [];   // right to left, so a short trailing piece joins the line before it
      for (let k = clauses.length - 1; k >= 0; k--) {
        const cl = clauses[k], nx = merged[0];
        if (nx && (txt(cl).length < 14 || txt(nx).length < 10) && txt(cl).length + txt(nx).length + 1 <= MAXC) merged[0] = cl.concat(nx);
        else merged.unshift(cl.slice());
      }
      merged.forEach(cl => {
        const parts = Math.ceil(txt(cl).length / MAXC);
        if (parts <= 1) { capList.push({ text: txt(cl), s: cl[0].s, e: cl[cl.length - 1].e }); return; }
        const target = txt(cl).length / parts; let cur = [];
        cl.forEach((w, k) => {
          if (cur.length && txt(cur).length + w.w.length + 1 > target + 6 && ((cl.length - k) > 1 || w.w.includes(' '))) {
            capList.push({ text: txt(cur), s: cur[0].s, e: cur[cur.length - 1].e }); cur = [];
          }
          cur.push(w);
        });
        capList.push({ text: txt(cur), s: cur[0].s, e: cur[cur.length - 1].e });
      });
    }));
    for (let k = 0; k < capList.length; k++) {
      const nx = capList[k + 1];
      capList[k].hold = nx && nx.s - capList[k].e < 0.6 ? nx.s - 0.02 : capList[k].e + 0.35;
    }
  }
  function renderCaptions(t) {
    const c = capList.find(x => t >= x.s && t < x.hold);
    const el = $('#cap'), v = c ? c.text.replace(/[.,!?;:]/g, '') : '';
    if (el.textContent !== v) el.textContent = v;
  }

  function finish() {
    tl.set({}, {}, T.total);
    buildCaptions();
    window.DURATION = T.total;
    window.seek = t => {
      tl.seek(t, false);
      typers.forEach(ty => {
        const n = t < ty.t0 ? 0 : Math.min(ty.text.length, Math.round((t - ty.t0) / (ty.t1 - ty.t0) * ty.text.length));
        const sent = t >= ty.sent;
        ty.el.querySelector('.typed').textContent = sent ? '' : ty.text.slice(0, n);
        ty.el.querySelector('.ph').style.display = n > 0 && !sent ? 'none' : '';
      });
      stage.querySelectorAll('.caret').forEach(c => c.style.opacity = (Math.floor(t * 2) % 2 === 0) ? 1 : 0);
      renderCaptions(t);
    };
    window.seek(0);
  }

  window.E = { shape, LAND, W, H, L, $, B, C: Object.assign({}, col.palette || {}), T, SCENES, sc, tl, S, cue, span, sentence,
               enter, qshape, chatWindow, typeInto, CURSOR, finish };
  window.SCENES = SCENES; window.T = T;
})();
