import { eventBus, Events } from "../core/EventBus.js";
import { audioManager as audio } from "./AudioManager.js";
export function initAudioBridge() {
  eventBus.on(Events.AUDIO_INIT, () => audio.init());
  eventBus.on(Events.NECTAR, (d) => audio.sound("nectar", d.multiplier));
  eventBus.on(Events.DAMAGE, () => audio.sound("hit"));
  eventBus.on(Events.TIER, () => audio.sound("tier"));
  eventBus.on(Events.GAME_OVER, () => {
    audio.running = false;
    audio.sound("end");
  });
  eventBus.on(Events.MUSIC_GAMEPLAY, () => {
    audio.running = true;
    audio.pause(false);
  });
  eventBus.on(Events.PAUSE, (d) => audio.pause(d.paused));
  eventBus.on(Events.AUDIO_TOGGLE_MUTE, () => {
    audio.init();
    audio.toggle();
    eventBus.emit(Events.MUTE, { muted: audio.muted });
  });
}
