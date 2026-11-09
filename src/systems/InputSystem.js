import { WORLD } from "../core/Constants.js";
import { eventBus, Events } from "../core/EventBus.js";
export class InputSystem {
  constructor(scene) {
    this.scene = scene;
    this.vector = { x: 0, y: 0 };
    this.touch = { x: 0, y: 0 };
    this.keys = scene.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT");
    this.pointer = null;
    this.base = scene.add
      .circle(0, 0, 44, 0xfff6d9, 0.22)
      .setStrokeStyle(2, 0xfff6d9, 0.5)
      .setDepth(100)
      .setVisible(false);
    this.knob = scene.add
      .circle(0, 0, 19, 0xfff6d9, 0.65)
      .setDepth(101)
      .setVisible(false);
    this.down = (p) => {
      if (p.y < 20) return;
      this.pointer = p.id;
      this.origin = { x: p.x, y: p.y };
      this.base.setPosition(p.x, p.y).setVisible(true);
      this.knob.setPosition(p.x, p.y).setVisible(true);
      eventBus.emit(Events.AUDIO_INIT, {});
    };
    this.move = (p) => {
      if (p.id !== this.pointer) return;
      const dx = p.x - this.origin.x,
        dy = p.y - this.origin.y,
        len = Math.hypot(dx, dy),
        r = 44;
      this.touch.x = dx / Math.max(r, len);
      this.touch.y = dy / Math.max(r, len);
      this.knob.setPosition(
        this.origin.x + this.touch.x * r,
        this.origin.y + this.touch.y * r,
      );
    };
    this.up = (p) => {
      if (p.id === this.pointer) this.clear();
    };
    scene.input.on("pointerdown", this.down);
    scene.input.on("pointermove", this.move);
    scene.input.on("pointerup", this.up);
    scene.input.on("pointerupoutside", this.up);
    this.blur = () => this.clear();
    window.addEventListener("blur", this.blur);
  }
  clear() {
    this.pointer = null;
    this.touch.x = 0;
    this.touch.y = 0;
    this.base.setVisible(false);
    this.knob.setVisible(false);
    this.scene.input.keyboard.resetKeys();
  }
  read() {
    const k = this.keys;
    let x =
        Number(k.D.isDown || k.RIGHT.isDown) -
        Number(k.A.isDown || k.LEFT.isDown) +
        this.touch.x,
      y =
        Number(k.S.isDown || k.DOWN.isDown) -
        Number(k.W.isDown || k.UP.isDown) +
        this.touch.y;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    this.vector.x = x;
    this.vector.y = y;
    return this.vector;
  }
  destroy() {
    const i = this.scene.input;
    i.off("pointerdown", this.down);
    i.off("pointermove", this.move);
    i.off("pointerup", this.up);
    i.off("pointerupoutside", this.up);
    window.removeEventListener("blur", this.blur);
  }
}
