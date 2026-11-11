# Change log: Tri-Fold Pawn Maker beta (overhead tokens)

Based on `beta/` of github.com/margath/trifold-pawns. Files changed: `index.html`, `README.md`, `service-worker.js` (cache version bumped to `trifold-v2026.11.10.01`).

## Added

### Overhead tokens (toppers)
- Optional round token per pawn, sitting on top of the trifold standee for top-down map views.
- Defaults to the same image as the standee, with **zoom, rotate and pan** (sliders, drag on the token, scroll wheel).
- Token background colour and a colour ring in the pawn's colour.
- **Size:** "Fits standee top" (circle circumscribes the pawn's triangular top, so its corners sit on the rim) or "Flat disc".
- **Cut line** (solid, just outside the ring) and **fold lines** (dashed triangle matching the standee top; three round flaps fold down over the sides). Fold lines can be switched off per pawn.
- **Global on/off toggle** for all tokens, plus a per-pawn checkbox.

### Spine & foot (the "I")
So the topper lifts the pawn when picked up:
- One strip with four numbered folds, printed beside each fold line:
  1. fold back 180 degrees under the token so it runs in to the middle of the circle;
  2. turn 90 degrees so the spine hangs straight down the middle of the pawn;
  3. turn 90 degrees onto the floor;
  4. fold the foot back under that strip (opposite way), so the spine stands in the middle of the foot.
- Spine is 0.4 x the pawn's base width; each run has 0.04" of slack so the folds don't bind.
- Foot is an equilateral triangle, same way up as the pawn's footprint, reaching 0.05" past it on every side. It is wider than the inside of the pawn, so fold it in half to drop it through the top (or thread the spine before the pawn's last seam).
- Global "with spine & foot" checkbox and a per-pawn "Spine & foot" checkbox; drawer help lists the assembly steps.

### Name and number on the topper
- Name wraps round the top of the circle, inside the colour ring, on a white band.
- Number ("#3") sits in the lower right, just above the triangle's bottom side, on a white pill, so it stays visible after the flaps fold down.
- Long names shrink, then are shortened with "...", and the number is always kept.
- Per-pawn "Name & number" checkbox (saved with the project).

### Printing and paper
- Checkboxes for which sheets print: **Standees, Overhead tokens, GM summary sheets, Power cards**.
- **Paper size** and **portrait / landscape** options; Word and OpenDoc exports follow the chosen paper.

### Bulk naming dialog
- After adding images from files (Browse or drag and drop), a dialog lists each new pawn with a thumbnail, **name**, **number** and **system**. Pasted images skip it.
- **System for all** sets every row at once; each row can still differ. The last system picked is remembered (this browser) and used for the next batch.
- Edits apply as you type; Enter moves down the list; **Done** closes it.
- New footer button **Names, numbers & system...** (under *Add Pawn via*) opens the same list for every pawn in the project.

## Changed
- **Printed pieces are centred and spread evenly:** standee strips and overhead tokens are centred on the sheet, and when they run to several columns they are spread evenly across the page width (a short last row is centred too). The Word and OpenDoc exports do the same, using rows of equal-width cells.
- **Saved project files** now start with a `_note` line saying the file is meant to be loaded at https://trifold.gameportal.win (Load, or Add JSON to merge). Loaders ignore it, and older files without it still load.
- **Glue tab** (with optional QR) moved to the **left end** of the pawn strip, so it glues under the back panel's far edge.
- **Importing images from files** now names each pawn after its file (extension removed, underscores read as spaces). Pasted images stay unnamed.

## Fixed
- Editing an action card no longer loses focus after every keypress: the card editor is no longer rebuilt while you type.
- Page headers no longer bleed onto earlier printed pages: every sheet starts a fresh page.
- Overhead tokens no longer throw printing out of sync: they print on their own sheet.

## Saved projects
- New per-pawn fields: overhead settings (`overhead`, `ovScale`, `ovRotation`, `ovOffsetX`, `ovOffsetY`, `ovBg`, `ovSize`, `ovFold`, `ovLabel`, `ovSpine`) and project-level `showOverhead`, `showSpine`, `printStandees`, `paper`, `orientation`.
- Older project files still load; missing fields take their defaults.

## Not tested
- Nothing has been folded from printed paper yet; print and test one token before cutting a set.
