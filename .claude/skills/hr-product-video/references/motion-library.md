# Motion templates (E.fx)

`engine/motion.js` adds seven reusable motion templates to the engine. They are original code written for this
repository with GSAP. Load `motion.js` after `engine.js` (the template project already does). See them all in
`projects/_motion-demo` (render it with `node .claude/skills/hr-product-video/tools/render.js projects/_motion-demo land`).

Time every template to the voice: pass `at: cue(id, 'word')` or `sentence(id, j).s`, never a guess.

| Template | Use it for | HR example |
|---|---|---|
| `bigType` | one-word moments | "Live", "Ask", "Grow" at a launch |
| `textReveal` | a key line, word by word; `*word*` is bold | "Built for *every* employee." |
| `cardFan` | many items in one place | HR areas, benefits, learning paths |
| `photoCollage` | people and moments | a wall of fictional placeholders or approved photos |
| `numberRoll` | one figure | adoption numbers, only real and approved |
| `focusCards` | walking through steps or options | ask, read, check, escalate |
| `wipe` | a section change | before the end card; not on every scene |

Rules: no real employee photos without consent; numbers must be real and approved; one strong template per scene.

## Inspiration links (look, do not copy)

Study these for motion ideas only. Do not paste their code into this repository: their licences differ, and some
forbid republishing their work as a motion pack. Check each licence before using any code in your own project.

- jiro.build: a library of AI-ready website designs and prompts.
- ui.aceternity.com: animated React components under the Aceternity licence.
- transitions.dev: CSS UI transitions under a custom licence that limits redistribution.
- obsidianui.dev: animated React components.
- header.design: website header inspiration.
