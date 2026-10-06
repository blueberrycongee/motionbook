/** Optional real-browser validation. Run only where normal Chromium launch is permitted. */
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = new URL("..", import.meta.url).pathname;
const output = path.join(root, "artifacts/browser");
await fs.mkdir(output, { recursive: true });
const server = spawn(process.execPath, [path.join(root, "src/server.mjs")], {
  stdio: ["ignore", "pipe", "inherit"],
  env: { ...process.env, PORT: "4173" },
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) => {
      if (code) reject(Error(`Server exited ${code}`));
    });
  });
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 840 },
    recordVideo: { dir: output, size: { width: 1280, height: 840 } },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/?demo");
  await page
    .getByRole("heading", { name: "Scheduled tasks", exact: true })
    .waitFor();
  await page.screenshot({ path: path.join(output, "list.png") });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Scheduled task title" })
    .fill("Evening walk");
  await page
    .getByRole("textbox", { name: "Prompt", exact: true })
    .fill("Remind me to take a twenty-minute walk.");
  await page.getByRole("button", { name: "Repeat", exact: true }).click();
  await page
    .getByRole("menuitemradio", { name: "Weekdays", exact: true })
    .click();
  await page.locator('input[name="time"]').fill("18:30");
  await page
    .locator(".panel-footer")
    .getByRole("button", { name: "Create", exact: true })
    .click();
  await page.getByText("Scheduled task created", { exact: true }).waitFor();
  await page
    .locator(".panel-toolbar")
    .getByRole("button", { name: "Scheduled task actions", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Run now", exact: true }).click();
  await page.getByText("Task completed", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, "detail.png") });
  await page.locator(".history-row").first().click();
  await page.getByText(/Your scheduled update is ready/).waitFor();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page
    .getByRole("button", { name: "Close scheduled task details", exact: true })
    .click();
  await page.locator(".task-row").filter({ hasText: "Evening walk" }).hover();
  await page
    .locator(".task-row")
    .filter({ hasText: "Evening walk" })
    .getByRole("button", { name: "Scheduled task actions" })
    .click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  if (errors.length) throw Error(errors.join("\n"));
  await fs.writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      { passed: true, kind: "actual-browser-runtime", pageErrors: errors },
      null,
      2,
    ),
  );
  await context.close();
  console.log(`Browser verification and recording saved to ${output}`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
