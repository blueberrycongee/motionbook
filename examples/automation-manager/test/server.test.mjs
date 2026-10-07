import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../src/server.mjs";
async function fetchFile(url) {
  let code, headers, body;
  await handleRequest(
    { url },
    {
      writeHead: (c, h) => {
        code = c;
        headers = h;
      },
      end: (b) => {
        body = b;
      },
    },
  );
  return { code, headers, body: String(body) };
}
test("HTTP handler serves runnable index and ES modules with correct types", async () => {
  const index = await fetchFile("/");
  assert.equal(index.code, 200);
  assert.match(index.body, /src\/app.mjs/);
  const js = await fetchFile("/src/app.mjs");
  assert.equal(js.code, 200);
  assert.equal(js.headers["content-type"], "text/javascript");
  const css = await fetchFile("/src/styles.css");
  assert.equal(css.code, 200);
  assert.equal(css.headers["content-type"], "text/css");
});
test("HTTP handler does not expose files outside the demo root", async () => {
  assert.equal((await fetchFile("/%2e%2e%2f%2e%2e%2fetc/passwd")).code, 403);
  assert.equal((await fetchFile("/does-not-exist")).code, 404);
});
