# Lessons from a real launch video

Each rule below fixed a note from the product owner on an HR assistant launch video. Follow them from the first draft.

## Voice

| Rule | Why |
|---|---|
| Record the whole script in ONE request | Sentence-by-sentence recording restarts the tone each time and sounds jarring |
| No mood tags like [excited] or [warmly] | Each tag shifts the tone; across a script it sounds uneven |
| Excitement comes from wording and punctuation | One exclamation mark at the right moment is enough |
| Write lists with commas, not full stops | "Leave policy, travel rules, notice period" flows; full stops make it slow and choppy |
| No "..." for pauses | It slows the opening and sounds hesitant |
| Slow rushed sentences gently, at most about 14 percent | Above about 180 words per minute sounds hurried; a small slow-down keeps the voice natural |
| Add about 0.6 s of silence at each scene change | The picture settles first, then the voice comes in |
| Hold a scene with no voice when the screen needs reading time | A table or a sixth tile that appears on the last word needs 1 to 3 extra seconds |
| Pick the voice by listening, then check its description | A voice described as "calm baritone" will not sound excited, whatever the settings |
| `eleven_v3` was more natural than `eleven_multilingual_v2` in a single take | v2 was faster and no steadier |

## Pronunciation

- Spell product names for the voice the way they should sound, and keep them as one unit:
  "Zense-AI-Neo" with hyphens. "A.I." with full stops made the voice pause as if the sentence ended.
- Write "AI" and "HR" without full stops.
- For a word with two pronunciations (live, read, lead), pick a phrase where only one reading fits:
  "is now live" was read correctly; "Now live" was not, and "lyve" did not fix it.
- When unsure, make a short sample with three or four options and let the user choose by ear. It costs a few
  hundred credits and saves a full re-record.
- Speech recognition can confirm that words are present and catch spoken stage directions, but it cannot judge
  pronunciation. Only a person can.

## Text and captions

| Rule | Why |
|---|---|
| A headline appears when its words are spoken, not when the scene starts | Text ahead of the voice feels like the video is out of sync |
| If the headline echoes a later sentence, set `headlineAt` | Otherwise it appears a sentence early |
| Labels, cards and end-card lines also wait for their words | The same problem in a different place |
| Captions: one line, short phrases, timed to the first spoken word of each phrase | A full sentence on screen is read ahead of the narrator and wraps into the design |
| No punctuation in captions | The user found commas and full stops distracting while the narration runs |
| Keep set phrases together (`keepTogether`) | "HR / Service Desk" or "Microsoft 365 / Copilot" split across lines looks careless |
| A short trailing word joins the line before | "answered" alone on a line looks orphaned |
| No highlight boxes or coloured marks on captions in the final video | Useful in tests to check sync; distracting in the final |

## Screens and assets

- Rebuild product screens in code with a fictional employee. Never crop the user's real screenshots.
- Keep the product's real look (dark mode, layout), so employees recognise it.
- Cutting an avatar out of a white background: remove the white connected to the border AND enclosed white patches
  (under an arm, between hair and shoulder), keep the shirt, then shrink the edge by 2 pixels to remove the halo.
  Check it on the dark background before using it.
- The brand intro can be trimmed (the user removed a "life at the company" section). End it on a clean frame and
  dissolve into the first scene; a hard cut felt jerky.
- If a logo file will not open (a damaged .ai), use the largest PNG; trace a vector from it only if needed.

## Process

- Build one test scene in both shapes before building everything.
- Render stills of every scene and look at them before rendering the full video.
- After the voice is recorded, check: pace per sentence, the pause at each scene change, a transcript, frames
  around each scene's first word (text must not be visible half a second before).
- Change timing by re-using the cached recording (no credits). Change words only with a new recording.
- Keep every version (v1, v2, ...). The user compares them.
- Be honest about what you could not check, above all how the voice sounds.

## Own voice

- With `"source": "own"`, word timing comes from speech recognition. In testing it was up to about 1.4 seconds
  later than the true timing, never earlier, so text never runs ahead of the voice, but a headline can feel late.
  Check stills around each scene's first word, and use a larger recognition model (`"whisper_model": "small.en"`)
  if the timing feels off.
- Record in a quiet room, one take, at a steady pace. Say the script exactly as written; changed words reduce timing accuracy.
