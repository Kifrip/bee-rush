import { AUDIO, STORAGE } from "../core/Constants.js";
import { melody, bass, arp } from "./music.js";
import { tone, sfx } from "./sfx.js";
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.timer = null;
    this.muted = false;
    this.paused = false;
    this.running = true;
    try {
      this.muted = localStorage.getItem(STORAGE.MUTE) === "true";
    } catch {}
  }
  init() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : AUDIO.GAIN;
      this.step = 0;
      this.next = this.ctx.currentTime + 0.04;
      this.schedule();
    }
    if (this.ctx.state === "suspended" && !this.paused)
      this.ctx.resume().catch(() => {});
  }
  schedule() {
    if (!this.ctx) return;
    const c = this.ctx,
      beat = 60 / AUDIO.BPM / 2;
    if (this.next < c.currentTime) this.next = c.currentTime + 0.03;
    while (this.next < c.currentTime + AUDIO.LOOKAHEAD) {
      if (this.running && !this.paused) {
        for (const [notes, type, gain, oct] of [
          [melody, "triangle", 0.1, 0],
          [bass, "triangle", 0.14, 0],
          [arp, "sine", 0.035, 0],
        ]) {
          const n = notes[this.step % notes.length];
          if (n)
            tone(
              c,
              this.master,
              440 * 2 ** ((n + oct - 69) / 12),
              this.next,
              AUDIO.NOTE,
              gain,
              type,
            );
        }
      }
      this.step++;
      this.next += beat;
    }
    this.timer = setTimeout(() => this.schedule(), AUDIO.TICK);
  }
  sound(type, multi) {
    if (this.ctx && !this.paused) sfx(this.ctx, this.master, type, multi);
  }
  toggle() {
    this.muted = !this.muted;
    if (this.master)
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : AUDIO.GAIN,
        this.ctx.currentTime,
        0.02,
      );
    try {
      localStorage.setItem(STORAGE.MUTE, String(this.muted));
    } catch {}
    return this.muted;
  }
  pause(value) {
    this.paused = value;
    if (this.ctx) {
      if (value) this.ctx.suspend().catch(() => {});
      else this.ctx.resume().catch(() => {});
    }
  }
}
export const audioManager = new AudioManager();
