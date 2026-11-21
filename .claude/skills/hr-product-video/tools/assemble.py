"""Mix voice and music, then join intro + body + outro into the final video.

    python3 .claude/skills/hr-product-video/tools/assemble.py projects/<name> [land|vert]

Reads project.json:
  "intro": {"file": "brand/<org>/intro-outro/intro.mp4", "trim_to": 4.4}   (optional; trim_to cuts it short)
  "outro": {"file": "brand/<org>/intro-outro/outro.mp4"}                     (optional)
  "transition": 0.6                                                           (crossfade seconds)
  "music_volume": 0.30, "loudness": -16
Writes out/<name>_<shape>.mp4 with empty author and comment metadata.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import load_project, load_timing, duration, ff, REPO

proj = os.path.abspath(sys.argv[1]); shape = sys.argv[2] if len(sys.argv) > 2 else 'land'
P = load_project(proj); T = load_timing(proj)['total']
out_dir = os.path.join(proj, 'out'); tmp = os.path.join(out_dir, 'tmp'); os.makedirs(tmp, exist_ok=True)
voice = os.path.join(proj, 'audio', 'voice.wav')
music = next((os.path.join(proj, 'audio', f) for f in ('music.mp3', 'music.wav') if os.path.exists(os.path.join(proj, 'audio', f))), None)
X = P.get('transition', 0.6); vol = P.get('music_volume', 0.30); lufs = P.get('loudness', -16)

# 1. Voice + music, music ducked under the voice, loudness normalised.
mix = os.path.join(tmp, 'mix.wav')
if music:
    tempo = min(1.0, max(0.85, duration(music) / T))   # stretch slightly only if the track is a little short
    fc = (f"[1:a]atempo={tempo:.4f},atrim=0:{T},asetpts=PTS-STARTPTS,volume={vol},afade=t=in:d=1.0,afade=t=out:st={T - 2.5}:d=2.5,"
          f"aresample=48000,aformat=channel_layouts=stereo[m];[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit[v1][v2];"
          f"[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[md];"
          f"[v1][md]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I={lufs}:TP=-1.5:LRA=11[out]")
    ff('-i', voice, '-i', music, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', mix)
else:
    ff('-i', voice, '-af', f'loudnorm=I={lufs}:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', mix)

body = os.path.join(tmp, f'body_{shape}.mov')
ff('-i', os.path.join(out_dir, f'body_{shape}.mp4'), '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'pcm_s16le', body)

# 2. Intro and outro (landscape files are centre-cropped for vertical).
def prep(cfg, name):
    if not cfg or not cfg.get('file'): return None
    src = os.path.join(REPO, cfg['file']); o = os.path.join(tmp, f'{name}_{shape}.mov')
    vf = 'fps=30,setsar=1' if shape == 'land' else 'crop=ih*9/16:ih,scale=1080:1920:flags=lanczos,fps=30,setsar=1'
    cut = ['-t', str(cfg['trim_to'])] if cfg.get('trim_to') else []
    ff(*cut, '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', o)
    return o

parts = [p for p in (prep(P.get('intro'), 'intro'), body, prep(P.get('outro'), 'outro')) if p]
name = P.get('name', os.path.basename(proj)).replace(' ', '_')
final = os.path.join(out_dir, f'{name}_{shape}.mp4')
inputs = sum([['-i', p] for p in parts], [])
fc, v, a, off = [], '[v0]', '[a0]', 0.0
for k, p in enumerate(parts):
    fc.append(f'[{k}:v]fps=30,format=yuv420p,setsar=1[v{k}];[{k}:a]aresample=48000[a{k}]')
for k in range(1, len(parts)):
    off += duration(parts[k - 1]) - X
    fc.append(f'{v}[v{k}]xfade=transition=fade:duration={X}:offset={off:.3f}[vx{k}];{a}[a{k}]acrossfade=d={X}[ax{k}]')
    v, a = f'[vx{k}]', f'[ax{k}]'
ff(*inputs, '-filter_complex', ';'.join(fc), '-map', v, '-map', a, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
   '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-metadata', 'author=', '-metadata', 'comment=', final)
print(f'wrote {final} ({duration(final):.1f} s)')
