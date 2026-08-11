# Path B — Sol Ultra orchestration playbook

The primary Codex thread is the only persistent product owner. Keep it on GPT-5.6 Sol Ultra (maximum reasoning with proactive delegation). Subagents are disposable specialists used to reduce context noise and add adversarial review.

## Context-budget protocol
1. Do not send a subagent the whole parent transcript.
2. Give the exact goal and only the files/routes needed to answer it.
3. Ask for a constrained artifact: file map, ranked findings, test summary, or demo path.
4. Do not ask multiple agents the same broad question unless intentionally seeking independent review.
5. Prefer one strong targeted agent over four redundant agents.
6. Close out a subagent's result by integrating only the useful conclusions into the parent plan.

## Phase 0 — orient and choose the winning shape
Run in parallel:
- `scout`: map the repository and identify existing constraints.
- `product_judge`: critique the current concept against the five official judging dimensions.

Primary agent then creates/updates a short `PLANS.md` with verifiable milestones and explicit non-goals. Do not start with a giant feature backlog.

## Phase 1 — deterministic resilience foundation
Primary agent builds the smallest inspectable data model and scenario engine that can tell the Maya story end-to-end.

Checkpoint:
- run `architecture_reviewer` on the actual implementation;
- fix correctness/source-of-truth issues before adding more UI surface.

Acceptance evidence should include tests for prerequisite cascades and at least one materially different alternative path.

## Phase 2 — first complete student loop
Primary agent implements the main UI from disruption selection through comparison to advisor next step. Optimize for a compelling default fixture/demo path before adding generalized input complexity.

Checkpoint:
- run `ux_critic` on the complete primary flow;
- use `product_judge` only if the product is drifting toward generic planner/chatbot behavior.

Fix comprehension and interaction issues before decorative polish.

## Phase 3 — Claude integration and trust boundary
Primary agent adds Claude server-side for explanation, tradeoff narration, assumptions, next steps, and advisor questions while keeping academic facts deterministic.

Checkpoint:
- run `architecture_reviewer` for schema/fallback/source-of-truth behavior;
- run `security_reviewer` for secrets, validation, trust boundaries, and unsafe AI rendering.

The no-key fallback must still support the complete demo.

## Phase 4 — verification and resilience
Primary agent stops editing temporarily.

Run in parallel:
- `qa_runner`: lint/typecheck/test/build plus primary user-flow checks requested by parent.
- `security_reviewer`: final defensive review if meaningful changes occurred after the previous scan.

Primary agent fixes verified findings and reruns the narrowest checks. Repeat only when new evidence justifies it.

## Phase 5 — judge-facing polish
Run a deliberate final audit, at most three agents in parallel:
- `product_judge`: score all five official dimensions with evidence.
- `ux_critic`: find remaining visual/responsive/accessibility friction.
- `demo_judge`: produce the 90–120 second click path and identify recording risks.

Primary agent performs only high-leverage final fixes, then reruns verification.

## Stop conditions
Do not stop because scaffolding works or because the happy path renders. Stop only when:
- one complete student story is demo-ready;
- deterministic facts and AI interpretation are visibly separated;
- the fallback works without an API key;
- the app is mobile/keyboard usable;
- tests/build pass;
- the security review has no unresolved demo-blocking issue;
- the final judge audit has evidence for all five rubric dimensions;
- README/demo/write-up/deployment instructions are ready.
