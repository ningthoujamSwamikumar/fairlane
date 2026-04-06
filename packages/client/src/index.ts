import { Client, Input, Options, PoliciesMapConfigs, Policy, PolicyName } from "./types";

const DEFAULT_RELAY_URL = "http://127.0.0.1:8787";

export function createAceClient(options: Options = {}): Client {
  const relayUrl = options.relayUrl ?? DEFAULT_RELAY_URL;

  return {
    policy<P extends PolicyName>(name: P, config: PoliciesMapConfigs[P]): Policy<P> {
      return { name, config };
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

  if (!input.metadata?.groupKey) {
    throw new Error("submit input requires metadata.groupKey");
  }
}

export const ace = createAceClient();
