// Render a project's index.html to a silent video, or to still frames for review.
//   node .claude/skills/hr-product-video/tools/render.js projects/<name> [land|vert] [--fps 30] [--stills 1.5,8,20]
// Output: projects/<name>/out/body_<shape>.mp4  (or out/stills/<shape>_t<sec>.png)
// Needs Node 18+, ffmpeg, and Google Chrome (set CHROME=/path/to/chrome if it is not found).
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : args.splice(i, 2)[1]; };
const fps = Number(opt('--fps', 30));
const stills = (opt('--stills', '') || '').split(',').filter(Boolean).map(Number);
const [projArg, shape = 'land'] = args;
if (!projArg) { console.log('usage: node render.js projects/<name> [land|vert] [--fps 30] [--stills t1,t2]'); process.exit(1); }
const proj = path.resolve(projArg);
const [W, H] = shape === 'land' ? [1920, 1080] : [1080, 1920];
const CHROME = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found. Set CHROME=/path/to/chrome'); process.exit(1); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(proj, 'index.html') + '?shape=' + shape, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  fs.mkdirSync(path.join(proj, 'out', 'stills'), { recursive: true });

  if (stills.length) {
    for (const t of stills) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: path.join(proj, 'out', 'stills', `${shape}_t${t}.png`) });
    }
    console.log(`stills -> ${path.join(projArg, 'out', 'stills')}`);
    return browser.close();
  }

  const out = path.join(proj, 'out', `body_${shape}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stdout.write(`\r${i}/${frames} frames`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`\nwrote ${out} (${frames} frames, ${duration.toFixed(1)} s)`);
})();
