# Codex setup for Path B

This repository is prepared for GPT-5.6 Sol with Ultra orchestration. Ultra is the higher-level multi-agent mode; `max` is the highest reasoning effort supported by the underlying GPT-5.6 Sol model. [OpenAI's GPT-5.6 guidance](https://developers.openai.com/api/docs/guides/latest-model) describes that distinction.

## Repository configuration

The trusted project layer in `.codex/config.toml` intentionally sets:

```toml
model = "gpt-5.6-sol"

[agents]
enabled = true
max_concurrent_threads_per_session = 4
default_subagent_model = "gpt-5.6-terra"
default_subagent_reasoning_effort = "medium"
```

It intentionally does **not** pin `model_reasoning_effort = "max"`. Ultra remains selectable at the user/session layer without weakening or deleting the Path B agent configuration.

All project-specific agents remain in `.codex/agents/`:

- `architecture_reviewer`
- `demo_judge`
- `product_judge`
- `qa_runner`
- `scout`
- `security_reviewer`
- `ux_critic`

Each custom reviewer uses GPT-5.6 Terra with a task-appropriate effort and a read-only sandbox. The primary thread remains GPT-5.6 Sol.

## Start a fresh prepared session

From the repository root:

```powershell
codex
```

The current user-level Codex configuration already selects GPT-5.6 Sol Ultra, so no project override or hand-edited Max setting is required.

Inside Codex, run:

```text
/status
```

Verify that the primary model is GPT-5.6 Sol and the active mode is Ultra. A thread that was created under an older mode may keep that mode until a fresh session is started.

## Validate the installed CLI and project layer

The setup was verified with Codex CLI `0.147.0-alpha.6.6`:

```powershell
codex --version
codex features list
```

`features list` also serves as a configuration parse check. Project-scoped `.codex/` files load only when the repository is trusted.

## Operating pattern

- Keep the primary thread as the sole product owner and integrator.
- Use one or two bounded Terra reviewers at a time; three only for a deliberate audit checkpoint.
- Preserve the deterministic academic engine as the source of truth.
- Use `qa_runner`, `security_reviewer`, `product_judge`, `ux_critic`, and `demo_judge` at the checkpoints defined in `ORCHESTRATION.md`.
- Do not remove `.codex/agents/`, `AGENTS.md`, or the project concurrency settings to change modes.

The main build prompt is in `START_PROMPT.md`.
