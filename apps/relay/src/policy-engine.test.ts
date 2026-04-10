import test from "node:test";
import assert from "node:assert/strict";

import { getDispatches, resetExecutionAdapter } from "./execution-adapter.js";
import { getDecisions, getReplays, resetPolicyEngine, submitAction } from "./policy-engine.js";

test("anti_snipe_window picks the earliest intent", async () => {
  resetPolicyEngine();
  resetExecutionAdapter();

  submitAction({
    appId: "swap-app",
    actionId: "late-send-early-intent",
    policy: { name: "anti_snipe_window", config: { windowMs: 20 } },
    actionType: "swap",
    scope: {
      key: "pool:SOL-USDC:swap",
      kind: "pool"
    },
    tx: "tx-a",
    metadata: {
      pool: "SOL-USDC",
      side: "buy",
      actorId: "trader-a",
      intentAt: 100
    }
  });

  submitAction({
    appId: "swap-app",
    actionId: "early-send-late-intent",
    policy: { name: "anti_snipe_window", config: { windowMs: 20 } },
    actionType: "swap",
    scope: {
      key: "pool:SOL-USDC:swap",
      kind: "pool"
    },
    tx: "tx-b",
    metadata: {
      pool: "SOL-USDC",
      side: "buy",
      actorId: "trader-b",
      intentAt: 120
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 35));

  const replays = getReplays();
  assert.equal(replays.length, 1);
  assert.equal(replays[0].decision.winnerActionId, "late-send-early-intent");
  assert.equal(replays[0].scope.key, "pool:SOL-USDC:swap");
  assert.equal(replays[0].actionType, "swap");

  const decisions = getDecisions();
  assert.equal(decisions.length, 1);
  assert.equal(decisions[0].winner.actionId, "late-send-early-intent");
  assert.equal(decisions[0].dispatch?.adapter, "managed_relay");
  assert.equal(getDispatches().length, 1);
});

test("anti_snipe_window works for game-style scopes without game-specific core types", async () => {
  resetPolicyEngine();
  resetExecutionAdapter();

  submitAction({
    appId: "arena-game",
    actionId: "player-a",
    policy: { name: "anti_snipe_window", config: { windowMs: 20 } },
    actionType: "claim_loot",
    scope: {
      key: "match-2:loot-9",
      kind: "loot_claim"
    },
    tx: "tx-a",
    metadata: {
      matchId: "match-2",
      lootId: "loot-9",
      actorId: "player-a",
      intentAt: 100
    }
  });

  submitAction({
    appId: "arena-game",
    actionId: "player-b",
    policy: { name: "anti_snipe_window", config: { windowMs: 20, winnerRule: "first_receipt" } },
    actionType: "claim_loot",
    scope: {
      key: "match-2:loot-9",
      kind: "loot_claim"
    },
    tx: "tx-b",
    metadata: {
      matchId: "match-2",
      lootId: "loot-9",
      actorId: "player-b",
      intentAt: 90
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 35));

  const replays = getReplays();
  assert.equal(replays[0].scope.key, "match-2:loot-9");
});
