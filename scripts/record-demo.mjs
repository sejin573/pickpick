import { spawn } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import ffmpegPath from "ffmpeg-static";

const siteUrl = process.env.PICKPICK_URL ?? "https://pickpick-five.vercel.app";
const browserPath =
  process.env.BROWSER_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9224;
const fps = 8;
const profileDir = path.join(os.tmpdir(), `pickpick-video-${Date.now()}`);
const frameDir = path.join(os.tmpdir(), `pickpick-frames-${Date.now()}`);
const outputDir = path.resolve("docs", "videos");
const outputPath = path.join(outputDir, "pickpick-demo-v180.mp4");

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForJson(url, timeout = 20_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const listeners = new Map();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) {
      listeners.get(message.method)?.forEach((listener) =>
        listener(message.params),
      );
      return;
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        close: () => socket.close(),
        on(method, listener) {
          const methodListeners = listeners.get(method) ?? [];
          methodListeners.push(listener);
          listeners.set(method, methodListeners);
        },
        send(method, params = {}) {
          const id = nextId++;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((requestResolve, requestReject) => {
            pending.set(id, {
              resolve: requestResolve,
              reject: requestReject,
            });
          });
        },
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  return client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
}

async function waitForText(client, text, timeout = 70_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const result = await evaluate(
      client,
      `document.body.innerText.includes(${JSON.stringify(text)})`,
    );
    if (result.result.value) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for page text: ${text}`);
}

async function addCaption(client, text) {
  await evaluate(
    client,
    `(() => {
      let caption = document.getElementById("pickpick-demo-caption");
      if (!caption) {
        caption = document.createElement("div");
        caption.id = "pickpick-demo-caption";
        Object.assign(caption.style, {
          position: "fixed",
          left: "50%",
          bottom: "24px",
          transform: "translateX(-50%)",
          zIndex: "9999",
          padding: "12px 20px",
          borderRadius: "999px",
          color: "white",
          background: "rgba(15, 12, 24, 0.88)",
          boxShadow: "0 12px 40px rgba(20, 10, 50, 0.24)",
          font: "600 15px Pretendard, sans-serif",
          transition: "opacity .25s ease",
          pointerEvents: "none"
        });
        document.body.appendChild(caption);
      }
      caption.textContent = ${JSON.stringify(text)};
      caption.style.opacity = "1";
    })()`,
  );
}

async function typeQuery(client, query) {
  await evaluate(
    client,
    `(() => new Promise(async (resolve) => {
      const textarea = document.querySelector("textarea");
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      ).set;
      let value = "";
      for (const character of ${JSON.stringify(query)}) {
        value += character;
        setter.call(textarea, value);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((next) => setTimeout(next, 45));
      }
      resolve();
    }))()`,
  );
}

async function encodeVideo() {
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      ffmpegPath,
      [
        "-y",
        "-framerate",
        String(fps),
        "-i",
        path.join(frameDir, "frame-%05d.jpg"),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      { stdio: "inherit" },
    );
    ffmpeg.on("error", reject);
    ffmpeg.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)),
    );
  });
}

await mkdir(frameDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1280,720",
    `${siteUrl}?demo=${Date.now()}`,
  ],
  { stdio: "ignore" },
);

let recording = true;
let frameNumber = 0;
let lastFrameAt = 0;
const frameWrites = [];

try {
  await waitForJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await waitForJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((item) => item.type === "page");
  if (!page) throw new Error("No browser page was created");

  const client = await connect(page.webSocketDebuggerUrl);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await waitForText(client, "어떤 상품을 찾고 있나요?");

    client.on("Page.screencastFrame", ({ data, sessionId, metadata }) => {
      client.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
      if (!recording) return;
      const capturedAt = metadata?.timestamp
        ? metadata.timestamp * 1000
        : Date.now();
      if (capturedAt - lastFrameAt < 1000 / fps) return;
      lastFrameAt = capturedAt;
      const frameName = `frame-${String(frameNumber).padStart(5, "0")}.jpg`;
      frameNumber += 1;
      frameWrites.push(
        writeFile(path.join(frameDir, frameName), Buffer.from(data, "base64")),
      );
    });
    await client.send("Page.startScreencast", {
      format: "jpeg",
      quality: 84,
      maxWidth: 1280,
      maxHeight: 720,
      everyNthFrame: 1,
    });
    await evaluate(
      client,
      `(() => {
        const pulse = document.createElement("div");
        Object.assign(pulse.style, {
          position: "fixed",
          width: "1px",
          height: "1px",
          opacity: "0.001",
          animation: "pickpick-capture-pulse .2s linear infinite"
        });
        const style = document.createElement("style");
        style.textContent =
          "@keyframes pickpick-capture-pulse { from { transform: translateX(0) } to { transform: translateX(1px) } }";
        document.head.appendChild(style);
        document.body.appendChild(pulse);
      })()`,
    );

    await addCaption(client, "자연어 한 문장으로 실제 판매 상품을 추천받습니다");
    await sleep(2_200);

    await evaluate(
      client,
      `([...document.querySelectorAll("button")].find((item) =>
        item.innerText.includes("로그인하고 대화 저장")
      ))?.click()`,
    );
    await waitForText(client, "PickPick에 로그인");
    await addCaption(client, "최초 이메일 인증 후 비밀번호로 바로 로그인합니다");
    await sleep(2_500);
    await evaluate(
      client,
      `document.querySelector('button[aria-label="로그인 창 닫기"]')?.click()`,
    );

    await addCaption(client, "추천받고 싶은 상황과 예산을 입력합니다");
    await typeQuery(client, "친구 집들이 선물 30만원대 추천해줘");
    await sleep(900);
    await evaluate(
      client,
      `document.querySelector('button[aria-label="추천 요청 보내기"]')?.click()`,
    );

    await addCaption(client, "AI가 요청을 분석하고 실제 판매 상품을 검색합니다");
    await waitForText(client, "예산대별로 나눠서 골라봤어요");
    await sleep(1_500);
    await evaluate(
      client,
      `(() => {
        const section = [...document.querySelectorAll("section")].find((item) =>
          item.innerText.includes("예산대별로 나눠서 골라봤어요")
        );
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })()`,
    );
    await addCaption(client, "요청한 30만원대를 먼저, 앞뒤 가격대도 함께 비교합니다");
    await sleep(3_500);

    await evaluate(
      client,
      `([...document.querySelectorAll("button")].find((item) =>
        item.innerText.trim() === "20만원대"
      ))?.click()`,
    );
    await addCaption(client, "카테고리별 실제 상품과 가격·추천 근거를 확인합니다");
    await sleep(3_000);

    await evaluate(
      client,
      `window.scrollBy({ top: 650, behavior: "smooth" })`,
    );
    await addCaption(client, "비교표와 구매 전 확인사항까지 한 흐름으로 제공합니다");
    await sleep(3_200);

    recording = false;
    await client.send("Page.stopScreencast");
    await Promise.all(frameWrites);
  } finally {
    client.close();
  }
} finally {
  recording = false;
  browser.kill();
}

if ((await readdir(frameDir)).length === 0) {
  throw new Error("No video frames were captured");
}

await encodeVideo();
await rm(frameDir, { recursive: true, force: true });
await rm(profileDir, { recursive: true, force: true });
console.log(`Created ${outputPath} from ${frameNumber} frames`);
