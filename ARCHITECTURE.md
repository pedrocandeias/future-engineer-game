# Architecture

**Missão: Estudante Universitário do Futuro** is a single-file HTML5 canvas
platformer with no framework and no build step. This document describes how the
pieces fit together so you can navigate and modify `game.js` confidently.

## High-level model

The whole game follows a classic **state → update → draw** game loop:

```
loop()                       // game.js:1669, driven by requestAnimationFrame
 ├─ update()                 // mutates `state` based on input + physics
 └─ draw()                   // renders `state` to the canvas (reads only)
```

- `state` is a single mutable object created by `reset()` (game.js:230). It holds the
  game mode, camera, timer, player, skills, distractions, particles, lives, etc.
- `update()` (game.js:419) is the only place `state` is mutated during play.
- `draw()` (game.js:533) only reads `state` and paints; it must not change game state.

Everything is measured in **frames at 60 fps**. `state.time += 1/60` each frame, and
durations like the invincibility window (`state.invincible = 120`) or toast lifetimes
(`ttl`) are frame counts.

## Game modes (the state machine)

`state.mode` drives both update and draw. Transitions:

```
title ──Enter──▶ avatarSelect ──Enter──▶ facultySelect ──Enter──▶ playing
                                                                     │
                                          ┌──────────────────────────┤
                                          ▼                          ▼
                                        won                       gameover
                                          │                          │
                                          └────────Enter─────────────┘
                                                       │
                                                       ▼
                                                    playing  (reset)
```

- **title / avatarSelect / facultySelect** — menu screens; each has its own `draw*` function and its own pointer/keyboard handling.
- **playing** — the main loop runs physics, collisions, timer.
- **won** — all skills collected; freezes gameplay and runs a celebratory particle/NPC animation (`drawWin`, game.js:1444).
- **gameover** — triggered by the timer running out (`gameoverReason: "time"`) or losing all lives to distractions (`"distractions"`).

Mode transitions happen in the input handlers (`goToAvatarSelect`, `goToFacultySelect`,
`resetGameToPlaying`) and at the end of `update()`.

## Coordinate spaces (important)

There are two coordinate systems and mixing them up is the most common bug:

- **World-space** — the full `levelLength` (4200px) scrollable level. The player's `x`,
  skill/distraction/prop positions live here.
- **Screen-space** — the 960×540 canvas. `state.camera` is the world-x of the left edge.

Anything that scrolls is drawn inside a `ctx.save(); ctx.translate(-state.camera, 0); …; ctx.restore()`
block (see `drawLevel`, `drawSkills`, `drawDistractions`, `drawPlayer`). HUD, toasts, menus,
win/gameover overlays, and frame effects are drawn in plain screen-space (no translate).

The camera follows the player at ~36% from the left edge, clamped to the level bounds
(game.js:470).

## Input

Three input sources feed the same logical actions (`left/right/jump/crouch`):

1. **Keyboard** — a global `keys` Set updated on keydown/keyup. Arrow keys, WASD, space.
2. **Touch/pointer** — on-screen buttons in `index.html` (`[data-action]`) set flags in `touchActions`.
3. **Canvas pointer** — taps on menu screens select avatars/faculties and advance modes.

`actionActive(action)` (game.js:410) unifies keyboard + touch so the physics code doesn't
care where input came from. Menu navigation (arrow keys / taps on picker rects) is handled
separately in the keydown and pointerdown listeners.

The Konami code (`cheatBuffer` vs `KONAMI`) toggles `godMode`, an invincibility Easter egg.

## Rendering

All visuals are drawn to a single `<canvas>` with the 2D context — there is no DOM UI
inside the game area. Two rendering strategies coexist:

- **Sprite images** loaded from `assets/transparent_elements/` via `loadAssets()` (game.js:141).
  `assets` holds the character frames, avatar frames, props, and skill icons.
- **Procedural canvas fallbacks** — every prop draw goes through `drawAsset` / `drawAssetBottom`,
  which fall back to a hand-coded `draw*` function (e.g. `drawDoor`, `drawWindow`, `drawPlant`,
  `drawProfessor`) when the image isn't ready. `imageReady()` guards this because a 404'd image
  still reports `complete === true`.

This means the game is fully playable even if no PNGs load — it renders a blocky pixel-art
version entirely from code. `pixelText` / `neonText` render all text; there are no web fonts.

Post-processing (`drawFrameEffects`) adds scanlines and a vignette over every frame for a
retro CRT look.

## Content configuration

Most of the game's content is data-driven by tables at the top of `game.js` — edit these
rather than the render/update logic:

- `skillData` (game.js:15) — the 8 collectible competências: world-x, name, label, icon, image, color.
- `facultyLevels` (game.js:34) — the 15 selectable faculties (label, full name, theme color). Cosmetic; chosen faculty is shown in the HUD.
- `avatarOptions` (game.js:26) — playable/selectable characters (the player sprite plus prop-based avatars with their own frame sets).
- `elementFiles` (game.js:60) — maps logical names to sprite file paths for characters and props.
- `state.distractions` (in `reset()`, game.js:257) — the enemy patrol layout. "Low" distractions (`y = groundY-55`) must be jumped; "high" ones (`y = groundY-105`) must be ducked under.

Global tuning constants live near the top: `W`, `H`, `groundY`, `levelLength`,
`missionTimeLimit`, and physics values inside `update()` (move speed `4.2`, jump `-12`,
gravity `0.62`).

## Core gameplay loop (inside `update`, playing mode)

1. Read actions; apply crouch/stand height changes (only when grounded).
2. Horizontal velocity from left/right; jump sets upward velocity if grounded and not crouching.
3. Apply gravity, integrate position, clamp to level, resolve ground collision.
4. Update camera to follow the player.
5. Collect skills on overlap (`intersects`), fire a toast.
6. Move distractions along their patrol range; on collision (unless invincible/god) lose a life, knock the player back, grant a 2s invincibility window.
7. Check win (all skills taken) / lose (timer expired) conditions and switch mode.

`intersects(a, b)` (game.js:529) is standard AABB overlap and is used for both pickups and hits.

## Assets pipeline

Sprites are sliced from one source spritesheet:

```
assets/transparent_assets.png
        │  tools/extract_transparent_assets.py  (Pillow; hardcoded pixel rects, trims alpha)
        ▼
assets/transparent_elements/**/*.png   +   manifest.txt
```

The game loads the individual PNGs at runtime. To change art, edit the source image or the
crop rects in the script and re-run it — don't hand-edit the extracted files. See
[CLAUDE.md](CLAUDE.md) for the exact command.

## What's intentionally simple

- No collision beyond the ground plane and AABB overlaps — the level is flat.
- No spatial partitioning — entity counts are tiny, so everything is checked linearly each frame.
- No asset loader/ready gate — the loop starts immediately and draws fallbacks until images arrive.
- No persistence, networking, or audio.
