import Phaser from "phaser";
import "./style.css";
import { Game } from "./core/Game.js";
import { gameState } from "./core/GameState.js";
import { eventBus, Events } from "./core/EventBus.js";
import { WORLD } from "./core/Constants.js";
import { createInterface } from "./ui/Interface.js";
import { initAudioBridge } from "./audio/AudioBridge.js";
import { audioManager } from "./audio/AudioManager.js";
initAudioBridge();
createInterface();
eventBus.emit(Events.MUTE, { muted: audioManager.muted });
const parent = document.getElementById("game");
const rect = parent.getBoundingClientRect();
const width = Math.max(
  WORLD.MIN_WIDTH,
  Math.min(WORLD.MAX_WIDTH, (WORLD.HEIGHT * rect.width) / rect.height),
);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width,
  height: WORLD.HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#8fbb6c",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false, fixedStep: false },
  },
  scene: [Game],
  input: { activePointers: 3, keyboard: { capture: [32, 37, 38, 39, 40] } },
  audio: { noAudio: true },
});
// Responsive logical viewport: do not reset a round when the device rotates.
new ResizeObserver(() => {
  const r = parent.getBoundingClientRect(),
    w = Math.max(
      WORLD.MIN_WIDTH,
      Math.min(WORLD.MAX_WIDTH, (WORLD.HEIGHT * r.width) / r.height),
    );
  const scene = game.scene.getScene("Garden");
  if (scene?.player) {
    const old = game.scale.width;
    if (Math.abs(w - old) > 2) {
      game.scale.setGameSize(w, WORLD.HEIGHT);
      eventBus.emit(Events.RESIZE, { width: w, oldWidth: old });
    } else game.scale.refresh();
  } else game.scale.setGameSize(w, WORLD.HEIGHT);
}).observe(parent);
window.__GAME__ = game;
window.__GAME_STATE__ = gameState;
window.__EVENT_BUS__ = eventBus;
window.__EVENTS__ = Events;
window.__AUDIO__ = audioManager;
window.render_game_to_text = () => {
  const s = game.scene.getScene("Garden");
  return JSON.stringify({
    coords: "origin:top-left x:right y:down",
    mode: gameState.mode,
    paused: gameState.paused,
    score: gameState.score,
    best: gameState.best,
    health: gameState.health,
    remaining: Math.round(gameState.remaining * 10) / 10,
    level: gameState.level,
    multiplier: gameState.multiplier,
    comboLeft: gameState.comboLeft,
    player: s?.player
      ? {
          x: Math.round(s.player.x),
          y: Math.round(s.player.y),
          vx: Math.round(s.player.body.velocity.x),
          vy: Math.round(s.player.body.velocity.y),
        }
      : null,
    flowers: s?.nectar?.items.map((f) => ({
      x: Math.round(f.x),
      y: Math.round(f.y),
      ready: !f.cooldown,
    })),
    hornets: s?.enemies?.items.map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
    })),
  });
};
window.advanceTime = (ms) =>
  new Promise((resolve) => {
    const end = performance.now() + ms;
    function frame() {
      if (performance.now() >= end) resolve();
      else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
