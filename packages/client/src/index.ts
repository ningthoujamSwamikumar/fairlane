import { resolveScopeKey } from "./classifier.js";
import type { Client, Input, Options, PoliciesMapConfigs, Policy, PolicyName } from "./types.js";

const DEFAULT_RELAY_URL = "http://127.0.0.1:8787";

export function createAceClient(options: Options = {}): Client {
  const relayUrl = options.relayUrl ?? DEFAULT_RELAY_URL;

  return {
    /**
     * Creates a typed policy object without forcing the caller to hand-roll the
     * config shape. This keeps the public SDK small while still making policy
     * intent explicit at call sites.
     */
    policy<P extends PolicyName>(name: P, config: PoliciesMapConfigs[P]): Policy<P> {
      return { name, config } as Policy<P>;
    },

    async submit(input) {
      validateSubmitInput(input);

      const response = await fetch(`${relayUrl}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`ACE relay rejected request with status ${response.status}`);
      }

      return response.json();
    },

    async getReplays() {
      const response = await fetch(`${relayUrl}/replays`);
      if (!response.ok) {
        throw new Error(`ACE relay replay fetch failed with status ${response.status}`);
      }

      return response.json();
    },

    async getDecisions() {
      const response = await fetch(`${relayUrl}/decisions`);
      if (!response.ok) {
        throw new Error(`ACE relay decision fetch failed with status ${response.status}`);
      }

      return response.json();
    },

    async getDispatches() {
      const response = await fetch(`${relayUrl}/dispatches`);
      if (!response.ok) {
        throw new Error(`ACE relay dispatch fetch failed with status ${response.status}`);
      }

      return response.json();
    }
  };
}

function validateSubmitInput(input: Input) {
  if (!input || typeof input !== "object") {
    throw new Error("submit input is required");
  }

  if (!input.appId) {
    throw new Error("submit input requires appId");
  }

  if (!input.policy?.name) {
    throw new Error("submit input requires policy.name");
  }

  if (!input.actionType) {
    throw new Error("submit input requires actionType");
  }

  if (!resolveScopeKey(input)) {
    throw new Error("submit input requires scope.key");
  }

  if (!input.metadata || typeof input.metadata !== "object") {
    throw new Error("submit input requires metadata");
  }
}

export const ace = createAceClient();
export { resolveScopeKey } from "./classifier.js";
export * from "./types.js";
