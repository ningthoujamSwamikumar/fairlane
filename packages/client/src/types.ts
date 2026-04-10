export type WinnerRule = "first_intent" | "first_receipt";

export type Options = {
  /**
   * Base URL for the ACE relay service that receives protected actions.
   */
  relayUrl?: string;
};

export type Scope = {
  /**
   * Stable contention bucket. All actions with the same key compete inside the
   * same policy window regardless of app vertical.
   */
  key: string;
  /**
   * Optional semantic label that makes replay output easier to read without
   * changing decision behavior.
   */
  kind?: string;
};

/**
 * Single generic metadata bag supplied by the app. It stays intentionally open
 * so the same SDK can describe game moves, swap intents, launch buys, or any
 * other protected action without changing the core types.
 *
 * A few optional fields are modeled explicitly because the policy engine needs
 * stable names for cross-app behavior such as ranking and replay summaries.
 */
export type Metadata = Record<string, unknown> & {
  /**
   * Optional app-declared intent timestamp used by `first_intent` ordering.
   * If omitted, the relay falls back to its own receive timestamp.
   */
  intentAt?: number;
  /**
   * Generic actor identifier used in replay summaries. This can be a wallet,
   * user id, bot id, player id, maker id, or any other app-defined actor key.
   */
  actorId?: string;
};

export type PoliciesMapConfigs = {
  anti_snipe_window: {
    /**
     * How long the relay holds competing actions before it resolves a winner.
     * A short window is the core anti-sniping primitive in the MVP.
     */
    windowMs?: number;
    /**
     * The MVP supports the two ranking modes described in the technical plan.
     * `first_intent` prefers the earliest signed/app-declared intent timestamp.
     * `first_receipt` falls back to relay receive time for simpler integrations.
     */
    winnerRule?: WinnerRule;
  };
  fair_queue: {
    something?: string;
    windowMs?: number;
  };
};

export type PolicyName = keyof PoliciesMapConfigs;

type PolicyByName = {
  [P in PolicyName]: {
    name: P;
    config: PoliciesMapConfigs[P];
  };
};

export type Policy<P extends PolicyName = PolicyName> = PolicyByName[P];

export type Input = {
  /**
   * App-level namespace for protected flow. This is how the relay keeps one
   * app's policy domain isolated from another app's identical scope key.
   */
  appId: string;
  /**
   * Policy definition chosen by the app for this protected action.
   */
  policy: Policy;
  /**
   * Generic action label. This keeps policy routing product-wide instead of
   * baking game terms into the SDK.
   */
  actionType: string;
  /**
   * Generic policy scope used by the relay and, later, onchain verification.
   */
  scope: Scope;
  /**
   * Freeform app context recorded into replay logs, execution decisions, and
   * future authorization payloads.
   */
  metadata: Metadata;
  /**
   * Serialized transaction payload. In the current MVP this can be a placeholder
   * string, but the intended next phase is a real base64-encoded Solana
   * transaction for downstream submission.
   */
  tx: string;
  /**
   * Optional caller-supplied id. If omitted, the relay generates one so replay
   * and decision records can still refer to a stable action identifier.
   */
  actionId?: string;
};

export type ProtectedAction = {
  /**
   * Originating app namespace.
   */
  appId: string;
  /**
   * Stable identifier for this protected action after normalization.
   */
  actionId: string;
  /**
   * Serialized transaction payload carried forward to the execution adapter.
   */
  tx: string | null;
  /**
   * Policy attached to this action.
   */
  policy: Policy;
  /**
   * Generic app-defined action label such as `swap`, `buy`, or `claim_loot`.
   */
  actionType: string;
  /**
   * Contention bucket used by the decision engine.
   */
  scope: Scope;
  /**
   * Opaque app payload preserved for replay, authorization, and downstream
   * execution. The SDK intentionally does not prescribe its schema.
   */
  metadata: Metadata;
  /**
   * Relay receive timestamp assigned during normalization.
   */
  receivedAt: number;
};

export type DispatchReceipt = {
  /**
   * Identifier of the execution backend that handled the winning action.
   */
  adapter: string;
  /**
   * Whether the backend accepted the dispatch request.
   */
  status: "accepted" | "rejected";
  /**
   * Timestamp for when the adapter attempted downstream handoff.
   */
  dispatchedAt: number;
  /**
   * Destination path used by the adapter, such as a relay URI or RPC URL.
   */
  destination: string;
};

export type ExecutionDecision = {
  /**
   * Relay-generated identifier for the final decision artifact.
   */
  decisionId: string;
  /**
   * App namespace for this decision.
   */
  appId: string;
  /**
   * Generic action label shared by all competing actions in the decision.
   */
  actionType: string;
  /**
   * Scope that defined the contention set.
   */
  scope: Scope;
  /**
   * Policy that produced the final winner.
   */
  policy: Policy;
  /**
   * Serialized policy snapshot stored so replay and verification can see the
   * exact config used when the decision was made.
   */
  policyConfig: Record<string, unknown>;
  /**
   * All actions observed inside the fairness window for this scope.
   */
  receivedActions: ProtectedAction[];
  /**
   * The action selected by the decision engine for downstream execution.
   */
  winner: ProtectedAction;
  /**
   * Non-winning actions observed in the same protected window.
   */
  losers: ProtectedAction[];
  /**
   * Human-readable explanation used in replay and debugging surfaces.
   */
  reason: string;
  authorization: {
    /**
     * Canonical payload that a future verifier or onchain permit system can
     * authenticate. This is the bridge between policy decisioning and program
     * enforcement.
     */
    payload: {
      /**
       * Identifier of the execution decision this payload belongs to.
       */
      decisionId: string;
      /**
       * App namespace for verifier scoping.
       */
      appId: string;
      /**
       * Protected action label this decision applies to.
       */
      actionType: string;
      /**
       * Canonical contention scope for verifier replay protection and matching.
       */
      scopeKey: string;
      /**
       * Action approved for execution by ACE.
       */
      winnerActionId: string;
      /**
       * Timestamp of finalization used for expiry, replay, or audit semantics in
       * future verifier formats.
       */
      decidedAt: number;
    };
    /**
     * Signature-like proof over the authorization payload. The MVP uses a
     * deterministic digest, but this field is intentionally shaped for a real
     * service signature later.
     */
    signature: string;
  };
  /**
   * Optional downstream handoff result recorded after adapter dispatch.
   */
  dispatch?: DispatchReceipt;
  /**
   * Relay timestamp for when the winner was finalized.
   */
  decidedAt: number;
};

export interface Client {
  policy<P extends PolicyName>(name: P, config: PoliciesMapConfigs[P]): Policy<P>;
  submit(input: Input): Promise<any>;
  getReplays(): Promise<any>;
  getDecisions(): Promise<any>;
  getDispatches(): Promise<any>;
}
