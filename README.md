# Bee Rush 🐝
A complete, self-contained Phaser 3 garden arcade game. Collect nectar, chain a sweet streak, and outfly the hornets in a 60-second harvest.

## Run
Requires Node.js 22+ (Node 24 tested).

```sh
npm ci
npm run dev
```
Open http://localhost:3000. For production:

```sh
npm run build
npm run preview
```
Serve `dist/` from any static HTTP server. Do not open the HTML via `file://`: JavaScript modules require HTTP. The build includes Phaser locally; no CDN, backend, API, tracking, paid service, or external font is used. After dependencies are installed, builds and gameplay need no internet.

## Controls and rules
- WASD or arrow keys: fly. Diagonals are normalized.
- Touch/mouse: press and drag anywhere in the garden for a floating joystick. Release to brake.
- P / Escape or pause button: pause/resume. Changing tabs pauses automatically.
- M or music button: mute/unmute; preference persists. Sound starts on first keyboard/touch interaction.
- Fly again / Space at results: restart without reloading.

Each flower gives 10 × current multiplier and blooms again after 3.2 seconds. Collect within four seconds to chain flowers. Every third consecutive collection raises the multiplier by one, up to 5×. Damage breaks the chain. You have three hearts and 1.7 seconds of protection after each hit. Hornets increase in count and speed at 15, 30 and 45 seconds. Survive 60 seconds to complete the harvest, or lose all hearts to finish early. Personal best is stored in localStorage (`bee-rush:best:v1`) on this browser/origin. Private browsing or clearing storage can remove it. Blocked storage does not prevent play.

## Tests
```sh
npm test                  # production build + unit + production browser QA
npm run test:unit         # pure rule tests
npm run test:browser      # desktop and emulated mobile Chromium
npm run test:headed       # watch browser tests
```
Browser QA requires installed Chrome/Chromium; set `BOOP_CHROME=/path/to/chromium` if necessary. Helpers are copied from the installed Game Creator, no Playwright dependency required. Tests serve the production build using Vite preview. `qa/screenshots/` contains inspected browser captures. See `QA.md` for actual results and limitations.

## Game Creator workflows used
- `make-game`: plan, technology decisions, milestone and project state; the user's explicit request for autonomous full delivery superseded routine confirmation/single-feature limits.
- `game-architecture` + `phaser`: EventBus, singleton GameState/reset, Constants, Game orchestrator, Arcade overlaps, systems and cleanup. Adapted the installed Phaser template to the requested Phaser **3.90.0** (the installed template currently lists Phaser 4).
- `game-assets`: original palette-index pixel matrices, procedural Canvas sprite sheets, wing-flap animation and garden rendering. No paid image generation.
- `game-designer`: hierarchy, responsive cream/lilac UI, pollen, swaying flowers, collection bursts, hit flash/shake and transitions.
- `game-audio`: original Web Audio look-ahead sequencer, 64-step melody, bass and independently cycling arpeggio, SFX and persistent mute.
- `game-qa` / `qa-game`: vendored CDP browser helpers, production gameplay tests, screenshots, input/collision audit and three restart cycles.
- `review-game`: architecture/performance review recorded in `docs/review.md`.

Source structure: `src/core` foundations/orchestrator, `gameplay` nectar and hornets, `systems` input/effects, `level` procedural art, `sprites` pixel data, `audio` music/SFX/bridge, `ui` responsive DOM interface. All gameplay balance lives in `src/core/Constants.js`. QA inspection hooks are available: `render_game_to_text()`, `advanceTime(ms)`, `__GAME__`, `__GAME_STATE__`, `__EVENT_BUS__` and `__EVENTS__`. These are local test hooks, not an anti-cheat boundary.

## GitHub Pages (configuration only)
`.github/workflows/pages.yml` is **manual dispatch only**. Nothing is deployed automatically. To publish later: put this source in your own repository, enable Settings → Pages → GitHub Actions, and explicitly run the Deploy Bee Rush workflow. It installs from lockfile, runs unit/build checks, uploads `dist`, and deploys Pages. Vite's relative base supports repository subpaths. Browser QA is run locally; this manual deployment workflow does not install Chromium.

## Attribution
Art, music and game logic are original procedural work created for Bee Rush. Game Creator architecture/template and browser QA helper provenance is in `THIRD_PARTY.md`. Phaser and Vite retain their respective upstream licenses in npm packages.
