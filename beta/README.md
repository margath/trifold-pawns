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

## Systems supported

Generic · D&D 5th Edition · D&D 4th Edition · Daggerheart · Savage Worlds · Cosmere "Plotweaver"

Every system also carries Immunities, Resistances, Vulnerabilities and Skills/Proficiencies.

## Printing

Three independent sheets, each with its own print button:

1. **Pawns** — the foldable standees.
2. **Tracker Tables** — stat blocks with consumable resource boxes beneath each pawn.
3. **Action Cards** — a separate sheet (`page-break-before: always`) listing each
   enemy with its attached cards. Pawn-specific overrides replace the library
   defaults and are marked with `*`.

## Adaptive HP

For high-HP monsters, "Adaptive HP" splits the pool into 10 / 5 / 2 / 1 point boxes
instead of one box per hit point — a 256 HP dragon becomes 61 boxes rather than 256.
Denominations differ by border weight, box size *and* printed number, so they stay
distinguishable on a cheap laser printer.

The distribution is lossless: the boxes always sum to exactly the stated HP total.

## Project files

`Save` writes a `.json` you can reload later. Version 1 files (saved before Action
Cards existed) load without modification — missing fields are filled with blanks.
