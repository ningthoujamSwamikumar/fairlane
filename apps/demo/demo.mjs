import { setTimeout as sleep } from "node:timers/promises";

import { createAceClient } from "@ace-sdk/client";

const ace = createAceClient();
const policy = ace.policy("anti_snipe_window", {
  windowMs: 300,
  winnerRule: "first_intent"
});

console.log("Submitting two contested loot claims inside one anti-snipe window...");

await ace.submit({
  appId: "arena-game",
  actionId: "player-b-network-fast",
  policy,
  actionType: "claim_loot",
  scope: {
    key: "match-42:loot-epic-sword",
    kind: "loot_claim"
  },
  tx: "claim-loot-tx-b",
  metadata: {
    matchId: "match-42",
    lootId: "loot-epic-sword",
    actorId: "player-b",
    intentAt: Date.now() + 20
  }
});

await sleep(80);

await ace.submit({
  appId: "arena-game",
  actionId: "player-a-network-slow",
  policy,
  actionType: "claim_loot",
  scope: {
    key: "match-42:loot-epic-sword",
    kind: "loot_claim"
  },
  tx: "claim-loot-tx-a",
  metadata: {
    matchId: "match-42",
    lootId: "loot-epic-sword",
    actorId: "player-a",
    intentAt: Date.now() - 120
  }
});

await sleep(400);

const replayResponse = await ace.getReplays();
const replay = replayResponse.items.at(-1);
const decisionResponse = await ace.getDecisions();
const decision = decisionResponse.items.at(-1);
const dispatchResponse = await ace.getDispatches();
const dispatch = dispatchResponse.items.at(-1);

console.log(JSON.stringify(replay, null, 2));
console.log(JSON.stringify(decision, null, 2));
console.log(JSON.stringify(dispatch, null, 2));
