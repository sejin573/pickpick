import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const siteUrl = process.env.PICKPICK_URL ?? "https://pickpick-five.vercel.app";
const browserPath =
  process.env.BROWSER_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9223;
const profileDir = path.join(os.tmpdir(), `pickpick-capture-${Date.now()}`);
const outputDir = path.resolve("docs", "images");

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
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
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

async function capture(client, fileName) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(
    path.join(outputDir, fileName),
    Buffer.from(result.data, "base64"),
  );
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

async function openHome(client) {
  await client.send("Page.navigate", {
    url: `${siteUrl}?capture=${Date.now()}`,
  });
  await waitForText(client, "어떤 상품을 찾고 있나요?");
  await sleep(1_000);
}

async function submitQuery(client, query, expectedBand, fileName) {
  await evaluate(
    client,
    `(() => {
      const textarea = document.querySelector("textarea");
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      ).set;
      setter.call(textarea, ${JSON.stringify(query)});
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector('button[aria-label="추천 요청 보내기"]').click();
    })()`,
  );

  await waitForText(client, expectedBand);
  await waitForText(client, "예산대별로 나눠서 골라봤어요");
  await sleep(2_000);
  await evaluate(
    client,
    `(() => {
      const section = [...document.querySelectorAll("section")].find((item) =>
        item.innerText.includes("예산대별로 나눠서 골라봤어요")
      );
      document.documentElement.style.scrollBehavior = "auto";
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo(0, top);
      }
    })()`,
  );
  await sleep(1_500);
  await capture(client, fileName);
}

await mkdir(outputDir, { recursive: true });

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,1200",
    `${siteUrl}?capture=${Date.now()}`,
  ],
  { stdio: "ignore" },
);

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
      width: 1440,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await openHome(client);
    await sleep(1_500);
    await capture(client, "pickpick-home.png");

    await submitQuery(
      client,
      "부모님 선물 30만원대 추천해줘",
      "30만원대",
      "pickpick-results-budget.png",
    );

    await openHome(client);
    await submitQuery(
      client,
      "부모님께 드릴 건강 선물 추천해줘",
      "0~30만원",
      "pickpick-results-open-budget.png",
    );
  } finally {
    client.close();
  }
} finally {
  browser.kill();
}
