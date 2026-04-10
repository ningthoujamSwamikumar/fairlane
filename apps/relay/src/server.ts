import http from "node:http";
import { pathToFileURL } from "node:url";

import { getDispatches } from "./execution-adapter.js";
import { getDecisions, getReplays, submitAction } from "./policy-engine.js";

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 8787);

export function createRelayServer() {
  return http.createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/health") {
        return sendJson(response, 200, { ok: true, service: "ace-relay" });
      }

      if (request.method === "GET" && request.url === "/replays") {
        return sendJson(response, 200, { items: getReplays() });
      }

      if (request.method === "GET" && request.url === "/decisions") {
        return sendJson(response, 200, { items: getDecisions() });
      }

      if (request.method === "GET" && request.url === "/dispatches") {
        return sendJson(response, 200, { items: getDispatches() });
      }

      if (request.method === "POST" && request.url === "/submit") {
        const body = await readJsonBody(request);
        const result = submitAction(body);
        return sendJson(response, 202, result);
      }

      sendJson(response, 404, { error: "not_found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      sendJson(response, 400, { error: message });
    }
  });
}

export function startRelayServer() {
  const server = createRelayServer();
  server.listen(port, host, () => {
    console.log(`ACE relay listening on http://${host}:${port}`);
  });

  return server;
}

function sendJson(response: http.ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(request: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startRelayServer();
}
