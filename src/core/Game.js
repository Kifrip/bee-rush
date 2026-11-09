import Phaser from "phaser";
import { gameState } from "./GameState.js";
import { eventBus, Events } from "./EventBus.js";
import { WORLD } from "./Constants.js";
import { createAssets } from "../level/Assets.js";
import { createGarden } from "../level/Garden.js";
import { InputSystem } from "../systems/InputSystem.js";
import { EffectsSystem } from "../systems/EffectsSystem.js";
import { NectarSystem } from "../gameplay/NectarSystem.js";
import { EnemySystem } from "../gameplay/EnemySystem.js";
export class Game extends Phaser.Scene {
  constructor() {
    super("Garden");
  }
  create() {
    gameState.reset();
    const w = this.scale.width,
      h = this.scale.height;
    createAssets(this);
    createGarden(this, w, h);
    this.physics.world.setBounds(25, 30, w - 50, h - 60);
    this.player = this.physics.add
      .sprite(w / 2, h / 2, "bee")
      .setScale(WORLD.PLAYER_SCALE)
      .setDepth(8)
      .play("bee");
    this.player.body.setCircle(
      WORLD.PLAYER_RADIUS,
      12 - WORLD.PLAYER_RADIUS,
      11 - WORLD.PLAYER_RADIUS,
    );
    this.player.setCollideWorldBounds(true);
    this.controls = new InputSystem(this);
    this.nectar = new NectarSystem(this, w, h);
    this.enemies = new EnemySystem(this, w, h);
    this.effects = new EffectsSystem(this);
    this.lastMode = "playing";
    this.lastTier = 1;
    this.lastNow = performance.now();
    this.restart = () => {
      this.scene.restart();
      eventBus.emit(Events.MUSIC_GAMEPLAY, {});
    };
    this.togglePause = () => {
      if (gameState.mode !== "playing") return;
      gameState.paused = !gameState.paused;
      this.lastNow = performance.now();
      this.controls.clear();
      eventBus.emit(Events.PAUSE, { paused: gameState.paused });
    };
    this.keydown = (e) => {
      eventBus.emit(Events.AUDIO_INIT, {});
      if (e.repeat) return;
      if (e.code === "KeyP" || e.code === "Escape") this.togglePause();
      if (e.code === "KeyM") eventBus.emit(Events.AUDIO_TOGGLE_MUTE, {});
      if (e.code === "Space" && gameState.mode !== "playing") {
        e.preventDefault();
        this.restart();
      }
    };
    this.resize = ({ width, oldWidth }) => {
      createGarden(this, width, h);
      this.cameras.main.setSize(width, h);
      this.physics.world.setBounds(25, 30, width - 50, h - 60);
      this.player.body.reset((this.player.x * width) / oldWidth, this.player.y);
      for (const f of this.nectar.items) {
        f.x *= width / oldWidth;
        f.homeX = f.x;
        f.body.updateFromGameObject();
      }
      for (const e of this.enemies.items)
        e.body.reset((e.x * width) / oldWidth, e.y);
      this.enemies.w = width;
    };
    eventBus.on(Events.RESIZE, this.resize);
    this.visibility = () => {
      if (document.hidden && !gameState.paused && gameState.mode === "playing")
        this.togglePause();
    };
    window.addEventListener("keydown", this.keydown);
    document.addEventListener("visibilitychange", this.visibility);
    eventBus.on(Events.RESTART, this.restart);
    eventBus.on(Events.PAUSE, (this.onPause = this.applyPause.bind(this)));
    eventBus.on(Events.GAME_PAUSED, this.togglePause);
    this.events.once("shutdown", () => {
      this.controls.destroy();
      this.effects.destroy();
      eventBus.off(Events.RESIZE, this.resize);
      window.removeEventListener("keydown", this.keydown);
      document.removeEventListener("visibilitychange", this.visibility);
      eventBus.off(Events.RESTART, this.restart);
      eventBus.off(Events.PAUSE, this.onPause);
      eventBus.off(Events.GAME_PAUSED, this.togglePause);
    });
    eventBus.emit(Events.READY, {});
    eventBus.emit(Events.SPECTACLE_ENTRANCE, {});
  }
  applyPause() {
    if (gameState.paused) this.physics.world.pause();
    else if (gameState.mode === "playing") this.physics.world.resume();
  }
  update(_, delta) {
    const now = performance.now(),
      wallDt = Math.max(0, (now - this.lastNow) / 1000);
    this.lastNow = now;
    const dt = Math.min(delta / 1000, WORLD.MAX_DELTA);
    if (gameState.mode === "playing" && !gameState.paused) {
      gameState.tick(wallDt);
      const v = this.controls.read(),
        blend = Math.min(1, WORLD.ACCEL * dt),
        body = this.player.body;
      let vx = Phaser.Math.Linear(
          body.velocity.x,
          v.x * WORLD.PLAYER_SPEED,
          blend,
        ),
        vy = Phaser.Math.Linear(
          body.velocity.y,
          v.y * WORLD.PLAYER_SPEED,
          blend,
        );
      if (!v.x && Math.abs(vx) < 3) vx = 0;
      if (!v.y && Math.abs(vy) < 3) vy = 0;
      this.player.setVelocity(vx, vy);
      if (v.x) this.player.setFlipX(v.x < 0);
      this.player.setAlpha(
        gameState.immune > 0
          ? Math.sin(gameState.elapsed * 30) > 0.1
            ? 0.4
            : 1
          : 1,
      );
      this.nectar.update(wallDt, gameState.elapsed);
      this.enemies.update(dt);
      if (gameState.level !== this.lastTier) {
        this.lastTier = gameState.level;
        eventBus.emit(Events.TIER, { level: gameState.level });
      }
    }
    if (gameState.mode !== "playing" && this.lastMode === "playing") {
      this.lastMode = gameState.mode;
      this.physics.world.pause();
      this.controls.clear();
      eventBus.emit(Events.GAME_OVER, { mode: gameState.mode });
    }
    eventBus.emit(Events.TICK, {});
  }
}
