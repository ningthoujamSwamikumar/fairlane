import type { Input } from "./types.js";

/**
 * Resolves the contention scope used by the relay decision engine.
 *
 * The technical plan separates classification from policy execution. This tiny
 * helper is the first concrete boundary: the app provides a generic `scope.key`
 * and the policy engine never needs to understand whether that scope came from
 * a swap pool, game loot item, launch market, or any other vertical concept.
 */
export function resolveScopeKey(input: Pick<Input, "scope">): string | null {
  if (input.scope?.key) {
    return input.scope.key;
  }

  return null;
}
