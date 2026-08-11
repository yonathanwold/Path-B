# Install and run this Sol Max setup

## 1. Put these files in the Path-B repository root
Copy the contents of this package into the repository so the resulting layout includes:

```text
Path-B/
  AGENTS.md
  BUILD_CONTEXT.md
  CODEX_CONTEXT.md
  HACKATHON_RUBRIC.md
  ORCHESTRATION.md
  START_PROMPT.md
  .codex/
    config.toml
    agents/
      scout.toml
      product_judge.toml
      architecture_reviewer.toml
      ux_critic.toml
      qa_runner.toml
      security_reviewer.toml
      demo_judge.toml
```

Do not replace a newer `CODEX_CONTEXT.md` from your repository with an older copy; this package intentionally does not include that file.

## 2. Start Codex from the repository root

```bash
cd Path-B
codex
```

Trust the repository if Codex asks. Project-scoped `.codex/` configuration is ignored for untrusted projects.

## 3. Verify the primary model
Run:

```text
/status
```

The effective model should be GPT-5.6 Sol and the reasoning effort should be max. If a CLI flag or user-level config overrides the project setting, use `/model` to select GPT-5.6 Sol / max or remove the higher-precedence override.

## 4. Verify custom agents before the long run
Ask Codex:

```text
List the project-scoped custom agents available in this repository and report each agent's configured model, reasoning effort, and sandbox mode. Do not spawn them yet.
```

Then perform a cheap smoke test:

```text
Use the scout agent only. Inspect the repository root and return at most 10 bullets describing what exists. Do not change files.
```

Use `/agent` if you want to inspect the child thread.

## 5. Launch the build
Paste the contents of `START_PROMPT.md` into the primary thread.

## Usage strategy
- Keep the primary thread on Sol Max for architecture, integration, debugging, and hard product decisions.
- Let named Terra/Luna agents do short bounded reviews rather than inheriting a giant task description.
- Do not run all agents at once. The configured concurrency cap is an upper bound, not a target.
- Use `/compact` if the main thread becomes noisy during a long run.
- Keep each chat focused on this coherent build outcome; if you later do unrelated experiments, fork or start another thread.

## Safety/permissions
This package uses `workspace-write` with `approval_policy = "on-request"`. That gives the main agent repository write access without defaulting to unrestricted machine access. Do not switch to unrestricted/full-access modes merely to avoid an occasional approval prompt.
