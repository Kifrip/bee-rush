# Bee Rush QA report

Environment: Node 24.22.1, Vite 7.3.8, Phaser 3.90.0, installed Chromium on managed Linux. Browser automation uses Game Creator's `scripts/browser-test.mjs` and `scripts/cdp.mjs` against the **production `dist/` build**, served by Vite preview. Desktop: 1440×1080. Emulated mobile: 393×851, touch enabled, DPR 2. Rotation/resize: 851×500.

## Results
- Production build: **PASS**. Vite reports the expected large Phaser vendor chunk (~1.21 MB, ~332 KB gzip); the app chunk is ~24 KB. No build error.
- Pure rules: **4/4 PASS**.
- Production browser scenarios: **18/18 PASS** (nine scenarios, each desktop and mobile).
- A release follow-up reruns the affected boot/input/pause/resize/audio scenarios after the final rotation correction. Logs are in `qa/release-smoke.log`.

Verified:
1. Game boots immediately with three hearts, 15 flowers, two hornets, and a 60-second timer; no uncaught browser errors.
2. Keyboard movement changes the bee's position; diagonal input is normalized in the input abstraction.
3. Genuine Arcade flower overlaps award points; three consecutive flowers produce the correct 2× tier and 40 total points; depleted flowers regrow.
4. Genuine hornet overlaps damage the bee; immunity blocks immediate repeats; zero hearts shows results.
5. Three complete death/restart cycles reset score/health/time/enemies and retain stable listener counts on each viewport.
6. Pause freezes the clock; resume advances it. Mute and personal best persist after reload.
7. At 15 seconds the next tier appears; at 45 seconds five faster hornets are present; the 60-second boundary finishes the harvest. These boundary checks place the state clock near thresholds rather than waiting a whole minute.
8. Pointer joystick works with mouse on desktop and actual CDP touch-start/move/end events on mobile. Release brakes the bee.
9. Without input, real hornet pursuit ends in a loss with zero nectar on both viewports.
10. Resize preserves the round and does not overflow horizontally. Final regression asserts canvas aspect and camera width agree with the logical viewport.
11. User interaction activates Web Audio. An analyser detects a nonzero generated music signal; mute reduces that signal to silence.
12. World boundaries contain the bee. The active round clock advances at wall-clock pace. Runtime request audit finds no external HTTP requests.

## Visual inspection and fixes
Captured and read garden, results and resized landscape PNGs in `qa/screenshots/`. Inspected palette, sprite readability, feedback, panel hierarchy, touch layout and result buttons. See `qa/visual-review.md`.

Problems found and fixed during QA:
- A flower could initially overlap the stationary bee, awarding idle points. Flowers now spawn clear of the player.
- Slow frames could lengthen rounds. Active time now uses a monotonic clock, separately from capped movement delta; pause resets the clock reference.
- Release could leave a tiny residual velocity. Braking now snaps near-zero movement to zero.
- Unsupported button glyphs replaced with reliable text.
- Portrait-to-landscape resizing could distort the canvas/camera. Scale.FIT now uses setGameSize with camera resizing, plus regression assertions.
- Test harness issues corrected: shared-profile storage is cleared at scenario start; keyboard.press uses `d` rather than `KeyD`; assertions wait for in-game cooldowns, and listener counts are compared to the starting baseline. No failing test was removed to hide a game defect.

## Checks not executed
- Physical iOS/Safari, Android devices, Firefox and browser-specific audio policies outside Chromium.
- Human listening quality / comfort, subjective fun and accessibility screen-reader playthrough.
- GPU-specific benchmarks or a claimed minimum FPS on low-end hardware.
- GitHub Pages deployment: **intentionally not run**. Configuration is manual-dispatch only. No monetization or paid service was used.

The timer/end-boundary test is accelerated; an uninterrupted, actively played 60-second human session remains a recommended acceptance playtest. Automated tests verify rules and interaction behavior but are not a claim of human sign-off.

Run `npm test` to rebuild and repeat all checks. `BOOP_CHROME` can select a Chrome executable. Screenshots are visual evidence, not stable pixel-diff baselines for an animated scene.
