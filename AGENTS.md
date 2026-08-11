# Path B — Codex operating instructions

## Mission
Build Path B as a first-place-quality Stellic Pathfinders Challenge submission. Read `BUILD_CONTEXT.md`, `CODEX_CONTEXT.md`, `HACKATHON_RUBRIC.md`, and `ORCHESTRATION.md` before making product or architecture decisions.

Optimize for a coherent two-minute student story, not maximum feature count. Prefer the smallest architecture that can produce a trustworthy, polished, demoable result. Do not over-engineer.

## Primary-agent ownership
The primary agent is the product owner, architect, and integrator. Use GPT-5.6 Sol Ultra for difficult planning, implementation, debugging, and synthesis so the primary thread keeps maximum reasoning and can proactively delegate suitable independent work.

Use custom subagents for bounded investigation, critique, verification, and QA. Do not turn the project into a swarm of independent implementation agents.

### Delegation rules
- Normally run 1–2 subagents at a time. Use 3 only for a deliberate audit checkpoint. Never spawn agents merely because capacity exists.
- Prefer the named agents in `.codex/agents/` over generic agents.
- Give each subagent the minimum task packet: exact question, relevant files or routes, acceptance criteria, and desired output. Do not forward the full parent transcript or dump unrelated project context into the child.
- Ask for concise findings, evidence, and priority. Do not ask children to return raw command logs or broad essays.
- Keep parallel work read-heavy when possible. There must be one clear write owner for any file tree at a time.
- The primary agent decides which findings to accept and performs the integrated implementation unless a task explicitly assigns a writer.
- Pause implementation before running `qa_runner` so test/build artifacts cannot race with active source edits.
- Do not recursively spawn subagents from subagents.

## Product invariants
- Path B is a degree-plan resilience product, not a generic planner, degree audit, or chatbot.
- The deterministic model owns course facts, prerequisites, timing, cost assumptions, eligibility rules, and scenario propagation.
- Claude may explain, compare, personalize, summarize tradeoffs, and generate advisor questions. Claude must not invent or silently alter degree requirements.
- Keep `ANTHROPIC_API_KEY` server-only. Validate AI inputs and structured outputs. Provide a useful deterministic/demo fallback with no key.
- Label fixture or synthetic institutional data honestly and expose assumptions/sources in the UI.
- A student should be able to understand the disruption, downstream impact, alternative paths, protected priority, tradeoffs, and human next step without reading an AI transcript.

## Experience bar
- The first screen must communicate the problem and visual hook immediately.
- The primary demo path should be usable without setup friction and finish comfortably inside two minutes.
- Make comparison visual, not just textual: show what changed, what stayed protected, and why paths differ.
- Build keyboard, mobile, loading, empty, error, and malformed-AI states as part of the core experience.
- Avoid decorative complexity that does not improve the student story or one of the five judging criteria.

## Engineering bar
- Prefer deterministic functions with explicit schemas for prerequisite cascades and scenario calculations.
- Keep AI, data, and UI boundaries inspectable and testable.
- Add tests around prerequisite propagation, scenario generation, priority tradeoffs, AI schema validation/fallbacks, and important UI flows.
- Use the available frontend, visualization, testing, validation, and security skills when their scope applies.
- Before shipping, run the full lint/typecheck/test/build suite, a browser/mobile pass, security review, and a final demo rehearsal.

## Git discipline
Follow `BUILD_CONTEXT.md` for branch, verification, commit, and push behavior. Keep commits meaningful and conventional. Never commit secrets, generated credentials, or local environment files.

## Decision rule
When two implementations are both valid, choose the one that makes the two-minute demo clearer, the deterministic/AI boundary more trustworthy, and the product easier for judges to remember.
