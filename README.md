# The Tri-Fold Pawn Maker

Foldable paper standees, DM tracker sheets and Action Card references for tabletop RPGs.

**→ [Open the app](index.html)** · Live build: <https://trifold.gameportal.win/beta/>

Built on [Whitebeard's "You've Been Pawned"](https://pwned.whitebeard.blog/).

---

## Contents

- [Files](#files)
- [Running it](#running-it)
- [What it does](#what-it-does)
- [Change history](#change-history)
- [Design decisions worth knowing](#design-decisions-worth-knowing)
- [Privacy](#privacy)

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire application — HTML, CSS and JS in one file. Works standalone. |
| `manifest.json` | PWA metadata (name, icons, colours, display mode). |
| `service-worker.js` | Offline caching. Bump `CACHE_VERSION` on every deploy. |
| `icons/` | App icons, including a maskable 512px variant for Android. |

## Running it

Opening `index.html` directly works for everything except offline install — browsers
refuse to register a service worker on `file://`, so the app detects that and skips
registration rather than logging an error.

To install it as an app, serve the folder over HTTPS (or `localhost`):

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

An **Install App** button appears once the browser signals installability. New
deployments surface a "new version is ready" prompt instead of leaving you on a stale
cached copy.

---

## What it does

**Six systems:** Generic · D&D 5th Edition · D&D 4th Edition · Daggerheart ·
Savage Worlds · Cosmere "Plotweaver". Every system also carries Immunities,
Resistances, Vulnerabilities and Skills/Proficiencies.

**Three independent print sheets**, each with its own button:

1. **Pawns** — the foldable standees.
2. **Tracker** — stat blocks in scannable columns, with consumable resource boxes
   spanning beneath each pawn.
3. **Action Cards** — a separate sheet listing each enemy with its attached abilities,
   pawn-specific overrides applied.

**Adaptive HP** distributes a large pool into 10 / 5 / 2 / 1 point boxes — a 256 HP
dragon becomes 61 boxes instead of 256. The distribution is lossless: boxes always sum
to exactly the stated total.

**Action Cards** are a global library of abilities that pawns attach by reference.
Any field can be overridden per pawn — an alpha with +8 to hit instead of the card's
+5 — without touching the shared card.

---

## Change history

### Round 1 — Systems, Adaptive HP, Action Cards, PWA

- Added **D&D 4th Edition** (HP, Bloodied, Healing Surges, Action Points, Speed;
  AC/Fort/Ref/Will), **Daggerheart** (HP, Stress, Armor Score, Evasion, Hope, Fear,
  three damage thresholds) and **Savage Worlds** (Pace, Parry, Toughness with armour,
  Bennies, Power Points).
- Added Immunities / Resistances / Vulnerabilities / Skills to **all six** systems,
  stored once as `pawn.traits` rather than duplicated into each stat block.
- **Adaptive HP** mode, per pawn, alongside the existing Standard mode.
- **Action Cards**: global library, per-pawn attachment with field-level overrides,
  system-specific field schemas.
- **Separated print sheets** — action cards break to their own page.
- Collapsed the near-identical 5e and Cosmere tracker renderers into one
  config-driven renderer; adding a system became a config entry.
- **PWA**: real manifest, offline service worker with update prompts, generated icon
  set, install button.
- Free text is now escaped before rendering — a pawn named with a `<` previously ate
  the rest of the sheet.
- Backward compatible: v1 project files load with missing fields filled blank.

### Round 2 — Editor drawer, numbered pools, defaults

- **Editor moved to a right-side drawer** instead of expanding under a pawn, so the
  grid no longer reflows while you work. System dropdown leads the panel, since it
  determines every field beneath it. `Esc` closes.
- Savage Worlds **Power Points are numbered** 1..N.
- **HP controls hide where meaningless**: Savage Worlds has no HP stat at all, and
  Daggerheart/Cosmere pools are too small for x1/x5/x10 scaling.
- Default project expanded to eight pawns covering all six systems, both HP modes,
  all three pawn sizes, traits and action cards with overrides — with both sheets
  pre-enabled so a first run shows what the tool does.
- Empty projects show a start-here panel with a **Load the sample encounter** button.

### Round 3 — Print fidelity, imports, compression

- **Pawn labels shrink to fit** their panel. Type size scales with pawn size; if a
  name is still too long at the minimum readable size the name is ellipsised but the
  `#N` is always kept.
- **Section headings moved into `<thead>`** so they can't be orphaned at the foot of
  a page — browsers never break between a header group and its first row. They now
  also reprint atop every page a long table spans.
- Generic pawns got a titled section of their own.
- **Add from JSON** merges another project instead of replacing. Colliding card IDs
  are resolved: identical cards reused, genuinely different ones re-issued a fresh ID
  with that file's attachments redirected.
- **Images are compressed on import** — capped at 1200px, re-encoded to WebP (keeps
  alpha). Skipped when it would make the file larger.

### Round 4 — Page-break integrity

- **Each pawn now occupies its own `<tbody>`**, so its stat row and consumables row
  move as one unit. Previously a page break could land between a monster and its HP
  boxes, stranding them on separate sheets.

### Round 5 — Labelling

- **Icons replaced by text abbreviations** (`AC`, `Init`, `LegRes`, `STR`) and the
  legend removed. Measured against the 7.5in printable width, abbreviations cost
  29–66px more table width — which the `width: 100%` table already had spare in every
  system — while the legend was costing 43–79px of height on *every* page, since it
  repeated. Net ≈17% more monster rows per page.
- Removed the icon machinery this made dead: six SVG maps, three legend arrays and
  five orphaned helper functions (−17 KB).

### Round 6 — Cosmere detail

- Cosmere **action costs became symbols**: `▷` free · `▶`/`▶▶`/`▶▶▶` 1–3 actions ·
  `↻` reaction · `★` special · `∞` at-will. Stored as stable keys, not glyphs.
- **Focus and Investiture became numbered consumption trackers** rather than bare
  numbers in a column.
- Existing Cosmere cards migrate automatically.

### Round 7 — Layout, controls, privacy

- Briefly tried flex "chips" for stats; **reverted to stacked columns** — a tracker is
  read by scanning *down* a column ("did that hit AC 15?"), and chips destroyed that.
  The cramping that prompted the experiment was fixed properly instead: tighter cell
  padding, wrapping values, fixed-width labels so values align vertically.
- **Action cards gained a Cost field** in every system, for abilities that spend from
  a pool — Cosmere Investiture or Focus, Savage Worlds Power Points, Daggerheart
  Stress, 5e legendary actions. Printed highlighted, overridable per pawn.
- **Control bar rebuilt** so it no longer scrolls. Step 1 is now *Add Pawn via…*
  (paste / browse / **blank pawn**) with the base-size dropdown beneath it. Credits
  moved into an About modal.
- **Blank pawn** creation — start from a coloured placeholder with no image file.
- **Privacy ribbon and modal** added.

---

## Design decisions worth knowing

**Tracker layout is columns, not chips.** Each column holds one class of information
(Basic, Legendary, Stats/Saves, Traits) and entries stack vertically inside it, with
fixed-width labels so values align. A column no pawn in that section uses is dropped
entirely; a stat an individual pawn lacks emits no line.

**Adaptive HP boxes are distinguished three ways at once** — border weight, box size
*and* printed number — because border weight alone doesn't survive a cheap laser
printer, which is the actual use case.

**Action card IDs are never positional.** `renderAll` re-sorts pawns by width on every
render, so anything index-keyed would break. Attachments reference card IDs, and the
editor drawer keys off `pawn.isEditing` rather than an index.

**Cosmere action costs store keys, not glyphs.** Storing `▶▶` directly would mean that
changing a symbol later silently orphaned every saved card.

**Ability costs are free text.** The wording varies too much for a structured
amount-and-pool pair — "2 Investiture, 1 Focus", "Mark 1 Stress", "2 legendary
actions".

**1200px image cap** is the point past which extra pixels can't reach paper: pawns
print at 300 DPI on a panel at most 1.25" wide, ~1125px even at the scale slider's 3x
maximum.

### Known limits

- If a single pawn's block is taller than a printed page, the browser will break it
  anyway — `break-inside: avoid` is a strong hint, not a guarantee.
- WebP encoding needs Safari 16+. Older Safari falls back to PNG — still downscaled,
  just less efficiently.
- `▷ ▶ ↻ ★ ∞` render in standard Windows and macOS fonts, but an unusual printer font
  could box-out `↻`. It's a one-line change in `COSMERE_ACTION_COSTS`.

---

## Privacy

The app collects nothing. Everything is processed in your browser; images and projects
never leave your device. There are no accounts, analytics, cookies or browser storage,
and the page loads no third-party scripts, fonts or images.

The one thing outside our control is hosting: the live site is served through
Cloudflare, which as host and CDN may process technical connection data (IP address,
request time, user-agent, bot-mitigation signals) while delivering the page. That
processing is Cloudflare's, described in their
[privacy policy](https://www.cloudflare.com/privacypolicy/).

The in-app **Privacy** ribbon states all of this in full.

---

## Project files

`Save` writes a `.json` you can reload later. Version 1 files — saved before Action
Cards existed — load without modification; missing fields are filled with blanks.
