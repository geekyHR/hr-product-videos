"""Quality check a project before showing it to anyone.

    python3 .claude/skills/hr-product-video/tools/qc.py projects/<name> [land|vert] [--transcribe]

Reports:
  1. Pace of every sentence (words per minute) and the pause before it. Aim for 130 to 180 wpm.
  2. Loudness of the final video (aim for about -16 LUFS).
  3. A contact sheet of frames every 3.5 s, saved to out/qc_sheet.jpg. LOOK at it.
  4. With --transcribe: what speech recognition hears, to catch wrong words and spoken stage directions.
     (pip install faster-whisper)
Things only a person can judge: pronunciation, tone, music level. Listen before release.
"""
import json, os, statistics, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import load_project, load_script, load_timing, ff, audio16k

proj = sys.argv[1]; shape = next((a for a in sys.argv[2:] if a in ('land', 'vert')), 'land')
S, T, P = load_script(proj), load_timing(proj), load_project(proj)
print('PACE')
prev, rates = None, []
for sc, tm in zip(S['scenes'], T['scenes']):
    for k, (se, st) in enumerate(zip(sc['sentences'], tm['sentences'])):
        n = len(se['show'].split()); wpm = n / max(0.1, st['e'] - st['s']) * 60
        if n >= 5: rates.append(wpm)
        gap = '' if prev is None else f"pause {st['s'] - prev:4.2f}s" + (' scene' if k == 0 else '')
        flag = '  <- check' if n >= 5 and (wpm < 110 or wpm > 195) else ''
        print(f"  {sc['id']:6} {wpm:4.0f} wpm  {gap:18} {se['show'][:60]}{flag}"); prev = st['e']
if rates:
    print(f"  median {statistics.median(rates):.0f} wpm, spread {statistics.pstdev(rates):.0f}")

name = P.get('name', os.path.basename(os.path.abspath(proj))).replace(' ', '_')
final = os.path.join(proj, 'out', f'{name}_{shape}.mp4')
if os.path.exists(final):
    r = subprocess.run(['ffmpeg', '-i', final, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    i = [l for l in r.splitlines() if l.strip().startswith('I:')]
    print('LOUDNESS', i[-1].strip() if i else 'unknown')
    tile = '6x5' if shape == 'land' else '9x3'
    ff('-i', final, '-vf', f"fps=1/3.5,scale={'384' if shape == 'land' else '180'}:-1,tile={tile}", '-frames:v', '1',
       os.path.join(proj, 'out', 'qc_sheet.jpg'))
    print('CONTACT SHEET out/qc_sheet.jpg')
else:
    print('No final video yet; run assemble.py first for loudness and the contact sheet.')

if '--transcribe' in sys.argv:
    from faster_whisper import WhisperModel
    m = WhisperModel('base.en', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(audio16k(os.path.join(proj, 'audio', 'voice.wav')))
    print('HEARD:', ' '.join(s.text.strip() for s in segs))
