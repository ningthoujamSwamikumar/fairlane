import test from "node:test";
import assert from "node:assert/strict";

import { getReplays, resetPolicyEngine, submitAction } from "./policy-engine.js";

test("anti_snipe_window picks the earliest intent", async () => {
  resetPolicyEngine();

  submitAction({
    appId: "arena-game",
    actionId: "late-send-early-intent",
    policy: { name: "anti_snipe_window", config: { windowMs: 20 } },
    tx: "tx-a",
    metadata: {
      groupKey: "match-1:loot-1",
      playerId: "player-a",
      intentAt: 100
    }
  });

  submitAction({
    appId: "arena-game",
    actionId: "early-send-late-intent",
    policy: { name: "anti_snipe_window", config: { windowMs: 20 } },
    tx: "tx-b",
    metadata: {
      groupKey: "match-1:loot-1",
      playerId: "player-b",
      intentAt: 120
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 35));

  const replays = getReplays();
  assert.equal(replays.length, 1);
  assert.equal(replays[0].decision.winnerActionId, "late-send-early-intent");
});
