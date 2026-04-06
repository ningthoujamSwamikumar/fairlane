const pendingGroups = new Map();
const replayLog = [];
let replaySequence = 0;

export function createReplayStore() {
  return replayLog;
}

export function resetPolicyEngine() {
  pendingGroups.clear();
  replayLog.length = 0;
  replaySequence = 0;
}

export function submitAction(input) {
  validateAction(input);

  const now = Date.now();
  const action = normalizeAction(input, now);
  const config = action.policy.config ?? {};
  const windowMs = Number.isFinite(config.windowMs) ? config.windowMs : 400;
  const key = `${action.appId}:${action.metadata.groupKey}`;
  const existing = pendingGroups.get(key);

  if (!existing) {
    const record = {
      key,
      appId: action.appId,
      policy: action.policy,
      actions: [action],
      closeAt: now + windowMs,
      timer: setTimeout(() => finalizeGroup(key), windowMs)
    };
    pendingGroups.set(key, record);

    return {
      status: "queued",
      actionId: action.actionId,
      groupKey: action.metadata.groupKey,
      closesAt: record.closeAt
    };
  }

  existing.actions.push(action);
  return {
    status: "queued",
    actionId: action.actionId,
    groupKey: action.metadata.groupKey,
    closesAt: existing.closeAt
  };
}

export function getReplays() {
  return replayLog.slice().sort((a, b) => a.sequence - b.sequence);
}

function finalizeGroup(key) {
  const group = pendingGroups.get(key);
  if (!group) {
    return;
  }

  pendingGroups.delete(key);
  clearTimeout(group.timer);

  const ranked = [...group.actions].sort(compareActions);
  const winner = ranked[0];

  replayLog.push({
    sequence: ++replaySequence,
    appId: group.appId,
    groupKey: winner.metadata.groupKey,
    policy: group.policy.name,
    policyConfig: group.policy.config ?? {},
    receivedActions: group.actions.map(toReplayAction),
    decision: {
      winnerActionId: winner.actionId,
      winnerPlayerId: winner.metadata.playerId ?? "unknown",
      reason: "Earliest intent inside anti-snipe fairness window"
    },
    finalizedAt: Date.now()
  });
}

function compareActions(left, right) {
  const leftIntent = toIntentTime(left);
  const rightIntent = toIntentTime(right);

  if (leftIntent !== rightIntent) {
    return leftIntent - rightIntent;
  }

  if (left.receivedAt !== right.receivedAt) {
    return left.receivedAt - right.receivedAt;
  }

  return left.actionId.localeCompare(right.actionId);
}

function toIntentTime(action) {
  return typeof action.metadata.intentAt === "number" ? action.metadata.intentAt : action.receivedAt;
}

function toReplayAction(action) {
  return {
    actionId: action.actionId,
    tx: action.tx,
    metadata: action.metadata,
    receivedAt: action.receivedAt
  };
}

function normalizeAction(input, now) {
  return {
    appId: input.appId,
    actionId: input.actionId ?? crypto.randomUUID(),
    tx: input.tx ?? null,
    policy: input.policy,
    metadata: input.metadata,
    receivedAt: now
  };
}

function validateAction(input) {
  if (!input.appId) {
    throw new Error("appId is required");
  }

  if (!input.policy?.name) {
    throw new Error("policy.name is required");
  }

  if (input.policy.name !== "anti_snipe_window") {
    throw new Error(`unsupported policy: ${input.policy.name}`);
  }

  if (!input.metadata?.groupKey) {
    throw new Error("metadata.groupKey is required");
  }
}
