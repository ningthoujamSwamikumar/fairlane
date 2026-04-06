# Session Context

Updated: 2026-04-03

## Current goal

Build a Colosseum-ready ACE SDK MVP for Solana centered on one clear promise: fair contested action execution for games.

## Product decisions

- Focus on games first.
- Sell outcome-oriented execution policies, not validator internals.
- Start with one policy only: `anti_snipe_window`.
- The MVP surface is `SDK + relay + replay log`.

## What exists now

- New repo at `/home/ubuntu/ace-sdk`
- `@ace-sdk/client` with `policy()`, `submit()`, and `getReplays()`
- Relay service with deterministic anti-snipe grouping and winner selection
- Scripted demo flow that shows two players contesting one loot claim

## Open gaps

- No real Solana transaction submission yet
- No browser UI yet
- No second policy yet
- No Anchor/game integration yet

## Next high-value steps

1. Add a tiny frontend replay page for judges.
2. Integrate one real Solana demo app transaction flow.
3. Encode richer policy metadata like `matchId` and `cutoffAt`.
4. Add `fair_queue` as a second template.
