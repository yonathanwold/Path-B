# Path B v2 design contract

This contract replaces the earlier single-page concept. Path B is now a routed student decision journey, while the deterministic planning engine remains the only authority for course facts, timing, costs, eligibility, and recommendations.

## Accepted concepts

- `concepts/path-b-v2-impact-desktop.png` — the signature impact route
- `concepts/path-b-v2-impact-mobile.png` — the vertical mobile cascade
- `concepts/path-b-v2-paths-desktop.png` — the priority and recovery-path decision

The concepts are layout references, not data sources. Course placements, credits, dates, costs, and labels must be derived from the typed fixture and engine. Generated visual microcopy may not override deterministic results.

## Student story and information architecture

The two-minute path is:

1. `/` Overview — understand why resilience planning matters and meet Maya.
2. `/plan` My Plan — verify that the baseline plan is viable and see the vulnerable hinge.
3. `/stress-test` Stress Test — choose the CS 201 disruption and run the model.
4. `/impact` Impact — understand the failure, next offering, direct blocks, and downstream movement.
5. `/paths` Paths — choose what to protect and compare two viable tradeoffs.
6. `/advisor` Advisor — turn verified facts into a meeting brief and one useful question.

Each route answers one question and has one primary action. The current route lives in the URL. Validated demo choices live in session storage so refresh and browser history preserve continuity; the full scenario is always recalculated from deterministic inputs.

## Signature artifact

- **Question:** If Maya does not pass a once-yearly prerequisite, what moves, and which viable recovery protects what matters to her?
- **Immediate statement:** `CS 201 failed → next offered Spring 2026 → 2 direct blocks → 5 planned courses move`.
- **Desktop visual:** a semester rail with directly labeled old and new placements plus thin causal connectors.
- **Mobile visual:** a vertical chronological cascade; never a horizontally compressed table.
- **Text alternative:** a concise ordered explanation and a semantic movement list using the same engine data.
- **Motion:** a short CSS-only staged reveal of the fault and downstream shifts. Reduced motion renders the final state immediately.

## Shell and hierarchy

- Desktop uses a 232px navigation rail and a quiet working canvas.
- Mobile uses a compact header plus native modal navigation; it does not collapse into unlabeled icons.
- Navigation includes only Overview, My Plan, Stress Test, Impact, Paths, and Advisor.
- A small scenario block identifies Maya, the CS 201 failure, and the synthetic fixture.
- The top bar provides breadcrumbs, step progress, and a restrained reset action.
- One page title, one primary action, and one focal artifact per route.
- Assumptions and source detail stay contextual and secondary.

## Visual language

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--canvas` | `#fbfbf8` |
| Surface | `--surface` | `#ffffff` |
| Ink | `--ink` | `#17212b` |
| Muted ink | `--muted` | `#5c6875` |
| Rule | `--rule` | `#d5dddf` |
| Soft field | `--field` | `#eef3f2` |
| Protected / viable | `--teal` | `#087b83` |
| Protected tint | `--teal-soft` | `#e8f3f2` |
| Disrupted / blocked | `--coral` | `#e45b4f` |
| Disrupted tint | `--coral-soft` | `#fff0ed` |
| Focus | `--focus` | `#005fcc` |

- Display type: Newsreader for page titles and major decisions only.
- UI type: Inter and system sans-serif fallbacks.
- Course codes: compact monospaced system stack.
- Body text: 15–16px minimum; no compressed 9–12px interface copy.
- Geometry: one 10–12px radius family, thin rules, almost no elevation.
- Color is redundant with icons, text, line style, and pattern.
- No gradients, glass, glow, photos, chat bubbles, generic dashboard metrics, or decorative card grids.

## Component and state ownership

React owns routing, semantic structure, controls, validated session state, focus, disclosures, and all student-facing summaries. The deterministic engine owns scenario propagation and path calculation. Visualization components own only presentation geometry.

- `App`: route normalization, popstate handling, scenario state, persistence, calculation failure boundary.
- `AppShell`: navigation, breadcrumbs, progress, mobile dialog, reset.
- Route pages: one clear question and action each.
- `ImpactCascade`: desktop semester rail, mobile timeline, and text alternative derived from `ScenarioResult`.
- `PathDecision`: priority and path controls, three aligned comparison rows, term previews, protected outcome, and sacrifice.
- `AdvisorBrief`: validated Claude wording or deterministic fallback, assumptions to verify, and copy action.

Claude is called only on the Advisor route. It may choose emphasis and wording from verified facts; it never alters requirements or calculations.

## Responsive and accessible behavior

- Route changes move focus to the page heading and start at the top.
- Navigation exposes `aria-current="page"`; the mobile menu uses native dialog behavior, Escape, and focus restoration.
- All controls are native buttons, anchors, radios, and disclosures with at least 44px targets.
- The impact visual has an ordered text alternative and does not depend on hover or tooltips.
- Desktop and mobile use sibling layouts with no horizontal page scrolling.
- Updates announce only meaningful calculation or copy outcomes, not every visual animation step.
- Empty scenario, calculation failure, AI unavailable, and malformed-AI states retain a useful deterministic next action.
- `prefers-reduced-motion`, 200% zoom, keyboard-only navigation, and narrow portrait layouts are first-class acceptance cases.
