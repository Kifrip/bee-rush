import { test } from "node:test";
import assert from "node:assert/strict";
import { GameState } from "../src/core/GameState.js";
test("60 second round, 3 health, tiers every 15 seconds", () => {
  const s = new GameState();
  assert.equal(s.remaining, 60);
  assert.equal(s.health, 3);
  s.tick(15);
  assert.equal(s.level, 2);
  s.tick(15);
  assert.equal(s.level, 3);
  s.tick(15);
  assert.equal(s.level, 4);
  s.tick(15);
  assert.equal(s.mode, "finished");
});
test("consecutive nectar earns multipliers, expires, damage resets", () => {
  const s = new GameState();
  s.collect();
  s.collect();
  s.collect();
  assert.equal(s.score, 40);
  assert.equal(s.multiplier, 2);
  for (let i = 0; i < 30; i++) s.collect();
  assert.equal(s.multiplier, 5);
  s.tick(4.1);
  assert.equal(s.multiplier, 1);
  s.collect();
  s.damage();
  assert.equal(s.streak, 0);
  assert.equal(s.health, 2);
  assert.equal(s.damage(), false);
  s.tick(1.8);
  assert.equal(s.damage(), true);
});
test("death, reset and retained high score", () => {
  const s = new GameState();
  s.collect();
  for (let i = 0; i < 3; i++) {
    s.damage();
    s.tick(1.8);
  }
  assert.equal(s.mode, "hurt");
  assert.equal(s.best, 10);
  s.reset();
  assert.equal(s.health, 3);
  assert.equal(s.score, 0);
  assert.equal(s.remaining, 60);
  assert.equal(s.best, 10);
});
test("finished rounds cannot score or take damage; paused rounds do not tick", () => {
  const s = new GameState();
  s.paused = true;
  s.tick(30);
  assert.equal(s.remaining, 60);
  s.paused = false;
  s.tick(60);
  s.collect();
  s.damage();
  assert.equal(s.score, 0);
  assert.equal(s.health, 3);
});
