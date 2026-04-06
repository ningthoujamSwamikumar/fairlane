# ACE SDK MVP

ACE SDK is a demo-first execution policy layer for Solana apps. This workspace implements the narrowest useful hackathon version:

- one SDK integration surface
- one policy: `anti_snipe_window`
- one relay service
- one replay log for judges and builders

## Workspace

- `packages/client`: developer-facing ACE client
- `apps/relay`: minimal policy engine and HTTP relay
- `apps/demo`: scripted before/after demo flow

## Product framing

This MVP is intentionally not a generic sequencer. It demonstrates outcome-oriented execution policy for a game-like contested action flow.

## Run locally

From `/home/ubuntu/ace-sdk`:

```bash
npm test
node ./apps/relay/src/server.js
node ./apps/demo/demo.mjs
```

The relay listens on `http://127.0.0.1:8787`.

## Current behavior

- groups actions by `groupKey`
- closes a fairness window using `windowMs`
- orders candidates by intent time, then by received time, then by action id
- records replay entries with the decision reason

## What this proves

- a normal app can configure policy with one SDK call
- the relay can deterministically resolve a contested action
- the replay surface makes the execution decision understandable

## Next build steps

- replace `groupKey` with app metadata conventions like `matchId`
- add Solana transaction serialization and signer flow
- expose a small browser replay UI instead of raw JSON
- add a second policy such as `fair_queue`
- integrate with a real game or launch flow demo
