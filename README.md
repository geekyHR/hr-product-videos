# HR product videos

Make product and explainer videos for HR products with Claude Code: script, brand, voice, music, captions, product
screens, intro and outro, rendered on your own Mac.

Owner: Kiran Baby Joseph (geekyHR)

## What is inside

| Folder | What it holds |
|---|---|
| `.claude/skills/hr-product-video/` | The main skill: engine, tools, HR guidance and lessons from a real launch video |
| `.claude/skills/motion-design/` | A skill for short, music-led motion graphics with no narration |
| `brand/` | One folder per organisation: colours, fonts, logos, guidelines, intro and outro |
| `references/` | Reference videos, transitions, music and voice samples |
| `projects/` | One folder per video, with its brief, script, scenes, audio and finished videos in `out/` |

The `.claude` folder is hidden in Finder. Press Command + Shift + . (full stop) in Finder to show it.

## One-time setup on your Mac

1. Install Homebrew. Open Terminal and paste the command from https://brew.sh, then press Return.
2. Install the tools. In Terminal, paste:
   `brew install node ffmpeg python git`
3. Install Google Chrome from https://www.google.com/chrome if you do not have it.
4. Download this repository. In Terminal, paste:
   `cd ~/Documents && git clone https://github.com/geekyHR/hr-product-videos.git && cd hr-product-videos`
5. Install the libraries. In the same Terminal window, paste:
   `npm install && pip3 install -r requirements.txt`
6. Add your ElevenLabs key. In Finder, open the `hr-product-videos` folder, make a copy of `.env.example` and name it
   `.env`. Open it in TextEdit and paste your key after `ELEVENLABS_API_KEY=`. Save. This file never goes to GitHub.
7. Start Claude Code in the folder. In Terminal, paste: `claude`

## Make a video

1. Copy the template: in Terminal, `cp -R projects/_template projects/my-video-name`
2. In Claude Code, say: "Make an HR product video in projects/my-video-name. Start with the brief."
3. Claude walks you through brief, brand, script, storyboard, build, voice, music, render and checks, one step at a
   time, and waits for your approval at each step.
4. The finished video is in `projects/my-video-name/out/`.

## Voice and music options

| Need | Option |
|---|---|
| AI voice | ElevenLabs voice ID in `project.json` (uses your credits) |
| Your own voice | Record the script, save it as `audio/voice_own.wav`, set `"source": "own"` in `project.json` |
| Music | Your own licensed track as `audio/music.mp3`, or ElevenLabs Music (uses credits) |
| Suno | No self-serve public API as of 21 November 2026; make the track on suno.com and save it as `audio/music.mp3` |

## Save your work to GitHub

In Terminal, inside the folder:

```
git add -A
git commit -m "What changed"
git push
```

GitHub blocks any file larger than 100 MiB, and files added through the GitHub website can be at most 25 MiB.
Keep long or 4K masters on your computer or in OneDrive, and push the smaller copies.

## Keep it safe

- This repository is public. Keep company brand files, fonts, intro and outro videos, real product screens and
  briefs on your computer only: add their folders to `.gitignore` before you commit.
- Never paste an API key into a chat or a file other than `.env`.
- Videos show fictional employees only, and only product content its owner has confirmed.

## License

MIT, see `LICENSE`. You may use, change and share this repository freely. The folder `.claude/skills/motion-design/`
is a third-party public skill included as received; it is not covered by this license and keeps its own terms.
