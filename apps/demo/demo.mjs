import { setTimeout as sleep } from "node:timers/promises";

import { createAceClient } from "../../packages/client/src/index.js";

const ace = createAceClient();
const policy = ace.policy("anti_snipe_window", {
  windowMs: 300,
  priorityRule: "first-intent"
});

console.log("Submitting two contested loot claims inside one anti-snipe window...");

await ace.submit({
  appId: "arena-game",
  actionId: "player-b-network-fast",
  policy,
  tx: "claim-loot-tx-b",
  metadata: {
    groupKey: "match-42:loot-epic-sword",
    playerId: "player-b",
    actionType: "claim_loot",
    intentAt: Date.now() + 20
  }
});

await sleep(80);

await ace.submit({
  appId: "arena-game",
  actionId: "player-a-network-slow",
  policy,
  tx: "claim-loot-tx-a",
  metadata: {
    groupKey: "match-42:loot-epic-sword",
    playerId: "player-a",
    actionType: "claim_loot",
    intentAt: Date.now() - 120
  }
});

await sleep(400);

const replayResponse = await ace.getReplays();
const replay = replayResponse.items.at(-1);

console.log(JSON.stringify(replay, null, 2));
