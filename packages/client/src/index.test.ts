import test from "node:test";
import assert from "node:assert/strict";

import { createAceClient } from "./index.js";

test("policy returns named config", () => {
  const client = createAceClient();
  const policy = client.policy("anti_snipe_window", { windowMs: 400 });

  assert.deepEqual(policy, {
    name: "anti_snipe_window",
    config: { windowMs: 400 }
  });
});

test("submit validates required fields before fetch", async () => {
  const client = createAceClient();

  await assert.rejects(
    () =>
      client.submit({
        appId: "arena-game",
        policy: { name: "anti_snipe_window", config: {} },
        actionType: "claim_loot",
        metadata: {},
        tx: "tx"
      } as any),
    /scope/
  );
});

test("submit accepts generic scope metadata", async () => {
  const client = createAceClient();

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ status: "queued" }), {
      status: 202,
      headers: { "content-type": "application/json" }
    });

  const result = await client.submit({
    appId: "swap-app",
    policy: { name: "anti_snipe_window", config: { winnerRule: "first_intent" } },
    actionType: "swap",
    scope: {
      key: "pool:SOL-USDC:swap"
    },
    tx: "signed-tx",
    metadata: {
      pool: "SOL-USDC",
      side: "buy",
      actorId: "trader-a"
    }
  });

  assert.deepEqual(result, { status: "queued" });
});
