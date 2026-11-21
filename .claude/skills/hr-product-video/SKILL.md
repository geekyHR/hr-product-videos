---
name: hr-product-video
description: Make narrated product and explainer videos for HR products and programmes (HR chatbots and assistants, policies, onboarding, learning, performance, benefits, wellbeing, HR service desks, people analytics) for an employee audience. Script, brand, voice (ElevenLabs or the user's own recording), music, captions timed to the voice, rebuilt product screens, intro and outro, landscape and vertical. Use when the user asks for an HR product video, launch video, explainer, town hall video, or wants notes applied to one.
---

# HR product video

Narrated product videos for HR, built as code and rendered on the user's computer. The audience is employees, so the
language is professional, plain and articulate, and the organisation's brand guidelines are followed.

This skill was built and tested on a real HR assistant launch video. Every rule in `references/lessons.md` came from a
note the product owner gave. Read it before you build.

## Read first

| When | Read |
|---|---|
| Always, before the script | `references/hr-context.md` (HR areas, audience, tone, sensitive topics) |
| Always, before building | `references/lessons.md` (voice, timing, captions, pronunciation, QC) |
| Before release | `references/qc-checklist.md` |
| A 3D or motion-heavy piece with no narration | the `motion-design` skill in this repository instead |

## Folders

| Folder | What goes there |
|---|---|
| `brand/<org>/` | `brand.js` (colours, font, logos), guidelines PDF, logos, fonts, intro and outro videos |
| `references/` | reference videos, transitions, music, voice samples the user likes |
| `projects/<name>/` | one video: `brief.md`, `script.js`, `scenes.js`, `project.json`, `assets/`, `audio/`, `out/` |
| `.claude/skills/hr-product-video/engine/` | the scene engine (do not edit for one project; copy behaviour into `scenes.js`) |
| `.claude/skills/hr-product-video/tools/` | render, voice, music, assemble, qc |

## Workflow

Work one step at a time. Show the result and get approval before the next step. Changes are cheapest early.

| # | Step | Output | Gate |
|---|---|---|---|
| 1 | Brief | `brief.md`: product, audience, channels, length, regions, approvals, what is live | User confirms |
| 2 | Brand | `brand/<org>/brand.js` from the guidelines (sample colours from the PDF, do not guess) | User confirms |
| 3 | Script | `script.js`: scenes, `show` (captions) and `say` (voice) text | User approves the words |
| 4 | Storyboard | one line per scene: visual, motion, on-screen text, in both shapes if both are needed | User approves |
| 5 | Real content | real product answers and screens, cleaned of personal data | User supplies, you review |
| 6 | Build | `scenes.js`, stills of every scene for review | User approves stills |
| 7 | Voice | `tools/voice.py` (one take), pronunciation samples if any word is unusual | User listens |
| 8 | Music | user's licensed track, or `tools/music.py` | User listens |
| 9 | Render | `tools/render.js`, `tools/assemble.py` | |
| 10 | QC | `tools/qc.py --transcribe`, look at the contact sheet, then the checklist | You check, then the user |

Start a new project by copying `projects/_template` to `projects/<name>`.

## Commands (run from the repository root)

```
node .claude/skills/hr-product-video/tools/render.js projects/<name> land --stills 2,8,15   # review stills
python3 .claude/skills/hr-product-video/tools/voice.py projects/<name>                      # voice + timing.js
python3 .claude/skills/hr-product-video/tools/music.py projects/<name>                      # optional, uses credits
node .claude/skills/hr-product-video/tools/render.js projects/<name> land                   # silent body video
python3 .claude/skills/hr-product-video/tools/assemble.py projects/<name> land              # final video
python3 .claude/skills/hr-product-video/tools/qc.py projects/<name> land --transcribe       # checks
```

## Non-negotiables

- **Only what is live.** No roadmap, no future features, no internal project terms.
- **Only real product output.** Show real answers the product gave, cropped. Never invent an answer. Drop any answer
  that is wrong, contradicts itself, admits it is guessing, or exposes pay grades or other sensitive data.
  Have the content owner confirm what is shown.
- **No real people's data.** Rebuild screens with a fictional employee. No names, photos, chats or contacts from
  the user's account.
- **Brand first.** The organisation's guidelines win over any style idea, unless the user decides otherwise.
- **Text never runs ahead of the voice.** Captions and headlines appear when their words are spoken.
- **Paid tools use the user's credits.** Say what a step will cost before running it. Keys live in `.env`, never in
  files that are committed.
- **Verify before stating** anything about vendors, prices, laws or product features. Say plainly what is unverified.
