import { RULES, STORAGE } from "./Constants.js";
export class GameState {
  constructor() {
    this.best = 0;
    try {
      this.best = Math.max(
        0,
        Number(globalThis.localStorage?.getItem(STORAGE.BEST)) || 0,
      );
    } catch {}
    this.reset();
  }
  reset() {
    Object.assign(this, {
      score: 0,
      health: RULES.HEALTH,
      remaining: RULES.DURATION,
      elapsed: 0,
      level: 1,
      streak: 0,
      multiplier: 1,
      comboLeft: 0,
      immune: 0,
      mode: "playing",
      paused: false,
      collected: 0,
    });
  }
  tick(dt) {
    if (this.mode !== "playing" || this.paused) return;
    this.elapsed += dt;
    this.remaining = Math.max(0, RULES.DURATION - this.elapsed);
    this.level = Math.min(4, 1 + Math.floor(this.elapsed / RULES.TIER_SECONDS));
    this.immune = Math.max(0, this.immune - dt);
    this.comboLeft = Math.max(0, this.comboLeft - dt);
    if (!this.comboLeft) {
      this.streak = 0;
      this.multiplier = 1;
    }
    if (!this.remaining) this.finish("finished");
  }
  collect() {
    if (this.mode !== "playing" || this.paused) return 0;
    this.streak++;
    this.collected++;
    this.multiplier = Math.min(
      RULES.MAX_MULTIPLIER,
      1 + Math.floor(this.streak / RULES.COMBO_STEP),
    );
    this.comboLeft = RULES.COMBO_SECONDS;
    const points = RULES.NECTAR_POINTS * this.multiplier;
    this.score += points;
    return points;
  }
  damage() {
    if (this.mode !== "playing" || this.paused || this.immune > 0) return false;
    this.health--;
    this.immune = RULES.INVULNERABLE;
    this.comboLeft = 0;
    this.streak = 0;
    this.multiplier = 1;
    if (!this.health) this.finish("hurt");
    return true;
  }
  finish(mode) {
    if (this.mode !== "playing") return;
    this.mode = mode;
    this.best = Math.max(this.best, this.score);
    try {
      globalThis.localStorage?.setItem(STORAGE.BEST, String(this.best));
    } catch {}
  }
}
export const gameState = new GameState();
