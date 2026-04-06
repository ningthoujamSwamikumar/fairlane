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
    // @ts-ignore
    () => client.submit({ appId: "arena-game", policy: { name: "anti_snipe_window", config: {} }, metadata: {} }),
    /metadata\.groupKey/
  );
});
