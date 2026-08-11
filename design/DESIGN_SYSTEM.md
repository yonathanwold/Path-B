# Path B design contract

The primary agent accepted this concept set under the repository's autonomous-build instruction:

- `concepts/path-b-initial-desktop.png` — pre-crash state
- `concepts/path-b-results-desktop.png` — complete result and comparison state
- `concepts/path-b-results-mobile.png` — mobile sibling state

## Story and visual artifact

- **Question:** If Maya does not pass a once-yearly prerequisite, what changes and which viable path best protects what matters to her?
- **Insight title:** Maya's plan hit a fault line.
- **Artifact:** an explanatory term rail plus a small directed prerequisite dependency view, followed by a precise two-path comparison.
- **Immediate evidence:** CS 201 fails, three requirements depend on it, and the projected sequence shifts.
- **On-demand detail:** course facts, assumptions, sources, calculation notes, and AI/fallback explanation.
- **Annotation:** direct labels explain fault, cause, effect, ripple, and protected priority. Essential values never live only in a tooltip.

## Locked experience

The implementation keeps these elements from the concepts:

- A simple Path B header with the subtitle and one contextual action.
- An editorial opening statement paired with Maya's constraints.
- Open term rails and thin dependency lines instead of a dashboard-card grid.
- Coral for disrupted/blocked, deep teal for protected/viable, and ink/slate for factual structure.
- Pattern, icon, line style, and text labels in addition to color.
- Exactly two recovery paths in the main comparison.
- One practical advisor question and one compact assumptions/source disclosure.
- Desktop and mobile as sibling layouts, not a squeezed fixed-width chart.

The concepts are visual references, not shipped UI images. All product text, controls, course data, marks, and state remain code-native.

## Design tokens

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--canvas` | `#ffffff` |
| Ink | `--ink` | `#17212b` |
| Muted ink | `--muted` | `#5c6875` |
| Rule | `--rule` | `#ccd5dc` |
| Soft field | `--field` | `#f2f6f7` |
| Protected / viable | `--teal` | `#087b83` |
| Protected tint | `--teal-soft` | `#e7f4f4` |
| Disrupted / blocked | `--coral` | `#f06455` |
| Disrupted tint | `--coral-soft` | `#fff0ed` |
| Focus | `--focus` | `#005fcc` |

- Display type: Newsreader, editorial serif fallback.
- UI type: Inter, system sans-serif fallback.
- Course codes: compact monospaced system stack.
- Geometry: 2px controls, 8-10px functional radii, thin rules, almost no elevation.
- Motion: a short staged cascade reveal and state transition only; reduced motion renders the final state immediately.

## Component and ownership model

React owns the app state, form controls, semantic structure, result selection, disclosures, and deterministic summaries. The visualization component owns only the small fixed graph's geometry and connector rendering. No chart library is needed.

- `AppShell`: header, main landmark, live status, reset.
- `CrashTestSetup`: Maya context, disruption fieldset, run action.
- `BaselinePlan`: pre-crash dependency rail and vulnerability annotation.
- `ImpactStory`: fault/cause/effect/ripple/protected-priority sequence.
- `PlanCascade`: accessible term/course view with an SVG connector layer on desktop and stacked causal rows on mobile.
- `PrioritySelector`: radio group with explanatory consequences.
- `PathComparison`: two path choices with the same row schema and direct tradeoff labels.
- `AdvisorHandoff`: deterministic or validated Claude explanation, advisor question, and copy action.
- `EvidenceDisclosure`: fixture label, facts, assumptions, sources, and calculation notes.

Only one visualization instance is present. Data size is fixed and tiny, so layout is deterministic, render cost is negligible, and server rendering is unnecessary. All view state is intentionally ephemeral; reset returns to the known demo state. There is no persistence or URL state in this submission.

## Accessible path

- Every graphical dependency also appears in a structured list or table-like term sequence.
- Status is encoded with text, icons, borders/patterns, and line style as well as color.
- All controls use native buttons, radio inputs, and disclosure elements with 44px touch targets.
- A concise visualization description names the failure, three dependent courses, timing consequence, and caveat.
- Keyboard order follows setup, result, priority, comparison, advisor handoff, then evidence.
- Focus is never hidden after state changes; the result heading receives programmatic focus after the crash test runs.
- At 720px and below, terms stack vertically, comparisons become full-width sections, and no horizontal scrolling is required.
- The mobile landscape layout uses the desktop rail only when at least 700px of inline space exists; otherwise it keeps the portrait stack.
- There are no drag, pinch, hover-only, autoplay, or pointer-precision interactions.

## Visible-copy allowance

Above the fold may contain only the Path B identity, the accepted state headline, one short explanatory sentence, Maya's concise facts, the disruption or priority choices for that state, plan labels, the fixture disclosure, and the primary action. New marketing claims, AI labels, metrics, decorative badges, or navigation are out of scope.
