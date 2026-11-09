// Game Creator pixel-renderer workflow: palette-index matrices -> local textures.
export function renderSpriteSheet(scene, frames, palette, key, scale = 1) {
  if (scene.textures.exists(key)) return;
  const h = frames[0].length,
    w = frames[0][0].length,
    c = document.createElement("canvas");
  c.width = w * scale * frames.length;
  c.height = h * scale;
  const ctx = c.getContext("2d");
  frames.forEach((pixels, i) =>
    pixels.forEach((row, y) =>
      [...row].forEach((value, x) => {
        const color = palette[parseInt(value, 16)];
        if (color != null) {
          ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
          ctx.fillRect((i * w + x) * scale, y * scale, scale, scale);
        }
      }),
    ),
  );
  scene.textures.addSpriteSheet(key, c, {
    frameWidth: w * scale,
    frameHeight: h * scale,
  });
}
export const renderPixelArt = (scene, pixels, palette, key, scale = 1) =>
  renderSpriteSheet(scene, [pixels], palette, key, scale);
