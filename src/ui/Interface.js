import { eventBus, Events } from "../core/EventBus.js";
import { gameState as state } from "../core/GameState.js";
import { RULES, FX } from "../core/Constants.js";
export function createInterface() {
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(4, "0");
  let toastTimer, hintTimer;
  const toast = (text) => {
    $("toast").textContent = text;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("toast").classList.remove("show"),
      FX.TOAST_MS,
    );
  };
  const render = () => {
    $("score").textContent = pad(state.score);
    $("timer").textContent = Math.ceil(state.remaining);
    $("timer").style.color = state.remaining <= 10 ? "#d48083" : "";
    $("health").textContent =
      "♥ ".repeat(state.health) + "♡ ".repeat(RULES.HEALTH - state.health);
    $("health").setAttribute("aria-label", `${state.health} health points`);
    $("best").textContent = pad(state.best);
    $("multiplier").textContent = "×" + state.multiplier;
    $("combo-fill").style.width =
      (state.comboLeft / RULES.COMBO_SECONDS) * 100 + "%";
    $("combo-label").textContent = state.streak
      ? `${state.streak} FLOWER STREAK`
      : "FIND YOUR FLOW";
    $("level").textContent = `0${state.level} / 04`;
    $("difficulty").innerHTML =
      [
        "A gentle buzz",
        "Here come the hornets",
        "A busy little garden",
        "The final nectar rush",
      ][state.level - 1] +
      ` <span>${"● ".repeat(state.level)}${"○ ".repeat(4 - state.level)}</span>`;
  };
  const showPause = (paused) => {
    $("modal").hidden = !paused;
    $("results").hidden = paused;
    $("result-kicker").textContent = paused
      ? "TAKE A LITTLE BREATHER"
      : "A LOVELY LITTLE HARVEST";
    $("result-title").textContent = paused ? "Rest your wings." : "Sweet work!";
    $("result-description").textContent = paused
      ? "Your garden will be right here."
      : "Every flower was worth the flight.";
    $("restart").innerHTML = paused
      ? "Back to the garden <span>></span>"
      : "Fly again <span>></span>";
    $("restart-note").textContent = paused
      ? "or press P to resume"
      : "or press Space to go again";
    $("pause").setAttribute(
      "aria-label",
      paused ? "Resume game" : "Pause game",
    );
    $("pause").textContent = paused ? "▶" : "II";
  };
  $("restart").onclick = () => {
    eventBus.emit(Events.AUDIO_INIT, {});
    if (state.paused) eventBus.emit(Events.GAME_PAUSED, {});
    else eventBus.emit(Events.RESTART, {});
  };
  $("pause").onclick = () => eventBus.emit(Events.GAME_PAUSED, {});
  $("sound").onclick = () => eventBus.emit(Events.AUDIO_TOGGLE_MUTE, {});
  eventBus.on(Events.MUTE, (d) => {
    $("sound").textContent = d.muted ? "♪̸" : "♫";
    $("sound").setAttribute(
      "aria-label",
      d.muted ? "Unmute audio" : "Mute audio",
    );
    $("sound").setAttribute("aria-pressed", String(d.muted));
  });
  eventBus.on(Events.TICK, render);
  eventBus.on(Events.READY, () => {
    showPause(false);
    render();
    $("hint").style.opacity = 1;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => ($("hint").style.opacity = 0), 6500);
  });
  eventBus.on(Events.NECTAR, (d) => {
    $("hint").style.opacity = 0;
    if (d.streak % RULES.COMBO_STEP === 0)
      toast(`${d.multiplier}× nectar! Keep the sweet streak.`);
  });
  eventBus.on(Events.DAMAGE, () =>
    toast(
      state.health
        ? "Ouch! Find a little breathing room."
        : "Time to rest those wings.",
    ),
  );
  eventBus.on(Events.TIER, (d) =>
    toast(`Round ${d.level} · More hornets, more hustle!`),
  );
  eventBus.on(Events.PAUSE, (d) => showPause(d.paused));
  eventBus.on(Events.GAME_OVER, () => {
    showPause(false);
    $("modal").hidden = false;
    $("result-title").textContent =
      state.mode === "finished" ? "Sweet work!" : "Wings need a rest.";
    $("result-kicker").textContent =
      state.mode === "finished" ? "HARVEST COMPLETE" : "A BRAVE LITTLE BEE";
    $("result-description").textContent =
      state.mode === "finished"
        ? "Sixty seconds of flower-powered flying."
        : "The hornets got this patch. Try a fresh flight.";
    $("final-score").textContent = state.score;
    $("final-best").textContent =
      state.score > 0 && state.score === state.best
        ? "✦ Personal best! " + state.best
        : "Personal best: " + state.best;
    $("result-detail").textContent =
      `${state.collected} ${state.collected === 1 ? "flower" : "flowers"} · ${Math.floor(state.elapsed)} seconds flown`;
    $("hint").style.opacity = 0;
    $("restart").focus({ preventScroll: true });
  });
  if (navigator.maxTouchPoints > 0)
    $("input-hint").textContent =
      "Touch & drag anywhere to fly · Follow the flowers";
  render();
}
