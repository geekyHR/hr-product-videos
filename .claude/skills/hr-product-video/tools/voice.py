"""Make the voice-over and the timing file for a project.

    python3 .claude/skills/hr-product-video/tools/voice.py projects/<name>

Two sources, set in project.json -> "voice":
  "source": "elevenlabs"  The whole script is recorded in ONE request, so it flows like one speaker.
                          Needs ELEVENLABS_API_KEY in .env. Uses your credits (about 1 credit per character).
  "source": "own"         Your own recording at audio/voice_own.wav (or .mp3/.m4a). Word timing comes from
                          speech recognition (pip install faster-whisper). No credits used.

Writes audio/voice.wav and timing.js. The raw take and its timing are cached in audio/, so changing
pauses, holds or pace re-uses the recording and costs nothing. Changing the words needs a new recording.
"""
import base64, difflib, json, os, re, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from common import load_project, load_script, api_key, ff, audio16k

proj = sys.argv[1]
P, SCRIPT = load_project(proj), load_script(proj)
V = P.get('voice', {})
SC = SCRIPT['scenes']
LEAD, GAP, TAIL = V.get('lead', 0.4), V.get('scene_gap', 0.6), V.get('end_tail', 1.8)
HOLDS, MIN_SCENE = SCRIPT.get('holds', {}), V.get('min_scene', 2.4)
TARGET_WPM, MAX_SLOW = V.get('target_wpm', 178), V.get('max_slow', 0.86)
audio = os.path.join(proj, 'audio'); os.makedirs(audio, exist_ok=True)
bare = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())

# One continuous text, with the position of every sentence.
text, spans = '', []
for i, s in enumerate(SC):
    for j, se in enumerate(s['sentences']):
        if text: text += ' '
        spans.append((i, j, len(text), len(text) + len(se['say']))); text += se['say']
tokens = [(m.group(), m.start(), m.end()) for m in re.finditer(r'\S+', text)]   # spoken words with char positions


def words_from_chars(cs, ce):
    out = []
    for w, a, b in tokens:
        idx = [k for k in range(a, b) if text[k].isalnum()]
        if idx: out.append((w, cs[idx[0]], ce[idx[-1]], a))
    return out


def align(src, dst):
    """Give each dst word a time from src words (difflib); unmatched runs share their span evenly."""
    sm = difflib.SequenceMatcher(None, [bare(x[0]) for x in src], [bare(x) for x in dst], autojunk=False)
    times = [None] * len(dst)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            for k in range(b1 - b0): times[b0 + k] = (src[a0 + k][1], src[a0 + k][2])
        elif op in ('replace', 'insert') and b1 > b0:
            s0 = src[a0][1] if a0 < len(src) else (times[b0 - 1][1] if b0 else 0)
            e0 = src[a1 - 1][2] if a1 > a0 else s0 + 0.3 * (b1 - b0)
            n = b1 - b0
            for k in range(n): times[b0 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
    for k in range(len(times)):   # fill any gaps from neighbours
        if times[k] is None: times[k] = times[k - 1] if k else (0, 0.3)
    return times


raw = os.path.join(audio, 'voice_raw.wav')
cache = os.path.join(audio, 'voice_alignment.json')
if V.get('source', 'elevenlabs') == 'own':
    own = next((os.path.join(audio, f) for f in os.listdir(audio) if f.startswith('voice_own.')), None)
    if not own: raise SystemExit('Put your recording at audio/voice_own.wav (or .mp3 / .m4a).')
    ff('-i', own, '-ar', '44100', '-ac', '1', raw)
    from faster_whisper import WhisperModel
    m = WhisperModel(V.get('whisper_model', 'base.en'), device='cpu', compute_type='int8')
    segs, _ = m.transcribe(audio16k(raw), word_timestamps=True)
    heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    t_said = align(heard, [w for w, _, _ in tokens])   # map recognised words onto the script's words
    said = [(tokens[k][0], t_said[k][0], t_said[k][1], tokens[k][1]) for k in range(len(tokens))]
else:
    if os.path.exists(cache) and json.load(open(cache)).get('text') == text and os.path.exists(raw):
        al = json.load(open(cache))['alignment']; print('re-using the cached recording (no credits used)')
    else:
        model = V.get('model', 'eleven_v3')
        vs = V.get('settings') or ({'stability': 0.5, 'similarity_boost': 0.8} if model == 'eleven_v3'
                                   else {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.3, 'use_speaker_boost': True})
        body = {'text': text, 'model_id': model, 'voice_settings': vs}
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{V['voice_id']}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(body).encode(), headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
        print(f'recording {len(text)} characters with ElevenLabs ({model})...')
        res = json.load(urllib.request.urlopen(req, timeout=300))
        mp3 = os.path.join(audio, 'voice_raw.mp3'); open(mp3, 'wb').write(base64.b64decode(res['audio_base64']))
        ff('-i', mp3, '-ar', '44100', '-ac', '1', raw)
        al = res['alignment']; json.dump({'text': text, 'alignment': al}, open(cache, 'w'))
    assert ''.join(al['characters']) == text, 'alignment text differs from the script'
    said = words_from_chars(al['character_start_times_seconds'], al['character_end_times_seconds'])

# Sentence times in the raw take.
def sent_words(a, b): return [w for w in said if a <= w[3] < b]
sent = {(i, j): sent_words(a, b) for i, j, a, b in spans}
order = [(i, j) for i, s in enumerate(SC) for j in range(len(s['sentences']))]
first = lambda k: sent[k][0][1]; last = lambda k: sent[k][-1][2]
mids = [0.0] + [(last(order[k]) + first(order[k + 1])) / 2 for k in range(len(order) - 1)] + [last(order[-1]) + 0.3]

# Build the output: a pause at each scene change, gentle slowing of rushed sentences, holds for on-screen content.
pieces, timing, t = [], [], 0.0
for i, s in enumerate(SC):
    start = t; pre = LEAD if i == 0 else GAP
    pieces.append(('sil', pre)); t += pre
    sents, cues = [], {}
    for j, se in enumerate(s['sentences']):
        k = order.index((i, j)); a, b = mids[k], mids[k + 1]; ws = sent[(i, j)]
        n_words = len(se['show'].split()); wpm = n_words / max(0.1, ws[-1][2] - ws[0][1]) * 60
        f = max(MAX_SLOW, min(1.0, TARGET_WPM / wpm)) if n_words >= 5 else 1.0
        to = lambda x, a=a, f=f, t=t: t + (x - a) / f
        show = align([(w, s0, e0) for w, s0, e0, _ in ws], se['show'].split())
        sents.append({'s': round(to(ws[0][1]), 3), 'e': round(to(ws[-1][2]), 3),
                      'words': [{'w': w, 's': round(to(x[0]), 3), 'e': round(to(x[1]), 3)} for w, x in zip(se['show'].split(), show)]})
        for key, word in s.get('cues', {}).items():
            if key in cues: continue
            hit = next((w for w in ws if bare(w[0]) == bare(word)), None)
            if hit: cues[key] = round(to(hit[1]), 3)
        pieces.append(('seg', a, b, f)); t += (b - a) / f
    extra = HOLDS.get(s['id'], 0.0) + (TAIL if i == len(SC) - 1 else 0.0)
    pad = max(0.0, MIN_SCENE - (t - start + extra))
    if extra + pad: pieces.append(('sil', extra + pad)); t += extra + pad
    timing.append({'start': round(start, 3), 'dur': round(t - start, 3), 'sentences': sents, 'cues': cues})
    print(f"{s['id']:6} {t - start:5.2f}s")

total = round(t, 3)
open(os.path.join(proj, 'timing.js'), 'w').write('window.TIMING = ' + json.dumps({'scenes': timing, 'total': total}) + ';\n')
flt, lab = [], []
for k, p in enumerate(pieces):
    if p[0] == 'sil': flt.append(f'aevalsrc=0:d={p[1]:.3f}:s=44100[p{k}]')
    else:
        _, a, b, f = p
        flt.append(f'[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS' + (f',atempo={f:.4f}' if f < 1 else '') + f'[p{k}]')
    lab.append(f'[p{k}]')
flt.append(''.join(lab) + f'concat=n={len(pieces)}:v=0:a=1[out]')
ff('-i', raw, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', '-ac', '2', os.path.join(audio, 'voice.wav'))
print(f'voice and timing written. Body length {total} s')
