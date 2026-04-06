# FAIRLANE SDK Product Thesis

Updated: 2026-04-03

## Validation Status

This document is now revised against Colosseum builder evidence, archive sources, and current public BAM/Jito landscape checks as of 2026-04-03.

The result is:

- the core thesis is validated directionally
- the monetization thesis is plausible and strong
- the market evidence is strongest for execution-quality, MEV mitigation, fair ordering, and anti-sniping
- the games-first wedge is validated primarily as the clearest demo and adoption wedge, not as the most saturated or fully proven execution-policy category

This distinction matters. It means the product should be presented as:

- a fairness and execution-quality layer with games as the first demo wedge

not as:

- a fully validated standalone game infrastructure category already proven by many direct analogs

## Working Title

Execution policy layer for Solana apps: plug-in fair queueing, anti-sniping, and execution-quality controls without forcing app teams to become validator experts.

## One-Sentence Pitch

Fairlane SDK lets Solana apps mark certain user actions as protected flow, attach an execution policy such as anti-sniping or fair queueing, and enforce that policy consistently through a managed relay today and BAM-native execution tomorrow.

## Executive Summary

The core opportunity is not "generic sequencing infrastructure for everyone." The stronger opportunity is a productized execution policy layer for one app category first.

The best wedge is onchain games with contested actions, scarce resources, turn resolution, or timing-sensitive claims. This wedge is strong because:

- the pain is easy to see
- the baseline is visibly unfair
- the fixed outcome is intuitive
- the integration story is simple enough for hackathon judges to follow

This view is aligned with the earlier internal summary in [top_3_crypto_product_ideas.md](./top_3_crypto_product_ideas.md#L11) and [solana_idea_review_compilation.md](./solana_idea_review_compilation.md#L133).

The company is not just an SDK. The SDK is the entry point. The business is the hosted policy layer, relay, simulator, replay tooling, and execution analytics, as already captured in [top_3_crypto_product_ideas.md](./top_3_crypto_product_ideas.md#L17) and [solana_idea_review_compilation.md](./solana_idea_review_compilation.md#L178).

## Product Definition

Fairlane SDK is an app-controlled execution policy layer for Solana.

Developers define:

- which actions are protected
- which policy applies
- how transactions should be grouped
- what fairness or safety guarantees they want

Fairlane then provides:

- policy configuration SDK
- managed relay and routing
- decision engine
- replay and explainability
- analytics and simulation

### Important clarification

Fairlane should not be described as a "global policy engine for all Solana transactions."

That claim is too broad unless BAM plugin access and BAM-native enforcement are available.

Instead, Fairlane should be described as:

`A global execution policy within an app's protected execution domain.`

That means:

- every protected action for a given app or market is routed through the same policy
- all users in that app flow get the same treatment
- the app can enforce or strongly prefer that flow
- BAM is the future enforcement backend, not the only source of value

This is the most important positioning discipline for the hackathon.

## Problem

Many Solana apps care deeply about transaction ordering, timing, batching, and fairness, but most developers do not want to become validator or market-structure experts.

Without an execution policy layer, apps face issues like:

- last-millisecond sniping
- unfair race conditions
- stale quote pickup
- adverse selection against market makers
- poor player trust in games
- weak or opaque launch quality

These issues are not theoretical.

Builder evidence from Colosseum projects shows repeated demand around fair ordering, MEV mitigation, anti-sniping, and timing-sensitive execution:

- `fair-swap` (Cypherpunk, Sep 2025) focuses on fair batch auctions and MEV resistance
- `safer.fun` (Radar, Sep 2024) focuses on anti-sniping and fair launches
- `vertigo` (Breakout, Apr 2025) positions as a sniper-proof DEX for launches
- `urani` (Renaissance, Mar 2024; Accelerator C1) focuses on intent-based swaps with MEV protection
- `archer-exchange` (Cypherpunk, Sep 2025; Accelerator C4) focuses on batch-auction exchange design
- `supersize` (Radar, Sep 2024; 1st Place Gaming; Accelerator C2) validates that onchain games are a real developer and user category
- `lepoker` (Renaissance, Mar 2024; Honorable Mention Gaming) validates that fairness and trust are important themes inside competitive game design

This does not prove a winner already exists for Fairlane. It proves the pain and adjacency are real.

The strongest proof is in adjacent execution-quality and fairness systems:

- `urani` (Renaissance, Mar 2024; 1st Place DeFi & Payments; Accelerator C1) is explicitly application-layer MEV protection
- `fair-swap` (Cypherpunk, Sep 2025) is fair sequencing through batch auctions
- `openengine` (Cypherpunk, Sep 2025) is transparent transaction ordering infrastructure
- `vertigo` (Breakout, Apr 2025; 2nd Place Infrastructure) is anti-sniping for launch flows

The weaker but still useful proof is in games:

- game builders and game winners exist in the corpus
- fairness and player trust are intuitive in game settings
- but the corpus does not yet show many direct "execution policy layer for games" companies

So the correct reading is:

- the execution-policy problem is validated
- the games-first wedge is a sharp GTM and demo choice
- the exact company shape still has whitespace

As of 2026-04-03, based on available builder evidence and public landscape checks, the space appears adjacent rather than fully owned. There are multiple products addressing fairness or MEV for specific use cases, but not an obvious app-developer-first execution policy layer spanning games first and later launches and trading.

## Why Now

The timing is strong for three reasons.

1. Solana execution infrastructure is evolving.
Public BAM docs describe a dedicated BAM node and validator path for transaction scheduling, and BAM explicitly positions itself as sequencing infrastructure for Solana apps and validators. Public docs also state that BAM sequences both normal transactions and Jito bundles, and that RPC and direct TPU flow are processed through BAM when the validator is connected to BAM ([bam.dev/docs](https://bam.dev/docs/)).

2. The plugin direction is public even if the tooling is not.
As of 2026-04-03, BAM's plugin page says the plugin system is under development and offers early access, not general availability ([bam.dev/plugins](https://bam.dev/plugins/)).

3. Public discussion already points toward app-level ACE.
The BAM forum proposal "Brainstorming Paths to ACE on BAM" frames ACE as granular control over transaction ordering and proposes a permissionless opt-in speed bump plugin with app registration and per-transaction fees ([forum.bam.dev/t/brainstorming-paths-to-ace-on-bam/28](https://forum.bam.dev/t/brainstorming-paths-to-ace-on-bam/28)).

## Market Thesis

The best initial customer is:

- onchain game developers

The next segments later are:

- launchpads
- consumer trading apps

### Why games first

- fairness is easier to explain than trading microstructure
- contested actions make good demos
- judges can understand "this loot claim was unfair, now it is fair"
- game developers are more willing to adopt an opinionated plug-in service

This is supported by builder and archive evidence, but with an important nuance:

- Colosseum winners such as `supersize` show games are a credible category on Solana
- archive sources such as "The Open Problems of Onchain Games" (Paradigm, 2023-08-14) and "Unblocking On-Chain Games: Part One — Throughput" (Alliance, 2024-08-09) show game design onchain is deeply constrained by execution, timing, and throughput
- however, most direct fairness and anti-sniping evidence in the corpus comes from trading, launch, and MEV-adjacent products rather than game-specific execution middleware

That means games remain the best first wedge for clarity, not because the category is most populated with direct predecessors, but because the problem is easiest to make legible.

### Why not start with all apps

- it makes the demo abstract
- it weakens the story
- it invites technical questions you cannot yet answer with BAM still gated
- it dilutes the first policy and first customer

## Product Thesis

Fairlane should be framed as a managed execution policy layer, not a low-level BAM wrapper.

### Product layers

1. SDK
2. managed relay / policy engine
3. simulator / replay tools
4. analytics and debugging dashboard

### Initial policy templates

- `anti_snipe_window`
- `fair_queue`
- `cancel_before_take`
- `priority_oracle_update`
- `batch_match`

### Recommended first policy

`anti_snipe_window`

Why:

- easy to explain
- easy to demo
- maps cleanly onto public BAM ACE discussion
- has a clear monetization path

## What "Global Policy" Means In Practice

This needs to be defined precisely in your deck and demo.

The correct definition:

`Global means globally applied across the app's protected flow, not globally applied across all Solana traffic.`

For example:

- every `claim_loot` call for `arena-game` uses the same anti-sniping policy
- every hot launch `buy` action for a launchpad market uses the same fair-queue policy
- every protected taker flow for a DEX market uses the same speed bump policy

This keeps the claim true and still strong.

If BAM plugin access becomes public, the same policies can move down from your managed relay into BAM-native scheduling.

## Monetization Thesis

The monetization path is one of the strongest parts of the idea.

Do not sell "an SDK."
Sell "hosted execution quality infrastructure."

### Why customers pay

- better user trust
- reduced toxic flow
- less custom infra work
- fewer fairness incidents
- better launch quality
- better market quality
- explainability for operators and users

### Monetization model

Free:

- local SDK
- local simulator
- one sample policy

Paid developer tier:

- hosted relay
- replay history
- policy configuration dashboard
- usage analytics

Paid growth tier:

- per-policy tuning
- simulation and backtesting
- SLA and support
- richer observability

Enterprise tier:

- custom policies
- dedicated routing
- compliance or audit logs
- premium analytics
- integration engineering

### Pricing concept

- platform subscription
- plus usage fee per protected transaction or per protected action group

### Strongest first revenue story

- games pay for fair contested actions
- launchpads pay to reduce sniping and improve launch quality
- trading apps pay for market-quality protections such as speed bumps and cancel priority

Validation note:

- launchpads and trading have the strongest direct adjacent evidence today
- games are still a valid first wedge if the product is framed as fairness infrastructure with replay and explainability, rather than as a generic game middleware platform

This is directionally consistent with BAM's own public forum discussion, which explicitly argues that ACE plugins consume real resources and should likely charge registration and per-transaction fees ([forum.bam.dev/t/brainstorming-paths-to-ace-on-bam/28](https://forum.bam.dev/t/brainstorming-paths-to-ace-on-bam/28)).

## Hackathon Thesis

The hackathon goal is not to prove full BAM integration.

The hackathon goal is to prove:

- developers want app-level execution policy
- one policy can materially improve outcomes
- the integration surface is simple
- the replay view makes the decision understandable
- the business can monetize hosted policy execution

### Winning principle

Show exactly what you claim.

Do not say:

- "we control Solana execution globally"
- "we built BAM plugins"
- "we solved sequencing for all apps"

Say:

- "we built a BAM-ready execution policy layer for Solana apps"
- "it works today through a managed relay and is designed to move into BAM plugins when those become available"
- "we start with one narrow but valuable policy for one app category"

That is both honest and strong.

### Colosseum validation note

This framing is closer to Colosseum-winning standards than a broader infrastructure claim because:

- winners usually present a visible pain and a crisp before/after
- adjacent winners show that fair execution, launch fairness, and MEV mitigation are legible and fundable problems
- the strongest stories tend to show a narrow wedge first, not a universal control plane

The docs should therefore optimize for:

- obvious user pain
- visible improvement
- honest scope
- monetization beyond open-source code

## Hackathon MVP

### Demo category

Onchain game with contested loot claim or turn resolution

### Baseline

- two players attempt the same scarce action
- winner depends on last-millisecond arrival
- users perceive the system as unfair

### With ACE

- the app marks the action as protected
- policy is `anti_snipe_window`
- transactions are grouped by `matchId` or `lootId`
- ACE holds actions for a very small window
- winner is selected deterministically using a documented rule
- replay shows what happened and why

### MVP components

- small SDK API
- managed relay / policy engine
- replay page or console replay view
- one real demo app
- one monetization slide

### Success criteria

- integration in under 30 minutes
- judges understand the problem in under 30 seconds
- judges understand the fix in under 60 seconds
- the monetization path is clear in one slide
- the BAM fallback story is honest and credible

## Demo Script

### 2-minute version

"Solana is moving toward application-controlled execution, but today most teams still cannot use those capabilities without deep infra expertise.

We built ACE SDK, an execution policy layer for Solana apps.

Here is a simple onchain game with contested loot. In the baseline version, whoever wins the last-millisecond race gets the loot. That creates sniping, unfair outcomes, and poor player trust.

Now the developer adds one policy: `anti_snipe_window`.

With one integration, ACE routes all protected loot-claim actions through our policy engine. When two players claim the same loot near the cutoff, ACE groups those transactions, applies the app's fairness rule, and resolves the outcome deterministically.

This replay shows the incoming actions, the policy applied, the final winner, and the reason. The developer did not need to write custom sequencing logic or operate validator infrastructure.

Today this runs through our managed relay. As BAM plugins become available, the same policy layer can move into BAM-native execution.

The business is not just the SDK. We monetize the hosted policy layer, replay, simulation, and analytics for games first, then launchpads and trading apps next." 

### 30-second version

"ACE SDK gives Solana apps plug-in execution policies. Instead of building validator-grade infra, a developer marks certain actions as protected and attaches a policy like anti-sniping. We show this in a game today, monetize the hosted policy engine and analytics, and are designed to become BAM-native when plugin access opens."

## Pitch Deck Structure

1. Problem

- apps care about fairness and execution quality
- most teams cannot build custom sequencing infra

2. Product

- ACE SDK = execution policy layer
- SDK + relay + replay + analytics

3. Demo

- baseline unfair game flow
- protected game flow with anti-sniping

4. Why now

- BAM / ACE direction is real
- plugin ecosystem is emerging
- apps need practical tooling now

5. Market

- games first
- launchpads second
- consumer trading third

6. Monetization

- hosted relay
- per protected transaction
- analytics and simulation

7. Roadmap

- managed relay now
- BAM-native adapter later

## Plan For The Hackathon

### What to build

- one game demo
- one policy
- one replay surface
- one monetization story

### What not to build

- a generalized sequencer
- many policies
- a giant dashboard
- speculative validator internals you cannot prove

### Team priorities

1. Nail the baseline vs protected demo
2. Make policy configuration feel simple
3. Make the replay view legible
4. Keep the BAM transition story credible
5. Keep the pitch honest

## Future Plan

### Phase 1: Hackathon wedge

- games
- one policy
- replay
- explainability

### Phase 2: Productization

- policy dashboard
- hosted analytics
- simulation and backtesting
- richer developer APIs

### Phase 3: Expansion

- launchpad anti-sniping
- fair queue for contested mints
- DEX speed bumps
- cancel-before-take
- oracle-priority bundles

Validation note:

Based on builder evidence, these expansion areas are at least as well-supported as the games wedge, and arguably better supported in the current corpus. That makes them the most credible follow-on verticals after the hackathon.

### Phase 4: BAM-native execution

- BAM plugin adapter
- attested ordering proofs
- deeper validator integration
- stronger guarantees

## What To Do While BAM Plugins Are Not Available

This is a critical part of the thesis, not a weakness to hide.

### Current reality

As of 2026-04-03:

- BAM documentation is public ([bam.dev/docs](https://bam.dev/docs/))
- BAM plugin direction is public
- BAM plugin developer tooling is not generally available yet ([bam.dev/plugins](https://bam.dev/plugins/))

### Product strategy

Build ACE in two layers:

1. policy logic layer
2. execution backend layer

The policy logic layer is your product moat.
The execution backend can change over time.

### Backend strategy

Today:

- managed relay
- Jito transaction send
- Jito bundles where useful
- app-layer and onchain enforcement hooks

Later:

- BAM plugin adapter
- TEE-based attestations
- BAM-native routing and sequencing

This lets you ship today without blocking on BAM.

### How to explain it to judges

"We are not pretending BAM plugins are publicly available today. We built the app-facing policy layer now, using managed routing and existing Solana execution paths, and designed the architecture so the same policy definitions can move into BAM as that interface matures."

That answer is credible.

## Why This Can Be Fundable

The strongest reasons:

- visible pain
- strong demo surface
- monetization beyond open-source SDK
- wedge into multiple valuable app categories
- clear evolution path as BAM matures

This is also consistent with adjacent builder patterns in the Colosseum corpus:

- `urani` and `archer-exchange` show demand for market-structure-aware execution
- `safer.fun` and `vertigo` show demand for anti-sniping and fair launch mechanics
- `supersize` shows games are a serious category for differentiated infra and UX

Most hackathon projects do not become successful startups. The projects surfaced here are useful for inspiration and to show what has been tried before.

Projects surfaced in this report may no longer be active. Verify current status before drawing conclusions about the competitive landscape.

## Name Ideas

### Strongest product-style names

- ACE SDK
- Fairlane
- Fairpath
- Policyflow
- Routed
- Queue
- Seqr
- Tact
- Gate
- Arena Policy

### Strongest company-style names

- Fairlane Labs
- Tact Labs
- Policyflow
- Routed Systems
- Open Queue
- Sequence Layer

### Strongest hackathon-safe names

- ACE SDK
- Fairlane
- Policyflow

My recommendation:

- use `ACE SDK` as the category name in the deck
- use `Fairlane` or `Policyflow` as the product brand if you want something more memorable

## Final Recommendation

Build and pitch this as:

`A BAM-ready execution policy layer for Solana apps, starting with anti-sniping for onchain games and monetized through hosted routing, replay, simulation, and analytics.`

That is the tightest version of the idea.
