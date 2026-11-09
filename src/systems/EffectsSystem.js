import { FX, COLORS } from "../core/Constants.js";
import { eventBus, Events } from "../core/EventBus.js";
export class EffectsSystem {
  constructor(scene) {
    this.scene = scene;
    this.burst = scene.add
      .particles(0, 0, "spark", {
        emitting: false,
        maxParticles: FX.POOL,
        lifespan: FX.LIFE,
        speed: { min: 25, max: FX.SPEED },
        scale: { start: 1.8, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [COLORS.HONEY, COLORS.CREAM, COLORS.WHITE],
        gravityY: 50,
      })
      .setDepth(12);
    this.collect = (d) => {
      this.burst.explode(FX.BURST, d.x, d.y);
      const label = scene.add
        .text(d.x, d.y - 20, `+${d.points}`, {
          fontFamily: "monospace",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#fff7d5",
          stroke: "#654b47",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(15);
      scene.tweens.add({
        targets: label,
        y: label.y - 35,
        alpha: 0,
        duration: 700,
        onComplete: () => label.destroy(),
      });
    };
    this.hit = () => {
      scene.cameras.main.shake(FX.SHAKE_MS, FX.SHAKE);
      scene.cameras.main.flash(130, 248, 171, 159, false);
    };
    eventBus.on(Events.NECTAR, this.collect);
    eventBus.on(Events.DAMAGE, this.hit);
    scene.cameras.main.fadeIn(FX.FADE, 255, 246, 217);
  }
  destroy() {
    eventBus.off(Events.NECTAR, this.collect);
    eventBus.off(Events.DAMAGE, this.hit);
  }
}
