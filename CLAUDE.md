# CLAUDE.md

Guidance for working in this repository. Read [ARCHITECTURE.md](ARCHITECTURE.md) for a
deeper description of how the game is structured.

## What this is

**Missão: Estudante Universitário do Futuro** — a single-file HTML5 canvas
side-scrolling platformer built as a recruitment mini-game for the
Universidade do Porto. The player runs through a campus scene collecting
skill ("competência") pickups while dodging "distraction" enemies, against a
120-second timer. All in-game text is **European Portuguese** — keep it that way.

There is no framework, no build step, no package manager, and no dependencies.
The game is plain HTML + CSS + one JavaScript file.

## Files

- `index.html` — page shell, canvas element, on-screen touch controls, loads `game.js`.
- `game.js` — the entire game (~1700 lines): state, input, update loop, and canvas rendering.
- `styles.css` — page layout and responsive/touch-control styling (the canvas itself is drawn, not styled).
- `assets/transparent_elements/` — sprites the game loads at runtime (characters, props, skills, NPCs, UI).
- `assets/transparent_assets.png` — the source spritesheet.
- `tools/extract_transparent_assets.py` — slices `transparent_assets.png` into the individual PNGs under `transparent_elements/` using hardcoded pixel rects, trims alpha, and rewrites `manifest.txt`.
- Other `assets/` subfolders (`npc/`, `cenarios/`) are source/reference art not all wired into the game.

## Running

It's a static site — open `index.html` in a browser, or serve the directory:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Serving (rather than `file://`) is preferred so the sprite images load without
CORS/path surprises. The game degrades gracefully if images are missing — every
asset draw has a hand-coded canvas fallback (see `drawAsset` / the `draw*` helpers).

## Checking your work

There is no test suite. Validate changes by:

```bash
node --check game.js   # syntax check — this is allowlisted
```

Then load the game in a browser and play through the relevant path. Because rendering
is all canvas, there is nothing to lint against the DOM; visual verification is the
real test.

## Regenerating sprites

If you edit `assets/transparent_assets.png` or the crop rects, re-run:

```bash
python3 tools/extract_transparent_assets.py   # requires Pillow (PIL)
```

This rewrites everything under `assets/transparent_elements/` and `manifest.txt`.
Do not hand-edit the extracted PNGs — change the source image or the rects in the script.

## Conventions

- **Portuguese UI copy.** All player-facing strings (titles, toasts, HUD labels) are in European Portuguese.
- **No dependencies.** Don't introduce npm, bundlers, or libraries. Keep it a single static file set.
- **Coordinate spaces matter.** World-space vs. screen-space (camera-translated) is a live source of bugs — see ARCHITECTURE.md. Rendering that scrolls happens inside a `ctx.translate(-state.camera, 0)` save/restore; HUD/overlays are drawn in screen-space.
- **`state` is the single source of truth.** `update()` mutates `state`, `draw()` only reads it. Don't render from input directly or mutate state inside draw functions.
- **Everything is frame-based at 60 fps.** Timers, invincibility windows, and animation phases are counted in frames (e.g. `state.invincible = 120` means ~2 seconds). `state.time` advances by `1/60` per frame.
- **Match the surrounding style.** Existing code uses top-level functions, `const` for config tables, and JSDoc comments on the drawing helpers. Follow that.
- **Versioning & changelog.** The single source of truth for the version is the `GAME_VERSION` constant near the top of `game.js` (shown on-screen on the intro). Every change MUST also update `CHANGELOG.md`: add a new entry at the top with the current date and version, describing the modifications in git-commit-message style. Bump `GAME_VERSION` and keep it in sync with the latest `CHANGELOG.md` entry. Use semantic versioning `MAJOR.MINOR.PATCH`:
  - **MAJOR** (`1.0.0` → `2.0.0`): large or breaking changes — a gameplay overhaul, a rework of the level/scene structure, or anything that fundamentally changes how the game plays or is built.
  - **MINOR** (`0.1.0` → `0.2.0`): a new player-facing feature or notable addition — a new screen, mechanic, level, avatar, or enemy type.
  - **PATCH** (`0.1.0` → `0.1.1`): small changes — bug fixes, copy/visual tweaks, refactors, config edits, or minor UI additions (e.g. adding a version label). Most changes are patches; a change is only MINOR if it adds a distinct new feature.

  When you bump `GAME_VERSION`, also update the `?v=` query on **both** the `game.js` `<script>` tag and the `styles.css` `<link>` in `index.html` to the same version — browsers cache these aggressively, so the query string is what forces players to load the new build.

## Gotchas

- `main()`/loop uses `Math.random()` for particles — fine here, but note the game is not deterministic.
- `imageReady()` guards every image draw because `image.complete` is `true` even for 404s; don't remove those checks.
- The Konami code (`↑↑↓↓←→←→ B A`) toggles an invincible "god mode" — intentional Easter egg, not dead code.
- Config tables at the top of `game.js` (`skillData`, `facultyLevels`, `avatarOptions`, `elementFiles`) drive most content — prefer editing these over hardcoding in the render path.
