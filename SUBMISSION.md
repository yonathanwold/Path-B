# Path B — hackathon submission package

## Entry details

- **Title:** Path B
- **Primary category:** Overcoming Obstacles
- **Secondary category:** Degree Planning & Discovery
- **Working link:** https://github.com/yonathanwold/Path-B
- **Public app URL:** Add the production URL after deployment.
- **Two-minute video:** Add the YouTube, Vimeo, or Loom URL after recording.

The repository link satisfies the challenge's working-link option. A public app URL and hosted video still need to be added to the final submission form.

## Submission write-up (500 words)

<!-- WRITEUP START -->
College plans are usually treated as static schedules: if every course is available and every semester goes as expected, the student graduates on time. Real life is less predictable. A failed prerequisite, a heavier work schedule, or one unavailable term can create effects that are difficult to see until registration is already urgent. Path B is a degree-plan resilience product for students who need to understand those effects early and make a practical recovery plan.

The demo follows Maya, a synthetic computer science student who works twenty hours each week and must remain at least half-time. Her plan appears viable, but CS 201 is offered only in spring and unlocks a prerequisite chain. Path B lets Maya stress-test the plan by modeling what happens if she does not pass that course. Instead of showing a generic warning, the Impact workspace traces the causal ripple: the next available repeat, the two courses blocked directly, the five courses that move downstream, and the resulting workload and graduation implications.

Path B then asks what Maya wants to protect. She can prioritize the earliest graduation, her work schedule, or lower added cost. The Paths workspace compares two academically viable recovery strategies. Faster finish preserves May 2027 graduation but creates a fifteen-credit peak while Maya is still working. Steadier load limits every term to ten credits but moves graduation to December 2027 and adds a modeled semester of cost. Neither option is presented as universally best. The recommendation changes with Maya's stated priority, and every sacrifice remains visible.

The experience ends with action rather than analysis. Path B prepares a concise meeting brief, lists assumptions that require human confirmation, and produces one useful question Maya can take to an advisor. This makes the advisor conversation more focused while keeping the final decision with the student and institution.

Academic facts never come from a language model. A deterministic TypeScript engine owns prerequisites, course timing, credits, enrollment rules, cost assumptions, scenario propagation, and schedule validation. The server recomputes verified scenario facts before any optional AI request. Claude may select from allowlisted narrative emphases, but server code writes the final explanation and Claude cannot change requirements or calculations. With no key, a timeout, a provider error, or malformed output, the complete deterministic fallback remains available.

Path B is intentionally demonstrated with a synthetic Great Lakes University catalog and student fixture, clearly disclosed in the product. It does not claim a live university integration. The scalable idea is the reusable boundary: validated catalog, plan, student constraints, and disruption inputs feed the same deterministic resilience engine, while institution-specific data can be supplied later without changing the student journey.

The result is a responsive six-route web application rather than a dense dashboard or chatbot. Students move from a healthy plan to a stress test, watch the dependency cascade, compare recovery paths, and leave ready for a better human conversation. Path B asks a different planning question: not only “Does my plan work today?” but “Will it still work when life changes?”
<!-- WRITEUP END -->

## Tools used

- Codex with GPT-5.6 Sol and custom Path B review agents
- React 19, TypeScript 6, Vite 8, and Lucide React
- Zod and the Anthropic TypeScript SDK
- Vitest, Testing Library, Playwright, and axe-core
- ESLint, Vercel configuration, and GitHub

## Two-minute recording plan

| Time | Route | What to show and say |
| --- | --- | --- |
| 0–12s | `/` | Introduce Maya's illustrative plan, work constraint, half-time floor, and spring-only hinge. |
| 12–25s | `/plan` | Trace how CS 201 unlocks five planned courses, then start the stress test. |
| 25–37s | `/stress-test` | Confirm the focused CS 201 disruption and run the deterministic model. |
| 37–60s | `/impact` | Pause on the causal ripple: next offering, two direct blocks, five downstream moves. |
| 60–84s | `/paths` | Change Maya's priority, compare both viable paths, and end on Faster finish. |
| 84–105s | `/advisor` | Show the human verification panel and finish on the copyable advisor question. |

Use this positioning in the narration: **“Path B is a resilience stress test, not a degree audit or chatbot.”** Describe Maya and Great Lakes University as illustrative fixtures. Do not say Claude generated the visible brief unless the source label reads **Claude-personalized wording**.

## Final publishing checklist

- Deploy the current `main` branch and paste the public app URL above.
- Record the flow at normal reading speed; spend at least twenty seconds on Impact.
- Upload the video to YouTube, Vimeo, or Loom and paste its URL above.
- Confirm the deployed app opens on `/impact` and other nested routes after refresh.
- Submit the 500-word write-up, categories, working link, video, and complete tool list.
