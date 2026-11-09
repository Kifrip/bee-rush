export function tone(
  ctx,
  dest,
  freq,
  at,
  duration,
  gain = 0.15,
  type = "triangle",
  end,
) {
  const o = ctx.createOscillator(),
    g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (end) o.frequency.exponentialRampToValueAtTime(end, at + duration);
  g.gain.setValueAtTime(0.001, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, at + duration);
  o.connect(g).connect(dest);
  o.start(at);
  o.stop(at + duration + 0.02);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}
export function sfx(ctx, dest, type, multi = 1) {
  const t = ctx.currentTime;
  if (type === "nectar") {
    tone(ctx, dest, 659 * multi ** 0.15, t, 0.12, 0.19);
    tone(ctx, dest, 988 * multi ** 0.15, t + 0.065, 0.18, 0.14);
  } else if (type === "hit") {
    tone(ctx, dest, 180, t, 0.22, 0.22, "sawtooth", 55);
  } else if (type === "tier") {
    [440, 554, 659].forEach((f, i) =>
      tone(ctx, dest, f, t + i * 0.09, 0.15, 0.1),
    );
  } else {
    [659, 523, 392, 261].forEach((f, i) =>
      tone(ctx, dest, f, t + i * 0.13, 0.3, 0.17),
    );
  }
}
