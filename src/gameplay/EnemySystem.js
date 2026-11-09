import { WORLD } from "../core/Constants.js";
import { gameState } from "../core/GameState.js";
import { eventBus, Events } from "../core/EventBus.js";
export class EnemySystem {
  constructor(scene, w, h) {
    this.scene = scene;
    this.w = w;
    this.h = h;
    this.items = [];
    this.group = scene.physics.add.group({ allowGravity: false });
    this.ensureCount();
    scene.physics.add.overlap(scene.player, this.group, () => {
      if (gameState.damage())
        eventBus.emit(Events.DAMAGE, {
          x: scene.player.x,
          y: scene.player.y,
          health: gameState.health,
        });
    });
  }
  ensureCount() {
    const target = WORLD.ENEMY_COUNT + gameState.level - 1;
    while (this.items.length < target) {
      const n = this.items.length,
        x = n % 2 ? this.w - 50 : 50,
        y = 80 + ((n * 101) % (this.h - 160));
      const e = this.group
        .create(x, y, "hornet")
        .setScale(WORLD.ENEMY_SCALE)
        .setDepth(6)
        .play("hornet");
      e.body.setCircle(
        WORLD.ENEMY_RADIUS,
        12 - WORLD.ENEMY_RADIUS,
        11 - WORLD.ENEMY_RADIUS,
      );
      e.setCollideWorldBounds(true);
      e.setBounce(1);
      e.turn = n;
      e.heading = n % 2 ? Math.PI : 0;
      this.items.push(e);
      this.scene.tweens.add({
        targets: e,
        alpha: { from: 0, to: 1 },
        duration: 700,
      });
    }
  }
  update(dt) {
    this.ensureCount();
    const speed =
      WORLD.ENEMY_SPEED + (gameState.level - 1) * WORLD.ENEMY_SPEED_STEP;
    for (const e of this.items) {
      e.turn -= dt;
      if (e.turn <= 0) {
        e.turn = WORLD.ENEMY_TURN;
        const p = this.scene.player,
          dx = p.x - e.x,
          dy = p.y - e.y;
        e.heading =
          Math.atan2(dy, dx) + Math.sin(gameState.elapsed + e.x) * 0.8;
      }
      const p = this.scene.player,
        angle = Math.atan2(p.y - e.y, p.x - e.x),
        chase = WORLD.ENEMY_CHASE;
      let vx = Math.cos(e.heading) * (1 - chase) + Math.cos(angle) * chase,
        vy = Math.sin(e.heading) * (1 - chase) + Math.sin(angle) * chase;
      if (e.x < 50) vx = Math.abs(vx);
      if (e.x > this.w - 50) vx = -Math.abs(vx);
      if (e.y < 50) vy = Math.abs(vy);
      if (e.y > this.h - 50) vy = -Math.abs(vy);
      e.setVelocity(vx * speed, vy * speed);
      e.setFlipX(vx < 0);
    }
  }
}
