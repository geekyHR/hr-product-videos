"""Shared helpers: project settings, the script, the API key and ffmpeg."""
import json, os, re, subprocess

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))


def load_project(proj):
    """project.json holds the settings for one video."""
    with open(os.path.join(proj, 'project.json')) as f:
        return json.load(f)


def load_script(proj):
    """script.js is `window.SCRIPT = {...};` so the page and Python read the same file."""
    src = open(os.path.join(proj, 'script.js')).read()
    return json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))


def load_timing(proj):
    src = open(os.path.join(proj, 'timing.js')).read()
    return json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))


def api_key(name='ELEVENLABS_API_KEY'):
    """Read the key from the environment or from the .env file at the repository root. Never commit .env."""
    if os.environ.get(name):
        return os.environ[name].strip()
    env = os.path.join(REPO, '.env')
    if os.path.exists(env):
        for line in open(env):
            if line.strip().startswith(name + '='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit(f'{name} not found. Copy .env.example to .env and paste your key there.')


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True).stdout
    return float(out.strip())


def ff(*args):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *args], check=True)


def audio16k(path):
    """Decode any audio file to 16 kHz mono float32 with ffmpeg (avoids library version problems in speech recognition)."""
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
