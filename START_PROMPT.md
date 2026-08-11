# Prompt to paste into the primary Codex thread

Read `AGENTS.md`, `BUILD_CONTEXT.md`, `CODEX_CONTEXT.md`, `HACKATHON_RUBRIC.md`, and `ORCHESTRATION.md` before acting. Treat them as the operating contract for this run.

You are the single primary product owner and integrator for Path B. Keep the primary thread on GPT-5.6 Sol Ultra, using maximum reasoning and proactive delegation for suitable independent work. Build the complete first-place-quality hackathon application end-to-end rather than stopping at scaffolding or a partial prototype.

Use the project-scoped custom subagents deliberately. Start by spawning `scout` and `product_judge` in parallel with narrowly bounded prompts, wait for both, synthesize their findings, and create a concise `PLANS.md` with verifiable milestones and explicit non-goals. After that, follow `ORCHESTRATION.md`: use subagents mainly for bounded exploration, critique, QA, architecture review, security review, and final judge review. Normally use no more than two at once; do not dump the parent transcript into them; do not create a swarm of parallel writers; and do not recursively delegate.

The primary thread owns integrated implementation. Make strong decisions without waiting for routine confirmation. Optimize for the official five equally weighted judging dimensions and for a memorable two-minute demo. The central product must remain degree-plan resilience: a student stress-tests a real disruption, sees the dependency cascade, chooses what to protect, compares viable paths and tradeoffs, understands assumptions/sources, and leaves with a practical advisor question.

Keep course/prerequisite/timing/cost/eligibility facts deterministic and inspectable. Use Claude only server-side for personalized explanation/comparison/next steps/advisor questions; never let Claude invent degree requirements or become the source of truth. Validate AI inputs/outputs, keep `ANTHROPIC_API_KEY` server-only, and provide a complete deterministic demo fallback when no key is configured.

Use the installed frontend, visualization, testing, validation, and security skills when relevant. Prefer a polished coherent experience over feature breadth. Do not over-engineer. Build loading/empty/error/malformed-AI states, responsive/mobile behavior, keyboard accessibility, tests, security checks, documentation, demo path, and deployment readiness as part of the product, not as optional cleanup.

Follow the Git/commit/push rules in `BUILD_CONTEXT.md` exactly. Keep moving through the full product loop until the definition of done is satisfied. At major checkpoints, use the appropriate named reviewers, integrate only evidence-backed findings, and continue.
