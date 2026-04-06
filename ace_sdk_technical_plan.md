# ACE SDK Technical Plan

Updated: 2026-04-03

## Validation Status

This technical plan has been revised after validating the thesis against Colosseum builder evidence, archive sources, and public BAM context as of 2026-04-03.

The main technical conclusion is:

- the architecture is valid
- the scope must remain app-level today
- the product moat should sit in policy logic, replay, simulation, and developer workflow
- BAM-native execution should remain a future adapter, not a present dependency

## Goal

Build a hackathon MVP that proves app-level execution policy can improve outcomes today, without depending on public BAM plugin access.

## Technical Principle

Separate:

1. policy definition
2. transaction classification
3. execution backend

This prevents the product from being blocked by BAM availability.

## Core Architecture

### 1. PolicySpec

Defines what the app wants.

Example fields:

- `policy_id`
- `target_program_id`
- `target_actions`
- `scope_key`
- `group_by`
- `policy_type`
- `params`
- `proof_mode`

Example policy:

```ts
{
  policy_id: "arena-anti-snipe",
  target_program_id: "<program>",
  target_actions: ["claim_loot"],
  scope_key: "matchId:lootId",
  group_by: "matchId",
  policy_type: "anti_snipe_window",
  params: {
    window_ms: 200,
    winner_rule: "first_intent"
  },
  proof_mode: "relay"
}
```

### 2. TxClassifier

Maps incoming transactions or app actions into policy buckets.

Classification inputs:

- program id
- instruction discriminator
- app metadata
- market or match id
- player id or user id
- action type

### 3. DecisionEngine

Applies policy logic.

For `anti_snipe_window`:

- collect all actions in a short time window
- group by protected scope
- select winner by deterministic rule
- record replay log

### 4. ExecutionAdapter

Abstracts where execution lands.

Implementations:

- `ManagedRelayAdapter`
- `JitoAdapter`
- later `BamPluginAdapter`

## Recommended Hackathon Implementation

### App type

Onchain game with contested loot claim

### Policy

`anti_snipe_window`

### Rule

- all `claim_loot` actions for the same `lootId` are held for `N` milliseconds
- if more than one claim arrives within the window, ACE applies winner selection rule
- final execution is routed through your chosen backend

### Winner rule options

- earliest signed intent
- earliest app receipt
- deterministic random seed

For the hackathon, use:

- earliest app receipt or earliest signed intent

Keep it simple and explainable.

## Enforcement Model

### Today

Enforcement is app-level, not network-global.

Possible methods:

- users submit protected actions through ACE relay
- app backend refuses to process unprotected execution paths
- onchain program requires ACE-issued authorization for protected actions
- app uses sequence ids, epochs, or signed permits to reject bypass flow

### Later with BAM

- BAM router identifies matching transactions
- plugin applies policy
- BAM TEE produces attestations
- validator executes the ordered stream

## Honest Guarantee Model

### What you can claim today

- consistent policy for all protected app actions routed through ACE
- deterministic decisioning
- explainable replay
- better app-level fairness
- app-level monetizable execution-quality infrastructure

### What you cannot claim today

- universal control over all Solana traffic
- validator-independent enforcement for arbitrary third-party submission
- BAM attestations
- BAM plugin implementation unless you actually receive access

## Suggested MVP API

```ts
const policy = ace.policy("anti_snipe_window", {
  windowMs: 200,
  groupBy: "lootId",
  winnerRule: "first_intent"
});

await ace.submit({
  appId: "arena-game",
  policy,
  tx,
  metadata: {
    matchId,
    lootId,
    playerId,
    actionType: "claim_loot"
  }
});
```

## Replay Requirements

Your replay output should show:

- raw action arrival order
- policy applied
- grouping key
- window duration
- winner
- loser(s)
- reason

This replay is essential. It turns invisible scheduling logic into something judges can trust.

## Suggested Future Policy Designs

### `anti_snipe_window`

- hold contested actions briefly
- choose winner by rule

### `fair_queue`

- order actions by normalized receive time or intent time
- use queue discipline across a market or match

### `cancel_before_take`

- give cancel messages priority over aggressive taking flow

### `priority_oracle_update`

- ensure oracle refresh lands before protected action
- useful with bundled execution

### `batch_match`

- accumulate actions within a short interval
- settle together

## Validation-Grounded Priority Order

Based on builder evidence and public landscape checks, the most validated policy order is:

1. `anti_snipe_window`
2. `fair_queue`
3. `cancel_before_take`
4. `priority_oracle_update`
5. `batch_match`

Why:

- anti-sniping and fair ordering have the clearest adjacent validation in `safer.fun`, `vertigo`, `fair-swap`, `urani`, and `openengine`
- these policies also map most naturally to BAM's public ACE discussion
- they are easier to explain than more abstract scheduling policies

## Resource Gaps And How To Handle Them

### BAM plugin unavailable

Response:

- keep policy logic in your own service
- build `BamPluginAdapter` as a future interface, not a current dependency

### BAM code unavailable

Response:

- rely on public docs and forum proposals for design direction
- do not claim direct implementation
- keep your policy schema aligned with likely BAM routing primitives such as program id and instruction markers

### No TEE attestation access

Response:

- use signed relay decisions and replay logs
- present attestations as a future guarantee layer

### No network-wide enforcement

Response:

- explicitly scope the claim to protected app flow
- use app and onchain constraints to minimize bypasses

## Technical Roadmap

### Phase 1

- game demo
- one policy
- replay log
- managed relay

### Phase 2

- dashboard
- richer simulator
- more policy templates
- Jito bundle integration

### Phase 3

- onchain registration of policies
- signed policy proofs
- dedicated app control plane

### Phase 4

- BAM plugin adapter
- BAM-native execution
- attested ordering

## Recommended Engineering Scope For The Hackathon

Must-have:

- one policy
- one app
- one replay output
- one strong story
- one believable monetization hook in the demo or deck

Nice-to-have:

- Jito bundle demo
- browser replay UI
- second policy

Validation note:

- if time is short, prioritize replay and product clarity over deeper backend sophistication
- the corpus supports user-visible value stories more strongly than hidden infra complexity stories

Do not spend time on:

- broad validator code
- generalized plugin framework
- more than one polished demo

## Technical Bottom Line

Build ACE as a policy engine with pluggable execution backends.

That gives you:

- a credible product today
- an honest answer about BAM
- a clear migration path when BAM plugin access opens
