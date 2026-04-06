import http from "node:http";

import { getReplays, submitAction } from "./policy-engine.js";

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 8787);

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      return sendJson(response, 200, { ok: true, service: "ace-relay" });
    }

    if (request.method === "GET" && request.url === "/replays") {
      return sendJson(response, 200, { items: getReplays() });
    }

    if (request.method === "POST" && request.url === "/submit") {
      const body = await readJsonBody(request);
      const result = submitAction(body);
      return sendJson(response, 202, result);
    }

    sendJson(response, 404, { error: "not_found" });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`ACE relay listening on http://${host}:${port}`);
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
