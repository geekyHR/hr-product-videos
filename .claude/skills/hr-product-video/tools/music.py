"""Background music for a project.

    python3 .claude/skills/hr-product-video/tools/music.py projects/<name>

If you already have a licensed track, put it at audio/music.mp3 (or .wav) and skip this script.
Otherwise this generates one with ElevenLabs Music, a little longer than the body, from the prompt in
project.json -> "music" -> "prompt". Uses your ElevenLabs credits. Check that your plan's licence covers
how the video will be used (internal, external, clients).

Suno: as checked on 21 November 2026, Suno has no self-serve public API. Its developer access is an
invite-only partner programme announced on 1 July 2026. Third-party "Suno API" services are unofficial;
do not use them for company work. Make the track on suno.com (check your plan covers the use) and save
it as audio/music.mp3. Re-check this if Suno launches a public API.
"""
import json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from common import load_project, load_timing, api_key

proj = sys.argv[1]
P = load_project(proj)
M = P.get('music', {})
out = os.path.join(proj, 'audio', 'music.mp3')
if os.path.exists(out) and os.path.getsize(out) > 0 and '--force' not in sys.argv:
    raise SystemExit('audio/music.mp3 already exists. Add --force to make a new one.')
length = load_timing(proj)['total'] + 2
prompt = M.get('prompt', 'Warm, optimistic, modern corporate background music. Soft piano, light plucked synths, gentle pulse, '
                         'about 105 BPM. No vocals. Sits under a narrator, a small lift in the last third, clean resolved ending.')
body = {'prompt': prompt, 'music_length_ms': int(length * 1000), 'model_id': M.get('model', 'music_v1')}
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', data=json.dumps(body).encode(),
                             headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
print(f'generating {length:.0f} s of music...')
data = urllib.request.urlopen(req, timeout=600).read()   # download first, so a failed request leaves no empty file
open(out, 'wb').write(data)
print('wrote', out)
