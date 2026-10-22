# The Tri-Fold Pawn Maker

Foldable paper standees, DM tracker sheets and Action Card references for tabletop RPGs.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire application — HTML, CSS and JS in one file. Works standalone. |
| `manifest.json` | PWA metadata (name, icons, colours, display mode). |
| `service-worker.js` | Offline caching. Bump `CACHE_VERSION` on every deploy. |
| `icons/` | App icons, including a maskable 512px variant for Android. |

## Running it

**Just opening `index.html`** works for everything except offline install. Browsers
refuse to register a service worker on `file://`, so the app detects that and skips
registration instead of logging an error.

**As an installable PWA**, serve the folder over HTTPS (or `localhost`):

```bash
# local test
python3 -m http.server 8000
# then visit http://localhost:8000
```

An **Install App** button appears in the header once the browser signals the app is
installable. When a new build is deployed, an "A new version is ready" prompt appears
rather than leaving you on a stale cached copy.

## Editing pawns

The editor slides in from the **right side of the window** rather than expanding
underneath a pawn, so the grid never reflows while you work and the pawn stays
visible beside its own settings. One pawn is open at a time; `Esc` closes it.

Panel order follows dependency: **System** first (it decides which stat fields exist),
then Name/Number, stats, traits, Action Cards, appearance, and image position.

## Overhead tokens

For play on a map viewed from above, pawns can have a **round overhead token** that
goes on top of the standee.

- **Project-wide switch:** tick **Overhead tokens** under *Sheets to print* in the
  footer (off by default). While it is off no tokens show, print or export, but every
  pawn's token settings are kept, so switching back on restores them. The setting is
  saved in the project file. Each pawn also has an **Overhead token for this pawn**
  checkbox in its editor, to opt a single pawn out. (With the switch off, that section
  of the editor offers a *Turn on overhead tokens* button instead.)
- **Same picture as the standee**, fitted inside the circle. **Zoom**, **Rotate**,
  **X-Pos** and **Y-Pos** sliders reframe it (each has a reset button). You can also
  **drag the token on the page to pan** and **scroll over it to zoom**; the sliders
  follow along. Pan is a percentage of the token's diameter, so it means the same at
  every pawn size. **Token bg** fills behind transparent PNGs.
- **Cut and fold lines:** the **solid line is the cut**; the **dashed triangle is the
  fold**. The folded standee has an equilateral-triangle top whose side equals the
  base width. At the default **Fits standee top** size the token's diameter is
  2/&radic;3 x the base width (about 1.15" for a Medium pawn), which is the circle that
  exactly circumscribes that triangle. The triangle's corners land on the rim, so the
  three round flaps meet only at the corners and fold down along the dashed lines with
  no slits needed. Fold them over the outside, or tuck them inside the standee's top
  for a cleaner look. The triangle is fixed on the token; the Rotate slider turns the
  picture only.
- **Spine & foot (the "I"):** a topper that only sits on the standee's top edges can
  knock off. With **Spine & foot** the printed token becomes an I: the round token is the
  top bar, a **spine** runs down the middle of the pawn, and a **foot** under the pawn is
  the bottom bar. Lift the topper and the pawn, resting on
  the foot, comes with it. It is on by default for fitted tokens, switched off for the
  whole project with the **with spine & foot** checkbox under *Overhead tokens* in the
  footer, and off for a single pawn with **Spine & foot** in its editor. It needs the
  *Fits standee top* size, so a flat disc never has one.
  - To assemble: cut out the whole I (round token, spine and foot in one piece, including
    the two short slits beside the spine) and crease the dashed lines. It is one strip with
    four numbered folds: **1** folds the strip back 180° under the token so it runs in
    towards the middle of the circle; **2** turns it 90° so it hangs straight down the
    middle; **3** turns it 90° onto the floor; **4** folds the foot back under that strip
    (the opposite way to the others), so the spine stands in the middle of the foot. Then
    fold the foot in half down its centre, drop it through the top of the pawn and let the
    token settle on top (or thread the spine through before the pawn's last seam if it
    isn't glued yet), flatten the foot under the pawn, and fold the token's flaps down.
  - Sizes, all relative to the pawn's base width **B**: the spine is 0.4 B wide, and every
    run is 0.04" longer than it needs to be so the folds don't bind. The foot is an
    equilateral triangle, the same way up as the pawn's footprint, reaching 0.05" past it on
    every side; being wider than the inside of the pawn it can't pull back up through it.
  - The spine and foot are plain paper, tinted with the pawn's colour, with instructions
    printed on them that end up hidden inside the pawn. The token on screen becomes
    taller (about 3.4" for a Medium pawn). Project files saved before this existed load
    with the spine and foot on.
- **Flat disc (1x base)** is a plain round token with no fold lines, for use as a loose
  marker. The **Fold lines** checkbox hides the dashed triangle on a fitted token.
- On screen each token sits beside its pawn so you can edit it. When printing, the
  tokens are gathered onto a **sheet of their own** after the standees, packed tightly,
  so they never push the standee strips around. They are included in the Word and
  OpenDoc exports too (on a page of their own).
- Token settings are copied by Copy/Paste Style and carried over by Duplicate. Project
  files saved before tokens existed load with tokens off.

## Systems supported

Generic · D&D 5th Edition · D&D 4th Edition · Daggerheart · Savage Worlds · Cosmere "Plotweaver"

Every system also carries Immunities, Resistances, Vulnerabilities and Skills/Proficiencies.

## Printing

Tick the sheets you want under **3. Sheets to print** in the footer, choose a paper
size and orientation under **4. Paper & Print**, then press **Print** (or use the
browser's own Ctrl/Cmd+P, which gives the same result).

| Checkbox | Sheet |
| --- | --- |
| **Standees** | The foldable standee strips. |
| **Overhead tokens** | The round tokens, gathered on one sheet (see above). |
| **GM summary sheet** | The stat tracker: stat blocks with consumable resource boxes beneath each pawn. |
| **Power cards** | The Action Card reference, listing each pawn with its attached cards. Pawn-specific overrides replace the library defaults and are marked with `*`. Skipped (with a note) when no pawn has a card attached. |

- **Every checked sheet starts on a fresh page**, and the sheets print in the order
  above. Nothing shares a page with another sheet, so a sheet's heading can no longer
  end up underneath the previous sheet's content.
- **Standees** is a print-only switch: the standees always stay on screen, because that
  is where you edit them. The other three checkboxes also show or hide their sheet on
  screen.
- **Paper:** Letter, Legal, Tabloid (11 x 17 in), A4 or A3, in portrait or landscape.
  The on-screen sheet changes shape to match, so the preview wraps the way the printout
  will. Margins are 0.5 in. Your choice is remembered in this browser and saved in the
  project file; opening an older project file leaves your current choice alone.
- The **Word (.doc)** and **OpenDoc (.odt)** exports contain the two image sheets
  (standees, then tokens on their own page) and follow the **Standees**, **Overhead
  tokens** and paper settings. The tracker and cards sheets are print-only.

## Adaptive HP

For high-HP monsters, "Adaptive HP" splits the pool into 10 / 5 / 2 / 1 point boxes
instead of one box per hit point — a 256 HP dragon becomes 61 boxes rather than 256.
Denominations differ by border weight, box size *and* printed number, so they stay
distinguishable on a cheap laser printer.

The distribution is lossless: the boxes always sum to exactly the stated HP total.

The HP controls only appear where they mean something. Savage Worlds has no HP stat
at all (Wounds and Fatigue are fixed-length tracks), so neither control shows.
Daggerheart and Cosmere keep Standard/Adaptive but hide the x1/x5/x10 box scaling,
since their pools are already small. A previously saved scale value is preserved even
while the control is hidden.

Savage Worlds **Power Points are numbered** (1..N) — pools run to 15-20, and unnumbered
squares are unreadable mid-fight. Bennies stay blank, since three boxes need no labels.

## Empty projects

With no pawns loaded you get a start-here panel including a **Load the sample
encounter** button. That sample is also what loads on first run: eight pawns spanning
all six systems, all three pawn sizes, both HP modes, traits, and Action Cards with
per-pawn overrides — with both output sheets already enabled so the tracker and card
reference are visible immediately.

## Project files

`Save` writes a `.json` you can reload later. Version 1 files (saved before Action
Cards existed) load without modification — missing fields are filled with blanks.
