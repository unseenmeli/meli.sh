---
name: meli.sh
description: A personal site in black, bone and a hint of gold. Austere and editorial (after the Bugatti DESIGN.md in VoltAgent/awesome-design-md: near-black canvas, wide-tracked uppercase, mono captions, hairlines, photography as the only colour), made personal by one mark — Meli's back tattoo, traced and mirrored into a gold sigil.

colors:
  black: "#0b0a08"      # canvas
  black-2: "#12100d"
  bone: "#e9dfcc"       # headings, primary text
  bone-2: "#c9bfac"     # body text
  muted: "#8f8676"      # notes, captions
  gold: "#c6a15b"       # the hint: sigil, numbers, underlines, focus
  gold-hi: "#ecd29a"
  gold-lo: "#8a6a32"
  hair: "rgba(233,223,204,.14)"

typography:
  wordmark: Grenze Gotisch 700 — only for "Meli" and the writing column titles
  display: Cormorant Garamond 400, UPPERCASE, tight leading (h1/h2/h3)
  body: JetBrains Mono 400, 15–16px, line-height 1.8
  caption: JetBrains Mono 11–13px, UPPERCASE, letter-spacing .18–.24em

rounded: 0 everywhere
---

## Rules

- Gold is a hint, not a fill: the sigil, numbers, labels, hover underlines, one bordered button. Never a gold background block except link hover in Contact.
- The sigil (`media/index/sigil.svg`) is used through CSS `mask` so it can take the gold gradient. Hero: full size with sheen + pointer glow. Elsewhere: 5–9% ghost watermark or the 30px brand mark.
- The photo (`media/index/back.jpg`) is graded black → umber → gold → bone; it bleeds off the left edge and dissolves into the black — never boxed.
- Sections: roman-numeral label (gold numeral + hairline), one uppercase serif h2, content on hairline rows.
- Hover: underlines draw left→right in gold, rows nudge 8–12px, the photo zooms 1.03. No scroll reveals. Reduced motion stops everything.
- Projects are cards on a 12-column grid (7/5, 5/7, 7/5). Each has a cover (`media/projects/<name>.jpg`, 960×600), a round pfp with a gold ring, a gold meta line, the note and stack chips. Covers sit desaturated and sepia until hover, then show full colour and zoom 1.03; a soft gold light follows the pointer. A project with no picture gets a live panel instead (creating-llm: tokens + a causal attention grid).
- Sub-pages (posts, poems, random) share `style.css`; they get the dark reading column, gold date rule and a ghost sigil.
