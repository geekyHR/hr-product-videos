# HR product videos

This repository makes narrated product videos for HR products and programmes, built as code and rendered on this
computer. The owner is an HR technology leader. The audience of the videos is usually employees.

## How to work here

- For a narrated HR product, launch or explainer video, use the `hr-product-video` skill.
- For a short, music-led motion graphic with no narration, use the `motion-design` skill. Put its project folders in
  `projects/<name>/`, not inside `.claude/skills/`.
- One video = one folder in `projects/`, copied from `projects/_template`. Keep every decision and review note in that
  folder's `brief.md`, so a new session can continue the work.
- Brand settings live in `brand/<org>/brand.js`. Read the organisation's guideline PDF before designing.
- Look in `references/` for reference videos, transitions, music and voices before designing.
- Show the plan and wait for approval before large steps. Say what a paid step (ElevenLabs voice or music) will cost
  before running it.
- API keys live only in `.env` (never commit it). Read them from there; never print them.
- Keep every version of an output (`_v1`, `_v2`, ...). Never delete the user's files.

## Writing style for everything here

- Simple, clear, professional American English. Complete sentences. No jargon, no em dashes, no AI stock phrases.
- On-screen text in sentence case. Captions without punctuation.
- State plainly what you could not check, above all how a voice sounds.

## Setup check (run when a session starts if anything fails)

`node -v` (18 or later), `ffmpeg -version`, `python3 -c "import numpy, PIL"`, Google Chrome installed,
`npm install` done in this folder. Explain any missing step to the user in plain, numbered steps.
