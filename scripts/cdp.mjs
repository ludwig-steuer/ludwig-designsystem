/**
 * Messen im Browser, ohne dass ein Browser übrig bleibt.
 *
 * Jede Abnahme in diesem Repo misst gegen den laufenden Dev-Server (Port 6107)
 * über das Chrome DevTools Protocol. Bis 2026-09-07 hatte jeder Prüfer seine
 * eigene Kopie dieses Helfers im Scratchpad — und jede Kopie ließ ihren Chrome
 * stehen, sobald das Messskript vor `proc.kill()` abbrach. Gezählt wurden an
 * einem Tag **388 Prozesse mit 38 GB**; die Maschine ging in die Knie, und die
 * fünf Prüfer einer Welle starben mitsamt ihrer Arbeit.
 *
 * Deshalb steht der Helfer jetzt hier, einmal, und räumt selbst auf:
 *
 * - Der Browser läuft in einer **eigenen Prozessgruppe** und wird über sie
 *   beendet — sonst überleben Renderer, GPU- und Utility-Prozesse ihren Vater
 *   (auf ein Hauptfenster kommen rund zwei Dutzend).
 * - `exit`, `SIGINT`, `SIGTERM` und eine unbehandelte Ausnahme führen alle
 *   zum selben Abräumen. Ein Skript, das mitten in der Messung wirft, lässt
 *   nichts stehen.
 * - Das Profilverzeichnis wird mitgelöscht.
 *
 * Aufruf im Messskript:
 *
 *     import { launch, Session, url } from "../../scripts/cdp.mjs";
 *     const proc = await launch();          // Port aus CDP_PORT, sonst frei gewählt
 *     const s = await Session.open();
 *     await s.goto(url("v3-primitives-…--filled"));
 *     await s.resize(1400);
 *     console.log(await s.eval(`return document.title`));
 *     // kein `proc.kill()` nötig — passiert von selbst
 *
 * `pnpm cdp:clean` räumt weg, was frühere Läufe hinterlassen haben.
 */
import { spawn, execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_BIN ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

/** Ein freier Port je Lauf: zwei Prüfer gleichzeitig dürfen sich nicht stören. */
const PORT = Number(process.env.CDP_PORT || 9300 + (process.pid % 600));
const PROFIL = `/private/tmp/claude-501/cdp-profile-${PORT}`;

let kind = null;
let abgeraeumt = false;

/** Die ganze Gruppe, nicht nur den Vater — die Kinder überleben ihn sonst. */
function abraeumen() {
  if (abgeraeumt) return;
  abgeraeumt = true;
  if (kind?.pid) {
    for (const signal of ["SIGTERM", "SIGKILL"]) {
      try {
        process.kill(-kind.pid, signal);
      } catch {
        /* schon weg */
      }
    }
  }
  try {
    rmSync(PROFIL, { recursive: true, force: true });
  } catch {
    /* egal */
  }
}

for (const ereignis of ["exit", "SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(ereignis, abraeumen);
}
process.on("uncaughtException", (e) => {
  abraeumen();
  console.error(e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  abraeumen();
  console.error(e);
  process.exit(1);
});

export async function launch() {
  kind = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars=false",
      `--user-data-dir=${PROFIL}`,
      "about:blank",
    ],
    // `detached`: eigene Prozessgruppe, damit `process.kill(-pid)` alle trifft.
    { stdio: "ignore", detached: true },
  );
  kind.unref();
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) break;
    } catch {
      /* noch nicht da */
    }
    await sleep(150);
  }
  return { kill: abraeumen, pid: kind.pid, port: PORT };
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
  async goto(adresse) {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Page.navigate", { url: adresse });
    for (let i = 0; i < 200; i++) {
      await sleep(100);
      try {
        if ((await this.eval("return document.readyState")) === "complete") break;
      } catch {
        /* lädt noch */
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

/** Die Adresse einer Story auf dem Dev-Server — nie gegen `storybook-static`. */
export const url = (id, extra = "") =>
  `http://localhost:6107/iframe.html?id=${encodeURIComponent(id)}&viewMode=story${extra}`;

/**
 * `--clean`: alles abräumen, was frühere Läufe stehen gelassen haben.
 * Nur Prozesse mit einem `cdp-profile-`-Verzeichnis und älter als zehn
 * Minuten — ein laufender Messlauf soll nicht mitsterben.
 */
function aufraeumen() {
  const zeilen = execSync("ps -eo pid=,etime=,command=", { encoding: "utf8" }).split("\n");
  const sekunden = (e) => {
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
  for (const z of zeilen) {
    const m = z.match(/^\s*(\d+)\s+(\S+)\s+(.*)$/);
    if (!m) continue;
    const [, pid, etime, cmd] = m;
    if (!cmd.includes("cdp-profile-") || !cmd.includes("--headless") || cmd.includes("--type="))
      continue;
    if (sekunden(etime) > 600) pids.push(Number(pid));
  }
  for (const pid of pids) {
    for (const sig of ["SIGTERM", "SIGKILL"]) {
      try {
        process.kill(-pid, sig);
      } catch {
        try {
          process.kill(pid, sig);
        } catch {
          /* schon weg */
        }
      }
    }
  }
  const lauf = execSync("ps -eo command=", { encoding: "utf8" });
  let ordner = 0;
  for (const d of execSync("ls -d /private/tmp/claude-501/cdp-profile-* 2>/dev/null || true", {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean)) {
    if (lauf.includes(d.split("/").pop())) continue;
    rmSync(d, { recursive: true, force: true });
    ordner++;
  }
  console.log(`cdp:clean — ${pids.length} Messbrowser beendet, ${ordner} Profile entfernt.`);
}

if (process.argv[2] === "--clean") {
  abgeraeumt = true; // der Aufräumer soll sich nicht selbst abräumen wollen
  aufraeumen();
}
