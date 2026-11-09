import { renderSpriteSheet, renderPixelArt } from "../core/PixelRenderer.js";
import { palette } from "../sprites/palette.js";
import { bee, hornet, flap } from "../sprites/insects.js";
import { flower, leaf } from "../sprites/flowers.js";
export function createAssets(scene) {
  for (const [key, frame] of [
    ["bee", bee],
    ["hornet", hornet],
  ]) {
    renderSpriteSheet(scene, [frame, flap(frame)], palette, key);
    if (!scene.anims.exists(key))
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 1 }),
        frameRate: key === "bee" ? 18 : 14,
        repeat: -1,
      });
  }
  ["pink", "purple", "white"].forEach((key, i) => {
    const p = [...palette];
    if (i === 1) {
      p[7] = palette[14];
      p[9] = 0xe9daff;
    }
    if (i === 2) {
      p[7] = 0xf9ebc3;
      p[9] = 0xffffff;
    }
    renderPixelArt(scene, flower, p, "flower-" + key);
  });
  renderPixelArt(scene, leaf, palette, "leaf");
  renderPixelArt(scene, ["22", "24"], palette, "spark");
}
