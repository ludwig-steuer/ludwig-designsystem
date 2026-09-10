/**
 * Measure in the browser without leaving a browser behind.
 *
 * Every acceptance measures the dev server (port 6107) over the Chrome
 * DevTools Protocol. Before this shared helper, each reviewer's copy left its
 * Chrome running when a script threw — 388 processes and 38 GB in one day.
 *
 * - The browser runs in its own process group and is killed through it;
 *   renderer and GPU children outlive their parent otherwise.
 * - `exit`, signals and uncaught errors all clean up, profile included.
 *
 *     import { launch, Session, url } from "../../scripts/cdp.mjs";
 *     await launch();                  // port from CDP_PORT, else derived from the pid
 *     const s = await Session.open();
 *     await s.goto(url("v3-primitives-…--filled"));
 *     console.log(await s.eval(`return document.title`));
 *     process.exit(0);                 // the open WebSocket keeps node alive otherwise
 *
 * `--clean` removes leftovers older than ten minutes — of every session on
 * this machine, so a long measurement of another session dies with them.
 */
import { spawn, execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_BIN ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

/** One port per run, so parallel reviewers do not collide. */
const PORT = Number(process.env.CDP_PORT || 9300 + (process.pid % 600));
const PROFILE_DIR = `/private/tmp/claude-501/cdp-profile-${PORT}`;

let child = null;
let cleanedUp = false;

/** The whole group, not only the parent — the children outlive it otherwise. */
function cleanUp() {
  if (cleanedUp) return;
  cleanedUp = true;
  if (child?.pid) {
    for (const signal of ["SIGTERM", "SIGKILL"]) {
      try {
        process.kill(-child.pid, signal);
      } catch {
        /* already gone */
      }
    }
  }
  try {
    rmSync(PROFILE_DIR, { recursive: true, force: true });
  } catch {
    /* never mind */
  }
}

for (const event of ["exit", "SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(event, cleanUp);
}
process.on("uncaughtException", (e) => {
  cleanUp();
  console.error(e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  cleanUp();
  console.error(e);
  process.exit(1);
});

export async function launch() {
  child = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars=false",
      `--user-data-dir=${PROFILE_DIR}`,
      "about:blank",
    ],
    // `detached`: own process group, so `process.kill(-pid)` reaches all of it.
    { stdio: "ignore", detached: true },
  );
  child.unref();
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) break;
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  return { kill: cleanUp, pid: child.pid, port: PORT };
}

export class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
  }
  static async open() {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
    const t = await r.json();
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    const s = new Session(ws);
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id != null && s.pending.has(msg.id)) {
        const { res, rej } = s.pending.get(msg.id);
        s.pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      } else s.events.push(msg);
    };
    s.targetId = t.id;
    return s;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", {
      expression: `(function(){${expr}})()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(
        JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails),
      );
    }
    return r.result.value;
  }
  async goto(address) {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Page.navigate", { url: address });
    for (let i = 0; i < 200; i++) {
      await sleep(100);
      try {
        if ((await this.eval("return document.readyState")) === "complete") break;
      } catch {
        /* still loading */
      }
    }
    await sleep(600);
  }
  async resize(width, height = 900) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);
  }
  async key(key, code, keyCode, text) {
    const base = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
    await this.send("Input.dispatchKeyEvent", {
      type: text ? "keyDown" : "rawKeyDown",
      ...base,
      text,
    });
    await sleep(30);
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    await sleep(120);
  }
  async insertText(t) {
    await this.send("Input.insertText", { text: t });
    await sleep(250);
  }
  async click(x, y) {
    await this.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      clickCount: 1,
    });
    await sleep(30);
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      clickCount: 1,
    });
    await sleep(250);
  }
}

export const ARROW_DOWN = ["ArrowDown", "ArrowDown", 40];
export const ARROW_UP = ["ArrowUp", "ArrowUp", 38];
export const ENTER = ["Enter", "Enter", 13];
export const ESC = ["Escape", "Escape", 27];

/** A story's address on the dev server — never `storybook-static`. */
export const url = (id, extra = "") =>
  `http://localhost:6107/iframe.html?id=${encodeURIComponent(id)}&viewMode=story${extra}`;

/**
 * `--clean`: kill processes with a `cdp-profile-` directory older than ten
 * minutes. It cannot tell sessions apart.
 */
function cleanStale() {
  const lines = execSync("ps -eo pid=,etime=,command=", { encoding: "utf8" }).split("\n");
  const seconds = (e) => {
    let t = 0;
    if (e.includes("-")) {
      const [d, rest] = e.split("-");
      t += Number(d) * 86400;
      e = rest;
    }
    const p = e.split(":").map(Number);
    while (p.length < 3) p.unshift(0);
    return t + p[0] * 3600 + p[1] * 60 + p[2];
  };
  const pids = [];
  for (const z of lines) {
    const m = z.match(/^\s*(\d+)\s+(\S+)\s+(.*)$/);
    if (!m) continue;
    const [, pid, etime, cmd] = m;
    if (!cmd.includes("cdp-profile-") || !cmd.includes("--headless") || cmd.includes("--type="))
      continue;
    if (seconds(etime) > 600) pids.push(Number(pid));
  }
  for (const pid of pids) {
    for (const sig of ["SIGTERM", "SIGKILL"]) {
      try {
        process.kill(-pid, sig);
      } catch {
        try {
          process.kill(pid, sig);
        } catch {
          /* already gone */
        }
      }
    }
  }
  const run = execSync("ps -eo command=", { encoding: "utf8" });
  let dir = 0;
  for (const d of execSync("ls -d /private/tmp/claude-501/cdp-profile-* 2>/dev/null || true", {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean)) {
    if (run.includes(d.split("/").pop())) continue;
    rmSync(d, { recursive: true, force: true });
    dir++;
  }
  console.log(`cdp:clean — ${pids.length} Messbrowser beendet, ${dir} Profile entfernt.`);
}

if (process.argv[2] === "--clean") {
  cleanedUp = true; // the cleaner must not try to clean itself up
  cleanStale();
}
