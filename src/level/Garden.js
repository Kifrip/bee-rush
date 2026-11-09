import { COLORS } from "../core/Constants.js";
export function createGarden(scene, w, h) {
  scene.gardenImage?.destroy();
  scene.gardenPollen?.destroy();
  const key = "garden";
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const c = document.createElement("canvas");
  c.width = Math.ceil(w / 2);
  c.height = Math.ceil(h / 2);
  const ctx = c.getContext("2d");
  const W = c.width,
    H = c.height;
  let seed = 87;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const rect = (x, y, a, b, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), a, b);
  };
  rect(0, 0, W, H, "#8fbb6c");
  for (let i = 0; i < (W * H) / 45; i++) {
    const x = rnd() * W,
      y = rnd() * H;
    rect(x, y, 2 + rnd() * 3, 1, rnd() > 0.45 ? "#9ec77b" : "#84b363");
    if (rnd() > 0.85) rect(x, y - 2, 1, 2, "#76a75a");
  }
  // A winding stone path softens the open meadow, without introducing collision obstacles.
  for (let y = 18; y < H - 10; y += 13) {
    const x = W * 0.5 + Math.sin(y / 60) * W * 0.07;
    for (let j = -1; j < 2; j++) {
      rect(x + j * 14, y, 12, 9, "#9bab74");
      rect(x + j * 14, y, 10, 7, "#bfca95");
      rect(x + j * 14, y, 10, 1, "#d2d9ab");
    }
  }
  // Small pond, with pixel-stepped shore and lily pads.
  const px = W - 57,
    py = H - 46;
  rect(px - 33, py - 13, 62, 30, "#6f9e60");
  rect(px - 27, py - 19, 48, 42, "#6f9e60");
  rect(px - 29, py - 10, 55, 24, "#81bdc0");
  rect(px - 22, py - 16, 41, 36, "#81bdc0");
  rect(px - 20, py - 14, 35, 2, "#b1d8cd");
  for (let i = 0; i < 7; i++)
    rect(px - 22 + rnd() * 40, py - 9 + rnd() * 23, 7, 1, "#add8d0");
  rect(px + 7, py + 3, 9, 5, "#5a975f");
  rect(px + 10, py, 4, 4, "#eab0c6");
  // Fence and hedges frame the play area; all decorative props are intentionally non-colliding.
  for (let x = 0; x < W; x += 13) {
    rect(x, 9, 10, 2, "#c7b886");
    rect(x, 16, 10, 2, "#c7b886");
    rect(x, 5, 4, 18, "#e6d7a9");
    rect(x + 1, 5, 1, 18, "#f4e6bf");
  }
  for (let x = 0; x < W; x += 9) {
    for (const y of [H - 8]) {
      rect(x, y, 10, 8, "#538251");
      rect(x + 2, y - 4, 8, 7, "#639453");
      rect(x + 3, y - 6, 4, 3, "#79a35c");
    }
  }
  for (let i = 0; i < H; i += 10) {
    for (const x of [0, W - 6]) {
      rect(x, i, 6, 10, "#5d8b50");
      rect(x, i + 2, 4, 4, "#79a75b");
    }
  }
  for (let i = 0; i < 38; i++) {
    const x = 12 + rnd() * (W - 24),
      y = H - 8 - rnd() * 12;
    rect(x, y, 1, 4, "#4c814a");
    rect(x - 1, y - 1, 3, 2, i % 2 ? "#d7bcda" : "#f3dda1");
  }
  scene.textures.addCanvas(key, c);
  scene.gardenImage = scene.add
    .image(w / 2, h / 2, key)
    .setDisplaySize(w, h)
    .setDepth(-20);
  scene.gardenPollen = scene.add
    .particles(0, 0, "spark", {
      x: { min: 20, max: w - 20 },
      y: { min: 25, max: h - 20 },
      lifespan: 4500,
      frequency: 220,
      speedX: { min: -8, max: 8 },
      speedY: { min: -12, max: -4 },
      alpha: { start: 0.5, end: 0 },
      scale: { start: 0.7, end: 0.2 },
      tint: COLORS.CREAM,
    })
    .setDepth(-4);
}
