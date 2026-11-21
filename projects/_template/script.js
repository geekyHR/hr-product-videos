// The script. "show" is the caption, "say" is what the voice reads (spell names the way they should sound).
// cues: a word in "say" that an animation waits for. headlineAt: which sentence the headline echoes.
// holds: extra silent seconds after a scene, for content that needs reading time.
window.SCRIPT = {
  "keepTogether": [["HR", "Service", "Desk"], ["HR", "policies"], ["Microsoft", "Teams"]],
  "holds": {},
  "scenes": [
    { "id": "s1", "headlineAt": 1,
      "sentences": [
        { "show": "Leave rules, payslips, onboarding forms.", "say": "Leave rules, payslips, onboarding forms." },
        { "show": "One question, and too many places to look.", "say": "One question, and too many places to look." } ],
      "cues": { "many": "many" } },
    { "id": "s2",
      "sentences": [ { "show": "Meet Ask HR, your HR assistant in Microsoft Teams.", "say": "Meet Ask HR, your HR assistant in Microsoft Teams." } ],
      "cues": { "meet": "Meet" } },
    { "id": "s3",
      "sentences": [
        { "show": "Ask in plain language, and get an answer from the HR policies, with the source.", "say": "Ask in plain language, and get an answer from the HR policies, with the source." } ],
      "cues": { "ask": "Ask", "source": "source" } },
    { "id": "end",
      "sentences": [ { "show": "Ask HR. Your questions, answered.", "say": "Ask HR. Your questions, answered." } ],
      "cues": { "your": "Your" } }
  ]
};
