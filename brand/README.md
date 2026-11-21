# Brand folders

One folder per organisation, copied from `_template`:

```
brand/<org>/
  brand.js        colours, font and logo paths (the engine reads this)
  guidelines/     the brand guideline PDF
  logos/          logo files, white and black, PNG or SVG, as large as possible
  fonts/          licensed font files, if the licence allows storing them here
  intro-outro/    the organisation's standard intro and outro videos
```

Before you commit a brand folder, check whether this repository is private and who can see it. Brand files, fonts and
intro and outro videos are often confidential or licensed. If in doubt, keep them on your computer only and add the
folder name to `.gitignore`.
