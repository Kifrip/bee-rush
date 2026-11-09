import { WORLD, RULES } from "../core/Constants.js";
import { eventBus, Events } from "../core/EventBus.js";
import { gameState } from "../core/GameState.js";
export class NectarSystem {
  constructor(scene, w, h) {
    this.scene = scene;
    this.items = [];
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    const columns = w < 600 ? 3 : 5,
      rows = Math.ceil(WORLD.FLOWERS / columns),
      mx = 65,
      my = 65;
    for (let n = 0; n < WORLD.FLOWERS; n++) {
      const col = n % columns,
        row = Math.floor(n / columns);
      let x = mx + (col * (w - 2 * mx)) / (columns - 1) + Math.sin(n * 7) * 13,
        y = my + (row * (h - 2 * my)) / (rows - 1) + Math.cos(n * 4) * 9;
      if (n === 0) {
        x = w / 2 + 85;
        y = h / 2;
      } else if (Math.hypot(x - w / 2, y - h / 2) < 80) {
        y += 90;
      }
      const sprite = this.group
        .create(x, y, "flower-" + ["pink", "purple", "white"][n % 3])
        .setScale(WORLD.FLOWER_SCALE)
        .setDepth(2);
      sprite.body.setCircle(
        WORLD.FLOWER_RADIUS,
        8 - WORLD.FLOWER_RADIUS,
        8 - WORLD.FLOWER_RADIUS,
      );
      sprite.cooldown = 0;
      sprite.homeX = x;
      sprite.homeY = y;
      this.items.push(sprite);
    }
    scene.physics.add.overlap(scene.player, this.group, (_, flower) =>
      this.collect(flower),
    );
  }
  collect(flower) {
    if (flower.cooldown || gameState.mode !== "playing" || gameState.paused)
      return;
    const points = gameState.collect();
    if (!points) return;
    flower.cooldown = RULES.FLOWER_RESPAWN;
    flower.body.enable = false;
    flower.setAlpha(0.28);
    eventBus.emit(Events.NECTAR, {
      x: flower.x,
      y: flower.y,
      points,
      multiplier: gameState.multiplier,
      streak: gameState.streak,
    });
  }
  update(dt, t) {
    for (let n = 0; n < this.items.length; n++) {
      const f = this.items[n];
      f.setAngle(Math.sin(t * 1.7 + n) * 3);
      if (f.cooldown > 0) {
        f.cooldown -= dt;
        if (f.cooldown <= 0) {
          f.cooldown = 0;
          f.body.enable = true;
          f.setAlpha(1);
          this.scene.tweens.add({
            targets: f,
            scale: WORLD.FLOWER_SCALE * 1.15,
            duration: 160,
            yoyo: true,
          });
        }
      }
    }
  }
}
