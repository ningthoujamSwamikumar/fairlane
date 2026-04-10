import crypto from "node:crypto";

import type { DispatchReceipt, ExecutionDecision } from "@ace-sdk/client";

export interface ExecutionAdapter {
  /**
   * Accepts a finalized ACE decision and hands the winner to a downstream
   * execution backend. This is the seam where managed relay, RPC, Jito, or BAM
   * integrations can differ without changing the policy engine.
   */
  dispatch(decision: ExecutionDecision): Promise<DispatchReceipt>;
}

type DispatchRecord = {
  /**
   * Decision that produced this handoff attempt.
   */
  decisionId: string;
  /**
   * Adapter result returned after attempting downstream execution.
   */
  receipt: DispatchReceipt;
  /**
   * Winning action approved for execution.
   */
  winnerActionId: string;
  /**
   * Scope associated with the dispatched decision.
   */
  scopeKey: string;
};

const dispatchLog: DispatchRecord[] = [];
let activeAdapter: ExecutionAdapter = readExecutionAdapterFromEnv();

/**
 * The managed relay adapter is the MVP execution backend from the technical
 * plan. It stands in for a future Jito/BAM backend by accepting the winning
 * action and returning a signed handoff receipt that higher layers can inspect.
 */
export function createManagedRelayAdapter(): ExecutionAdapter {
  return {
    async dispatch(decision) {
      return {
        adapter: "managed_relay",
        status: "accepted",
        dispatchedAt: Date.now(),
        destination: `managed-relay://${decision.appId}/${decision.scope.key}`
      };
    }
  };
}

export function createSolanaRpcAdapter(options: { rpcUrl: string; mode?: "probe" | "sendTransaction" }): ExecutionAdapter {
  const mode = options.mode ?? "probe";

  return {
    async dispatch(decision) {
      /**
       * `probe` mode is for local integration bring-up: it proves the relay can
       * reach the validator RPC before the app has switched to real serialized
       * transactions. `sendTransaction` is the real forwarding path once `tx`
       * contains a valid base64 Solana transaction.
       */
      if (mode === "sendTransaction") {
        if (!decision.winner.tx) {
          return {
            adapter: "solana_rpc",
            status: "rejected",
            dispatchedAt: Date.now(),
            destination: options.rpcUrl
          };
        }

        await callJsonRpc(options.rpcUrl, "sendTransaction", [
          decision.winner.tx,
          { encoding: "base64", preflightCommitment: "processed" }
        ]);
      } else {
        await callJsonRpc(options.rpcUrl, "getVersion", []);
      }

      return {
        adapter: "solana_rpc",
        status: "accepted",
        dispatchedAt: Date.now(),
        destination: options.rpcUrl
      };
    }
  };
}

export function setExecutionAdapter(adapter: ExecutionAdapter) {
  activeAdapter = adapter;
}

export function resetExecutionAdapter() {
  dispatchLog.length = 0;
  activeAdapter = createManagedRelayAdapter();
}

export function getDispatches() {
  return dispatchLog.slice();
}

export async function dispatchDecision(decision: ExecutionDecision) {
  const receipt = await activeAdapter.dispatch(decision);
  const dispatchRecord = {
    decisionId: decision.decisionId,
    receipt,
    winnerActionId: decision.winner.actionId,
    scopeKey: decision.scope.key
  };

  dispatchLog.push(dispatchRecord);

  return {
    ...decision,
    dispatch: receipt,
    authorization: {
      ...decision.authorization,
      signature: signAuthorizationPayload(decision.authorization.payload)
    }
  } satisfies ExecutionDecision;
}

function signAuthorizationPayload(payload: ExecutionDecision["authorization"]["payload"]) {
  /**
   * This is not the final cryptographic scheme. For the MVP, we produce a
   * deterministic signature-like digest so the relay emits a concrete
   * authorization artifact that can later be replaced with a real service key.
   */
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function readExecutionAdapterFromEnv(): ExecutionAdapter {
  const rpcUrl = process.env.ACE_SOLANA_RPC_URL;

  if (!rpcUrl) {
    return createManagedRelayAdapter();
  }

  const mode = process.env.ACE_SOLANA_RPC_MODE === "sendTransaction" ? "sendTransaction" : "probe";
  return createSolanaRpcAdapter({ rpcUrl, mode });
}

async function callJsonRpc(rpcUrl: string, method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { error?: { message?: string } };

  if (payload.error) {
    throw new Error(payload.error.message ?? `RPC ${method} failed`);
  }
}
