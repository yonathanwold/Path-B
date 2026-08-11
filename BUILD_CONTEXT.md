# Path B - Build Context

Build the complete Path B application in this repository in one continuous autonomous run. Treat this as a first-place hackathon build: make strong product decisions, keep moving without waiting for unnecessary confirmation, and finish a coherent, polished, demoable experience rather than a collection of placeholders. Do not stop after scaffolding, pause for routine approvals, or hand back a partial prototype. Work through the entire product loop, verification, polish, documentation, and deployment readiness before declaring the run complete. If the session is interrupted, resume from the latest pushed commit and continue the same run.

## Continuous-run behavior

Start by inspecting the repository and existing context, then execute the full build in sensible milestones: product/data foundation, core resilience engine, Claude experience, main interface, visual storytelling, accessibility, testing/security, and final demo polish. Make safe assumptions and record them. Keep the user informed as you go, but do not wait for confirmation between milestones. Never manufacture filler commits; every commit must represent real work and a verifiable improvement.

## App

**Path B** is a crash test for a college plan. A student enters or reviews an academic path, tests a realistic disruption (such as failing a prerequisite, losing summer availability, needing more work hours, or facing a financial or family constraint), chooses what they most want to protect, and sees what changes, which options remain, and what practical question to take to an advisor.

Make AI a core part of the product through Claude: keep course, prerequisite, timing, cost, and eligibility facts in a deterministic and inspectable model, then use Claude server-side to turn those facts into personalized comparisons, tradeoffs, assumptions, next steps, and advisor questions. Claude must never invent degree requirements. Keep `ANTHROPIC_API_KEY` server-only, validate inputs and outputs, provide a useful local/demo fallback when no key is configured, and make the AI reasoning explainable in the interface.

## Hackathon

This is for the **Stellic Pathfinders Challenge**, primarily **Overcoming Obstacles** with **Degree Planning & Discovery** as a secondary category. The submission needs a believable working link, a clear two-minute demo story, a concise write-up, and a product that helps students navigate real college disruptions - not a generic degree audit or a vague chatbot.

Optimize for first-place quality: an immediate visual hook, an obvious student story, excellent responsive UX, accessible interactions, trustworthy data boundaries, meaningful scenario comparisons, thoughtful empty/loading/error states, and a memorable final next step. Use realistic fixture data when institutional data is unavailable and label it honestly. Do not expose internal prompts, API keys, or AI-generation artifacts in the product.

## Skills available

Use the installed official OpenAI Codex skills deliberately and combine them when useful:

- Web: `frontend-app-builder`, `frontend-testing-debugging`, `react-best-practices`, `shadcn-best-practices` (runtime name `shadcn`), `supabase-best-practices` (runtime name `supabase-postgres-best-practices`)
- Visualization: `data-visualization`, `threejs-data-visualization`, `react-and-nextjs-data-visualization`, `typescript-data-visualization-engineering`, `visualization-strategy-and-critique`, `testing-data-visualizations`, `accessibility-and-inclusive-visualization`
- Security/reliability: `security-scan`, `security-diff-scan`, `threat-model`, `fix-finding`, `propose-security-hardening`, `validation`

Use the frontend and visualization skills for concept, hierarchy, responsive implementation, data storytelling, accessibility, and browser QA. Use the security skills before shipping and after meaningful changes. Do not weaken or bypass a skill's validation guidance just to move faster.

## Repository and Git workflow

Repository: <https://github.com/yonathanwold/Path-B>

Use the repository's `main` branch for this run so the public commit history shows the complete build process. Before every change, inspect `git status`, read the existing context/README, and fast-forward from `origin/main` when it is safe to do so. After **every minor or major coherent change**:

1. Run the narrowest relevant checks (then the full lint/typecheck/test/build or project verify command at major milestones).
2. Review the diff and stage only intended files: `git add <files>`.
3. Commit immediately with a focused conventional message, for example `feat: add disruption impact comparison`, `fix: validate Claude response schema`, `test: cover prerequisite cascade`, `docs: add demo walkthrough`, or `chore: harden production checks`.
4. Push the commit to GitHub immediately on `main`:

```bash
git switch main
git pull --ff-only origin main
git status --short
git add <files>
git commit -m "<focused change>"
git push origin main
```

For every later milestone, use `git add`, `git commit`, and `git push origin main`. Immediately tell the user what was committed and pushed using this format:

```text
Commit update: <short hash> <commit subject>
Scope: <what changed and why>
Verification: <checks run and result>
GitHub: pushed to main
```

The visible history is part of the submission. Keep the meaningful `feat:`, `fix:`, `test:`, `docs:`, and `chore:` commits intact. Never force-push, rewrite history, commit secrets, or create artificial history. If `git pull --ff-only` or the push detects a remote change, stop and reconcile safely before continuing. Before handoff, report the final `main` commit, complete commit list, verification results, demo path, deployment status, and remaining assumptions.

## Definition of done

The app should tell one compelling student story end-to-end, work at demo speed, be keyboard- and mobile-usable, survive malformed or unavailable AI responses, show factual sources/assumptions, and include enough tests and security checks that the demo is credible. Finish the entire product loop, then polish the details that judges will notice.
