import assert from "node:assert/strict";
import test from "node:test";

import type { ExecutionDecision } from "@ace-sdk/client";

import { createSolanaRpcAdapter } from "./execution-adapter.js";

test("solana rpc adapter probes validator reachability", async () => {
  const adapter = createSolanaRpcAdapter({
    rpcUrl: "http://127.0.0.1:8899",
    mode: "probe"
  });

  const fetchCalls: Array<{ method: string; params: unknown[] }> = [];
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    fetchCalls.push({ method: body.method, params: body.params });

    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: { "solana-core": "3.1.6" } }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  const receipt = await adapter.dispatch(makeDecision("probe-only"));
  assert.equal(receipt.adapter, "solana_rpc");
  assert.equal(receipt.status, "accepted");
  assert.equal(fetchCalls[0].method, "getVersion");
});

test("solana rpc adapter forwards winner transaction in sendTransaction mode", async () => {
  const adapter = createSolanaRpcAdapter({
    rpcUrl: "http://127.0.0.1:8899",
    mode: "sendTransaction"
  });

  const fetchCalls: Array<{ method: string; params: unknown[] }> = [];
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    fetchCalls.push({ method: body.method, params: body.params });

    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "mock-signature" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  const receipt = await adapter.dispatch(makeDecision("base64-transaction"));
  assert.equal(receipt.status, "accepted");
  assert.equal(fetchCalls[0].method, "sendTransaction");
  assert.equal(fetchCalls[0].params[0], "base64-transaction");
});

function makeDecision(tx: string): ExecutionDecision {
  const winner = {
    appId: "swap-app",
    actionId: "winner-1",
    tx,
    policy: { name: "anti_snipe_window" as const, config: { windowMs: 100 } },
    actionType: "swap",
    scope: { key: "pool:SOL-USDC:swap" },
    metadata: { actorId: "trader-a", intentAt: 100 },
    receivedAt: 100
  };

  return {
    decisionId: "decision-1",
    appId: "swap-app",
    actionType: "swap",
    scope: { key: "pool:SOL-USDC:swap" },
    policy: { name: "anti_snipe_window", config: { windowMs: 100 } },
    policyConfig: { windowMs: 100 },
    receivedActions: [winner],
    winner,
    losers: [],
    reason: "Earliest declared intent inside anti-snipe fairness window",
    authorization: {
      payload: {
        decisionId: "decision-1",
        appId: "swap-app",
        actionType: "swap",
        scopeKey: "pool:SOL-USDC:swap",
        winnerActionId: "winner-1",
        decidedAt: 100
      },
      signature: ""
    },
    decidedAt: 100
  };
}
