// Motion templates for the HR video engine. Load after engine.js. All original code (GSAP), written for this repository.
// Every function adds elements to a scene (E.sc[id]) and schedules its animation on the shared timeline (E.tl).
// Times are in seconds on the video timeline: pass cue(...) or sentence(...).s so motion follows the voice.
// Sizes are in pixels of the current shape; use E.L(landValue, vertValue) to give both shapes.
(function () {
  const { sc, tl, L, C, span } = E;
  const add = (id, html) => { sc[id].insertAdjacentHTML('beforeend', html); return sc[id].lastElementChild; };
  const rand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // 1. Card fan: a stack of cards that fans out in an arc. Good for "many programmes, one place", benefits, HR areas.
  //    items: [{ title, text, color, ink }]
  function cardFan(id, { items, at, cx, cy, w = L(300, 300), h = L(400, 400), spread = 50, lift = L(60, 60), stagger = 0.08 }) {
    const n = items.length, wrap = add(id, `<div class="abs fx-fan" style="left:0;top:0;width:100%;height:100%;perspective:1600px"></div>`);
    items.forEach((it, i) => {
      const ang = n > 1 ? -spread / 2 + spread * i / (n - 1) : 0;
      wrap.insertAdjacentHTML('beforeend', `<div class="abs fx-card" style="left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;
        border-radius:26px;background:${it.color || C.paper};color:${it.ink || C.primary};padding:30px;transform-origin:50% 230%;
        box-shadow:0 30px 70px rgba(0,0,0,0.35);display:flex;flex-direction:column;justify-content:flex-start">
        <div style="font-size:${Math.round(w / 8.5)}px;font-weight:600;line-height:1.1">${it.title}</div>
        ${it.text ? `<div style="font-size:${Math.round(w / 14)}px;margin-top:10px;opacity:0.75">${it.text}</div>` : ''}</div>`);
      const c = wrap.lastElementChild;
      tl.fromTo(c, { rotation: 0, y: 200, opacity: 0, rotationY: -25 },
        { rotation: ang, y: -lift * Math.cos(ang * Math.PI / 180), opacity: 1, rotationY: 0, duration: 0.9, ease: 'back.out(1.4)' }, at + i * stagger);
    });
    return wrap;
  }

  // 2. Photo collage: floating cards that drift slowly, like a wall of people or moments.
  //    Use fictional placeholders (initials, colours) or approved images only. items: [{ label, img, color }]
  function photoCollage(id, { items, at, x, y, w, h, seed = 7, size = [L(150, 170), L(240, 270)], drift = 18 }) {
    const r = rand(seed), [a, b] = span(id), els = [];
    const cols = Math.max(2, Math.round(Math.sqrt(items.length * w / h))), rows = Math.ceil(items.length / cols);
    const cw = w / cols, ch = h / rows;
    items.forEach((it, i) => {
      const s = Math.min(size[0] + r() * (size[1] - size[0]), cw * 0.95, ch * 0.78);
      const px = x + (i % cols) * cw + r() * (cw - s), py = y + Math.floor(i / cols) * ch + r() * (ch - s * 1.25);
      const face = it.img ? `<img src="${it.img}" style="width:100%;height:100%;object-fit:cover">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${s / 3}px;font-weight:600;color:#fff;
            background:linear-gradient(160deg,${it.color || C.secondary},rgba(0,0,0,0.35))">${it.label || ''}</div>`;
      els.push(add(id, `<div class="abs fx-photo" style="left:${px}px;top:${py}px;width:${s}px;height:${s * 1.25}px;border-radius:14px;overflow:hidden;
        border:5px solid #fff;box-shadow:0 24px 60px rgba(0,0,0,0.4)">${face}</div>`));
    });
    els.forEach((el, i) => {
      tl.from(el, { scale: 0.6, opacity: 0, filter: 'blur(14px)', rotation: (r() - 0.5) * 16, duration: 0.8 }, at + i * 0.09);
      tl.to(el, { y: (r() - 0.5) * drift * 2, x: (r() - 0.5) * drift, duration: Math.max(1, b - at), ease: 'sine.inOut' }, at);
    });
    return els;
  }

  // 3. Text reveal: words rise out of a soft blur one after another. Wrap a word in *stars* to make it bold.
  function textReveal(id, { text, at, x, y, size = L(76, 78), width = L(900, 920), per = 0.07, color = '#fff', weight = 300 }) {
    const html = text.split(' ').map(wd => {
      const bold = /^\*.*\*[.,!?]?$/.test(wd), t = wd.replace(/\*/g, '');
      return `<span class="fx-w" style="display:inline-block;margin-right:0.25em;${bold ? 'font-weight:600' : ''}">${t}</span>`;
    }).join('');
    const box = add(id, `<div class="abs fx-reveal" style="left:${x}px;top:${y}px;width:${width}px;font-size:${size}px;font-weight:${weight};line-height:1.12;color:${color}">${html}</div>`);
    tl.from(box.querySelectorAll('.fx-w'), { y: size * 0.5, opacity: 0, filter: 'blur(12px)', duration: 0.55, stagger: per }, at);
    return box;
  }

  // 4. Number roll: digits roll into place, like an odometer. For real, approved figures only.
  function numberRoll(id, { value, at, x, y, size = L(160, 170), label = '', duration = 1.4, color = '#fff', accent = C.accent }) {
    const cols = [...String(value)].map((ch, i) => /\d/.test(ch)
      ? `<span class="fx-dig" data-d="${ch}" style="display:inline-block;height:1em;overflow:hidden;vertical-align:top"><span style="display:block">${[...Array(10).keys(), ...Array(10).keys()].map(d => `<span style="display:block;height:1em">${d}</span>`).join('')}</span></span>`
      : `<span style="display:inline-block">${ch}</span>`).join('');
    const box = add(id, `<div class="abs fx-num" style="left:${x}px;top:${y}px;color:${color}">
      <div style="font-size:${size}px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-0.02em">${cols}</div>
      ${label ? `<div class="fx-numlab" style="font-size:${Math.round(size / 4)}px;margin-top:${Math.round(size / 8)}px;color:${accent};font-weight:500">${label}</div>` : ''}</div>`);
    box.querySelectorAll('.fx-dig').forEach((d, i) => {
      const k = 10 + +d.dataset.d;   // roll through one full turn, then land on the digit
      tl.fromTo(d.firstElementChild, { y: 0 }, { y: -k * size, duration: duration + i * 0.12, ease: 'power3.out' }, at);
    });
    tl.from(box, { opacity: 0, duration: 0.3 }, at);
    if (label) tl.from(box.querySelector('.fx-numlab'), { y: 20, opacity: 0, duration: 0.5 }, at + duration * 0.6);
    return box;
  }

  // 5. Big type: oversized letters rise from behind a mask and settle. For one-word moments ("Live", "Ask", "Grow").
  function bigType(id, { text, at, x, y, size = L(260, 230), color = C.accent, per = 0.045, outline = false }) {
    const letters = [...text].map(ch => `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;line-height:0.95">
      <span class="fx-l" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span></span>`).join('');
    const box = add(id, `<div class="abs fx-big" style="left:${x}px;top:${y}px;font-size:${size}px;font-weight:800;letter-spacing:-0.03em;white-space:nowrap;
      ${outline ? `color:transparent;-webkit-text-stroke:3px ${color}` : `color:${color}`}">${letters}</div>`);
    tl.from(box.querySelectorAll('.fx-l'), { yPercent: 105, rotation: 8, duration: 0.7, stagger: per, ease: 'power4.out' }, at);
    tl.fromTo(box, { scale: 1.06 }, { scale: 1, duration: 1.4, ease: 'power2.out' }, at);
    return box;
  }

  // 6. Focus cards: a grid of cards; at each time in `focus`, one card comes forward and the others blur.
  //    items: [{ title, text, color }], focus: [[time, index], ...]
  function focusCards(id, { items, at, x, y, cols = 2, w = L(380, 440), h = L(240, 260), gap = 30, focus = [] }) {
    const els = items.map((it, i) => add(id, `<div class="abs fx-fc" style="left:${x + (i % cols) * (w + gap)}px;top:${y + Math.floor(i / cols) * (h + gap)}px;
      width:${w}px;height:${h}px;border-radius:22px;background:${it.color || 'rgba(255,255,255,0.08)'};border:2px solid rgba(255,255,255,0.14);padding:28px;
      display:flex;flex-direction:column;justify-content:flex-end">
      <div style="font-size:${Math.round(w / 10)}px;font-weight:600">${it.title}</div>
      ${it.text ? `<div style="font-size:${Math.round(w / 17)}px;opacity:0.75;margin-top:8px">${it.text}</div>` : ''}</div>`));
    tl.from(els, { y: 50, opacity: 0, duration: 0.6, stagger: 0.08 }, at);
    focus.forEach(([t, k]) => els.forEach((el, i) => tl.to(el, i === k
      ? { scale: 1.06, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }
      : { scale: 0.97, opacity: 0.4, filter: 'blur(5px)', duration: 0.45, ease: 'power2.out' }, t)));
    return els;
  }

  // 7. Wipe: a brand-coloured panel sweeps across as the scene starts. Use for section changes, not every scene.
  function wipe(id, { color = C.accent, dir = 'left', at } = {}) {
    const t = at !== undefined ? at : span(id)[0];
    const p = add(id, `<div class="abs fx-wipe" style="inset:0;background:${color};z-index:30"></div>`);
    const [o1, o2] = dir === 'up' ? ['50% 100%', '50% 0%'] : ['0% 50%', '100% 50%'], prop = dir === 'up' ? 'scaleY' : 'scaleX';
    tl.fromTo(p, { [prop]: 1, transformOrigin: o1 }, { [prop]: 0, transformOrigin: o2, duration: 0.7, ease: 'power3.inOut' }, t);
    return p;
  }

  E.fx = { cardFan, photoCollage, textReveal, numberRoll, bigType, focusCards, wipe };
})();
