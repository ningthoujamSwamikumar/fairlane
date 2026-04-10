# ACE SDK MVP

ACE SDK is a demo-first execution policy layer for Solana apps. This workspace implements the narrowest useful hackathon version:

- one SDK integration surface
- one policy: `anti_snipe_window`
- one relay service
- one replay log plus execution-decision handoff for judges and builders

## Workspace

- `packages/client`: developer-facing ACE client
- `apps/relay`: minimal policy engine and HTTP relay
- `apps/demo`: scripted before/after demo flow

## Product framing

This MVP is intentionally not a generic sequencer. It demonstrates a generic execution-policy SDK with a game-style demo integration.

## Run locally

From `/home/ubuntu/ace-sdk`:

```bash
pnpm test
pnpm relay
pnpm demo
```

The relay listens on `http://127.0.0.1:8787`.

To point the relay at a local validator or BAM-backed cluster later:

```bash
ACE_SOLANA_RPC_URL=http://127.0.0.1:8899 pnpm relay
```

Optional:

```bash
ACE_SOLANA_RPC_MODE=sendTransaction
```

Use `probe` mode by default. `probe` verifies downstream validator reachability and emits a dispatch receipt even when the MVP action payload still carries a placeholder transaction string. `sendTransaction` is for the next phase where `tx` is a real base64-encoded signed Solana transaction.

## Current behavior

- groups actions by generic `scope.key`
- keeps app-specific fields inside one generic `metadata` bag
- closes a fairness window using `windowMs`
- orders candidates by winner rule, then by received time, then by action id
- records replay entries, execution decisions, and dispatch receipts
- can dispatch the winning action through a managed relay adapter or a Solana RPC adapter

## What this proves

- a normal app can configure policy with one SDK call
- the relay can deterministically resolve a contested action in any scoped flow such as a swap, launch, or game event
- the replay surface makes the execution decision understandable
- the relay emits a downstream execution artifact that a managed relay, Jito path, or future verifier can consume

## Next build steps

- replace `groupKey` with app metadata conventions like `matchId`
- add Solana transaction serialization and signer flow
- expose a small browser replay UI instead of raw JSON
- add a second policy such as `fair_queue`
- integrate with a real game or launch flow demo
