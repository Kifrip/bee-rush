import { test, expect } from "../../scripts/browser-test.mjs";
const boot = async (page) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(
    () => window.__GAME__?.scene.getScene("Garden")?.player?.body,
  );
};
const read = (page) => page.evaluate(() => JSON.parse(render_game_to_text()));
const teleport = async (page, kind, index = 0) =>
  page.evaluate(
    ({ kind, index }) => {
      const s = __GAME__.scene.getScene("Garden"),
        target = s[kind].items[index];
      s.player.body.reset(target.x, target.y);
      s.player.setVelocity(0, 0);
    },
    { kind, index },
  );

test("production boot, readable garden, moving bee and clean console", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await boot(page);
  const start = await read(page);
  expect(start.health).toBe(3);
  expect(start.remaining).toBeGreaterThan(58);
  expect(start.flowers.length).toBe(15);
  expect(start.hornets.length).toBe(2);
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(
    (x) => __GAME__.scene.getScene("Garden").player.x > x + 60,
    start.player.x,
  );
  await page.keyboard.up("ArrowRight");
  const end = await read(page);
  expect(end.player.x).toBeGreaterThan(start.player.x + 50);
  expect(errors.length).toBe(0);
  await page.screenshot({
    path: `qa/screenshots/${info.project.name}-garden.png`,
    fullPage: true,
  });
});

test("physical flower overlap, correct score, chain multiplier and regrowth", async ({
  page,
}) => {
  await boot(page);
  await teleport(page, "nectar", 1);
  await page.waitForTimeout(150);
  expect((await read(page)).score).toBe(10);
  await teleport(page, "nectar", 2);
  await page.waitForTimeout(100);
  await teleport(page, "nectar", 3);
  await page.waitForTimeout(100);
  const chain = await read(page);
  expect(chain.multiplier).toBe(2);
  expect(chain.score).toBe(40);
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowDown");
  await page.waitForFunction(
    () => __GAME__.scene.getScene("Garden").nectar.items[1].cooldown === 0,
  );
  expect(
    await page.evaluate(
      () => __GAME__.scene.getScene("Garden").nectar.items[1].cooldown,
    ),
  ).toBe(0);
});

test("hornet collision, immunity, loss and three clean restarts", async ({
  page,
}, info) => {
  await boot(page);
  const listeners = await page.evaluate(
    () => __EVENT_BUS__.listeners[__EVENTS__.DAMAGE].length,
  );
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let hit = 0; hit < 3; hit++) {
      await teleport(page, "enemies");
      await page.waitForTimeout(100);
      expect((await read(page)).health).toBe(2 - hit);
      if (hit === 0) {
        await teleport(page, "enemies");
        await page.waitForTimeout(100);
        expect((await read(page)).health).toBe(2);
      }
      if (hit < 2) {
        await page.evaluate(() => {
          const s = __GAME__.scene.getScene("Garden");
          s.player.body.reset(s.scale.width / 2, s.scale.height - 45);
        });
        await page.waitForFunction(() => __GAME_STATE__.immune === 0);
      }
    }
    expect((await read(page)).mode).toBe("hurt");
    await expect(page.locator("#modal")).toBeVisible();
    if (cycle === 0)
      await page.screenshot({
        path: `qa/screenshots/${info.project.name}-results.png`,
        fullPage: true,
      });
    await page.locator("#restart").click();
    await page.waitForTimeout(150);
    const s = await read(page);
    expect(s.mode).toBe("playing");
    expect(s.health).toBe(3);
    expect(s.score).toBe(0);
    expect(s.hornets.length).toBe(2);
    expect(
      await page.evaluate(
        () => __EVENT_BUS__.listeners[__EVENTS__.DAMAGE].length,
      ),
    ).toBe(listeners);
  }
});

test("pause freezes time and movement, resume works, mute persists", async ({
  page,
}) => {
  await boot(page);
  await page.locator("#pause").click();
  const t = (await read(page)).remaining;
  await page.waitForTimeout(400);
  expect((await read(page)).remaining).toBe(t);
  await page.locator("#restart").click();
  await page.waitForTimeout(250);
  expect((await read(page)).remaining).toBeLessThan(t);
  await page.locator("#sound").click();
  expect(await page.evaluate(() => __AUDIO__.ctx !== null)).toBe(true);
  expect(await page.evaluate(() => __AUDIO__.muted)).toBe(true);
  await page.reload();
  await page.waitForFunction(
    () => window.__GAME__?.scene.getScene("Garden")?.player,
  );
  expect(await page.evaluate(() => __AUDIO__.muted)).toBe(true);
});

test("timer completion, difficulty pressure and saved high score", async ({
  page,
}) => {
  await boot(page);
  await teleport(page, "nectar", 1);
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const s = __GAME_STATE__;
    s.elapsed = 14.95;
    s.remaining = 45.05;
  });
  await page.waitForTimeout(200);
  expect((await read(page)).level).toBe(2);
  expect((await read(page)).hornets.length).toBe(3);
  await page.evaluate(() => {
    __GAME_STATE__.elapsed = 44.95;
    __GAME_STATE__.remaining = 15.05;
  });
  await page.waitForTimeout(200);
  expect((await read(page)).level).toBe(4);
  expect((await read(page)).hornets.length).toBe(5);
  await page.evaluate(() => {
    __GAME_STATE__.elapsed = 59.95;
    __GAME_STATE__.remaining = 0.05;
  });
  await page.waitForTimeout(250);
  expect((await read(page)).mode).toBe("finished");
  expect((await read(page)).best).toBeGreaterThan(0);
  const score = (await read(page)).score;
  await page.reload();
  await page.waitForFunction(
    () => window.__GAME__?.scene.getScene("Garden")?.player,
  );
  expect((await read(page)).best).toBe(score);
});

test("pointer joystick moves bee, release stops, layout stays within viewport", async ({
  page,
  hasTouch,
}) => {
  await boot(page);
  const box = await page.locator("#game canvas").boundingBox();
  const start = await read(page);
  if (hasTouch) {
    await page.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: box.x + box.width * 0.45, y: box.y + box.height * 0.65 },
      ],
    });
    await page.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: box.x + box.width * 0.75, y: box.y + box.height * 0.65 },
      ],
    });
  } else {
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.65);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.65, {
      steps: 10,
    });
  }
  await page.waitForFunction(
    (x) => __GAME__.scene.getScene("Garden").player.x > x + 40,
    start.player.x,
  );
  if (hasTouch)
    await page.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  else await page.mouse.up();
  expect((await read(page)).player.x).toBeGreaterThan(start.player.x + 30);
  await page.waitForFunction(
    () =>
      Math.abs(__GAME__.scene.getScene("Garden").player.body.velocity.x) < 2,
  );
  expect(Math.abs((await read(page)).player.vx)).toBeLessThan(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

// Intentional asymmetric interaction: hornets damage the bee; flowers feed only the bee.
// This is a score-attack game: surviving time is a harvest completion, not an automatic score victory.
test("no-input player loses to real hornet pressure", async ({ page }) => {
  test.setTimeout(75000);
  await boot(page);
  await page.waitForFunction(
    () => __GAME_STATE__.mode !== "playing",
    undefined,
    { timeout: 70000 },
  );
  const s = await read(page);
  expect(s.mode).toBe("hurt");
  expect(s.score).toBe(0);
  expect(s.health).toBe(0);
});

test("resize preserves round, remains legible, and audio synthesizes a signal", async ({
  page,
}, info) => {
  await boot(page);
  await page.keyboard.press("d");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => __AUDIO__.ctx.state)).toBe("running");
  await page.evaluate(() => {
    const a = __AUDIO__;
    window.__ANALYSER__ = a.ctx.createAnalyser();
    a.master.connect(__ANALYSER__);
  });
  await page.waitForFunction(() => {
    const a = __ANALYSER__,
      data = new Uint8Array(a.fftSize);
    a.getByteTimeDomainData(data);
    return data.some((x) => Math.abs(x - 128) > 1);
  });
  await page.locator("#sound").click();
  await page.waitForTimeout(350);
  expect(
    await page.evaluate(() => {
      const a = __ANALYSER__,
        data = new Uint8Array(a.fftSize);
      a.getByteTimeDomainData(data);
      return data.every((x) => Math.abs(x - 128) < 2);
    }),
  ).toBe(true);
  const before = (await read(page)).remaining;
  await page.setViewportSize({ width: 851, height: 500 });
  await page.waitForTimeout(300);
  const after = await read(page);
  expect(after.remaining).toBeLessThan(before);
  expect(after.health).toBe(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() => {
      const s = __GAME__.scene.getScene("Garden"),
        c = document.querySelector("canvas").getBoundingClientRect();
      return (
        Math.abs(c.width / c.height - s.scale.width / s.scale.height) < 0.02 &&
        Math.abs(s.cameras.main.width - s.scale.width) < 2
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: `qa/screenshots/${info.project.name}-landscape.png`,
    fullPage: true,
  });
});

test("world bounds, no external runtime requests, and active clock budget", async ({
  page,
}) => {
  const external = [];
  page.on("request", (request) => {
    const u = request.url();
    if (u.startsWith("http") && !u.startsWith("http://localhost:3000"))
      external.push(u);
  });
  await boot(page);
  const start = await read(page),
    now = Date.now();
  await page.waitForTimeout(1200);
  const end = await read(page);
  expect(start.remaining - end.remaining).toBeGreaterThan(0.9);
  expect(start.remaining - end.remaining).toBeLessThan(2.5);
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const s = __GAME__.scene.getScene("Garden");
    return s.player.body.blocked.right;
  });
  await page.keyboard.up("ArrowRight");
  expect(
    await page.evaluate(() => {
      const s = __GAME__.scene.getScene("Garden");
      return s.player.body.right <= s.scale.width - 24;
    }),
  ).toBe(true);
  expect(external.length).toBe(0);
});
