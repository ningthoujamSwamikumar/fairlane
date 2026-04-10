import crypto from "node:crypto";

import { resolveScopeKey } from "@ace-sdk/client";
import type { ExecutionDecision, Input, Metadata, Policy, ProtectedAction, Scope, WinnerRule } from "@ace-sdk/client";

import { dispatchDecision } from "./execution-adapter.js";

type ReplayLog = {
  /**
   * Monotonic sequence for replay ordering.
   */
  sequence: number;
  /**
   * Originating app namespace.
   */
  appId: string;
  /**
   * Scope that defined the protected contention set.
   */
  scope: Scope;
  /**
   * Generic protected action label.
   */
  actionType: string;
  /**
   * Policy name used for the replay entry.
   */
  policy: string;
  /**
   * Policy config snapshot used when the winner was chosen.
   */
  policyConfig: Record<string, unknown>;
  /**
   * Raw actions observed inside the fairness window.
   */
  receivedActions: ReplayAction[];
  decision: {
    /**
     * Final winning action identifier.
     */
    winnerActionId: string;
    /**
     * Best-effort actor label for UI/debug visibility.
     */
    winnerPlayerId: string;
    /**
     * Human-readable explanation of the ordering rule that fired.
     */
    reason: string;
  };
  /**
   * Finalization timestamp for this replay record.
   */
  finalizedAt: number;
};

type ReplayAction = {
  /**
   * Stable action identifier used in replay and decision artifacts.
   */
  actionId: string;
  /**
   * Serialized transaction payload as received by the relay.
   */
  tx: string | null;
  /**
   * Generic action label shared by all contenders in the group.
   */
  actionType: string;
  /**
   * Protected scope associated with this action.
   */
  scope: Scope;
  /**
   * Opaque app metadata preserved for replay and future verification.
   */
  metadata: Metadata;
  /**
   * Relay receive timestamp for ordering analysis.
   */
  receivedAt: number;
};

type GroupRecord = {
  /**
   * Internal map key combining app id and scope key.
   */
  key: string;
  /**
   * Originating app namespace.
   */
  appId: string;
  /**
   * Shared policy for all actions in the group.
   */
  policy: Policy;
  /**
   * Collected actions waiting for the fairness window to close.
   */
  actions: ProtectedAction[];
  /**
   * Scheduled close time for the group.
   */
  closeAt: number;
  /**
   * Timer that finalizes the group when the window expires.
   */
  timer: NodeJS.Timeout;
};

const pendingGroups = new Map<string, GroupRecord>();
const replayLog: ReplayLog[] = [];
const decisionLog: ExecutionDecision[] = [];
let replaySequence = 0;

export function createReplayStore() {
  return replayLog;
}

export function resetPolicyEngine() {
  pendingGroups.clear();
  replayLog.length = 0;
  decisionLog.length = 0;
  replaySequence = 0;
}

export function submitAction(input: Input) {
  validateAction(input);

  const now = Date.now();
  const action = normalizeAction(input, now);
  const config = action.policy.config;
  const windowMs = Number.isFinite(config.windowMs) ? config.windowMs : 400;
  const key = `${action.appId}:${action.scope.key}`;
  const existing = pendingGroups.get(key);

  if (!existing) {
    const record = {
      key,
      appId: action.appId,
      policy: action.policy,
      actions: [action],
      closeAt: now + windowMs!,
      timer: setTimeout(() => finalizeGroup(key), windowMs)
    };
    pendingGroups.set(key, record);

    return {
      status: "queued",
      actionId: action.actionId,
      scopeKey: action.scope.key,
      closesAt: record.closeAt
    };
  }

  existing.actions.push(action);
  return {
    status: "queued",
    actionId: action.actionId,
    scopeKey: action.scope.key,
    closesAt: existing.closeAt
  };
}

export function getReplays() {
  return replayLog.slice().sort((a, b) => a.sequence - b.sequence);
}

export function getDecisions() {
  return decisionLog.slice().sort((a, b) => a.decidedAt - b.decidedAt);
}

function finalizeGroup(key: string) {
  const group = pendingGroups.get(key);
  if (!group) {
    return;
  }

  pendingGroups.delete(key);
  clearTimeout(group.timer);

  const winnerRule = readWinnerRule(group.policy);
  /**
   * The ranking step is the heart of the policy engine. We sort once using a
   * deterministic comparator so the eventual replay can explain exactly why the
   * winner was selected and why ties break the same way every time.
   */
  const ranked = [...group.actions].sort((left, right) => compareActions(left, right, winnerRule));
  const winner = ranked[0];
  const losers = ranked.slice(1);
  const decidedAt = Date.now();
  const reason = describeWinnerRule(winnerRule);
  const decision = createExecutionDecision(group.policy, ranked, winner, losers, reason, decidedAt);

  replayLog.push({
    sequence: ++replaySequence,
    appId: group.appId,
    scope: winner.scope,
    actionType: winner.actionType,
    policy: group.policy.name,
    policyConfig: (group.policy.config ?? {}) as Record<string, unknown>,
    receivedActions: group.actions.map(toReplayAction),
    decision: {
      winnerActionId: winner.actionId,
      winnerPlayerId: readActorId(winner.metadata),
      reason
    },
    finalizedAt: decidedAt
  });

  void dispatchDecision(decision).then((dispatchedDecision) => {
    const index = decisionLog.findIndex((entry) => entry.decisionId === dispatchedDecision.decisionId);
    if (index === -1) {
      decisionLog.push(dispatchedDecision);
      return;
    }

    decisionLog[index] = dispatchedDecision;
  });
}

function compareActions(left: ProtectedAction, right: ProtectedAction, winnerRule: WinnerRule) {
  const leftPrimary = toPriorityTime(left, winnerRule);
  const rightPrimary = toPriorityTime(right, winnerRule);

  if (leftPrimary !== rightPrimary) {
    return leftPrimary - rightPrimary;
  }

  if (left.receivedAt !== right.receivedAt) {
    return left.receivedAt - right.receivedAt;
  }

  return left.actionId.localeCompare(right.actionId);
}

function toPriorityTime(action: ProtectedAction, winnerRule: WinnerRule) {
  if (winnerRule === "first_receipt") {
    return action.receivedAt;
  }

  return typeof action.metadata.intentAt === "number" ? action.metadata.intentAt : action.receivedAt;
}

function toReplayAction(action: ProtectedAction): ReplayAction {
  return {
    actionId: action.actionId,
    tx: action.tx,
    actionType: action.actionType,
    scope: action.scope,
    metadata: action.metadata,
    receivedAt: action.receivedAt
  };
}

function normalizeAction(input: Input, now: number): ProtectedAction {
  const scopeKey = resolveScopeKey(input);

  if (!scopeKey) {
    throw new Error("input does not resolve to a policy scope");
  }

  const scope: Scope = input.scope ?? {
    key: scopeKey
  };

  return {
    appId: input.appId,
    actionId: input.actionId ?? crypto.randomUUID(),
    tx: input.tx ?? null,
    policy: input.policy,
    actionType: input.actionType,
    scope,
    metadata: input.metadata,
    receivedAt: now
  };
}

function validateAction(input: Input) {
  if (!input.appId) {
    throw new Error("appId is required");
  }

  if (!input.policy?.name) {
    throw new Error("policy.name is required");
  }

  if (!input.actionType) {
    throw new Error("actionType is required");
  }

  if (input.policy.name !== "anti_snipe_window") {
    throw new Error(`unsupported policy: ${input.policy.name}`);
  }

  if (!resolveScopeKey(input)) {
    throw new Error("scope.key is required");
  }

  if (!input.metadata || typeof input.metadata !== "object") {
    throw new Error("metadata is required");
  }
}

function readWinnerRule(policy: Policy): WinnerRule {
  if (policy.name !== "anti_snipe_window") {
    return "first_intent";
  }

  const antiSnipePolicy = policy as Policy<"anti_snipe_window">;
  return antiSnipePolicy.config.winnerRule ?? "first_intent";
}

function describeWinnerRule(winnerRule: WinnerRule) {
  if (winnerRule === "first_receipt") {
    return "Earliest relay receipt inside anti-snipe fairness window";
  }

  return "Earliest declared intent inside anti-snipe fairness window";
}

function createExecutionDecision(
  policy: Policy,
  receivedActions: ProtectedAction[],
  winner: ProtectedAction,
  losers: ProtectedAction[],
  reason: string,
  decidedAt: number
): ExecutionDecision {
  const decisionId = crypto.randomUUID();
  /**
   * This payload is the verifier-facing summary of what ACE approved. It is
   * intentionally narrower than the full replay record so a contract or
   * external execution backend can verify the minimum necessary facts.
   */
  const authorizationPayload = {
    decisionId,
    appId: winner.appId,
    actionType: winner.actionType,
    scopeKey: winner.scope.key,
    winnerActionId: winner.actionId,
    decidedAt
  };

  const decision = {
    decisionId,
    appId: winner.appId,
    actionType: winner.actionType,
    scope: winner.scope,
    policy,
    policyConfig: (policy.config ?? {}) as Record<string, unknown>,
    receivedActions,
    winner,
    losers,
    reason,
    authorization: {
      payload: authorizationPayload,
      signature: ""
    },
    decidedAt
  } satisfies ExecutionDecision;

  decisionLog.push(decision);
  return decision;
}

function readActorId(metadata: Metadata) {
  if (typeof metadata.actorId === "string") {
    return metadata.actorId;
  }

  if (typeof metadata.playerId === "string") {
    return metadata.playerId;
  }

  return "unknown";
}
