import { ArrowRight, CircleX, RotateCcw } from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain/index.ts'

type Movement = {
  baselineTermId: string
  courseId: string
  depth: number
  movedTermId: string
  type: 'failed' | 'affected'
}

const movementDelayClasses = [
  'course-row--delay-0',
  'course-row--delay-1',
  'course-row--delay-2',
  'course-row--delay-3',
  'course-row--delay-4',
  'course-row--delay-5',
] as const

function movementDelayClass(index: number) {
  return (
    movementDelayClasses[Math.min(index, movementDelayClasses.length - 1)] ??
    movementDelayClasses[0]
  )
}

export function ImpactCascade({
  dataset,
  path,
  scenario,
}: {
  dataset: PathBDataset
  path: AlternativePath
  scenario: ScenarioResult
}) {
  const courseById = new Map(dataset.courses.map((course) => [course.id, course]))
  const termById = new Map(dataset.terms.map((term) => [term.id, term]))
  const disruptionOrder = termById.get(scenario.disruption.termId)?.order ?? 0
  const graduationOrder = termById.get(path.graduationTermId)?.order ?? disruptionOrder
  const terms = dataset.terms
    .filter((term) => term.order >= disruptionOrder && term.order <= graduationOrder)
    .toSorted((left, right) => left.order - right.order)
  const movements: Movement[] = [
    {
      baselineTermId: scenario.disruption.termId,
      courseId: scenario.failedCourseId,
      depth: 0,
      movedTermId: scenario.repeatTermId,
      type: 'failed',
    },
    ...scenario.affectedCourses
      .map((affected) => ({
        baselineTermId: affected.baselineTermId,
        courseId: affected.courseId,
        depth: affected.depth,
        movedTermId:
          path.id === 'faster-finish'
            ? affected.fasterTermId
            : affected.steadierTermId,
        type: 'affected' as const,
      }))
      .toSorted((left, right) => left.depth - right.depth),
  ]

  const directCodes = movements
    .filter((movement) => movement.depth === 1)
    .map((movement) => courseById.get(movement.courseId)?.code ?? movement.courseId)
  const downstreamCodes = movements
    .filter((movement) => movement.depth > 1)
    .map((movement) => courseById.get(movement.courseId)?.code ?? movement.courseId)
  const failedCourse = courseById.get(scenario.failedCourseId)
  const offeredSeasons = failedCourse?.offeredIn
    .map((season) => season[0]?.toUpperCase() + season.slice(1))
    .join(' and ')

  function cellState(movement: Movement, termId: string) {
    if (movement.type === 'failed' && termId === movement.baselineTermId) return 'failed'
    if (movement.type === 'failed' && termId === movement.movedTermId) return 'repeat'
    if (movement.type === 'affected' && termId === movement.baselineTermId) return 'was'
    if (movement.type === 'affected' && termId === movement.movedTermId) return 'moved'

    const order = termById.get(termId)?.order ?? -1
    const baselineOrder = termById.get(movement.baselineTermId)?.order ?? -1
    const movedOrder = termById.get(movement.movedTermId)?.order ?? -1
    if (order > baselineOrder && order < movedOrder) return 'transit'
    return 'empty'
  }

  const mobileGroups = terms.flatMap((term) => {
    const moved = movements.filter(
      (movement) =>
        movement.type === 'affected' && movement.movedTermId === term.id,
    )
    return moved.length > 0 ? [{ term, moved }] : []
  })

  return (
    <section className="impact-visual" aria-labelledby="cascade-title">
      <div className="cascade-main">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="eyebrow">Earliest viable recovery</span>
            <h2 id="cascade-title">Watch the cascade</h2>
          </div>
          <span className="legend-inline" aria-label="Impact legend">
            <i className="legend-dot legend-dot--coral" /> Disrupted
            <i className="legend-dot legend-dot--teal" /> Viable move
          </span>
        </div>

        <p className="visualization-description" id="cascade-description">
          {failedCourse?.code ?? scenario.failedCourseId} is missed in{' '}
          {termById.get(scenario.disruption.termId)?.label}, repeats in{' '}
          {termById.get(scenario.repeatTermId)?.label}, and moves{' '}
          {scenario.affectedCourses.length} dependent courses across the next two
          levels of the prerequisite chain.
        </p>

        <div className="desktop-cascade">
          <table aria-describedby="cascade-description" aria-label="Earliest viable course movement by term">
            <thead>
              <tr>
                <th scope="col">Course</th>
                {terms.map((term) => (
                  <th key={term.id} scope="col">{term.shortLabel}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map((movement, movementIndex) => {
                const course = courseById.get(movement.courseId)
                return (
                  <tr
                    className={`cascade-depth-${movement.depth} ${movementDelayClass(movementIndex)}`}
                    key={movement.courseId}
                  >
                    <th scope="row">
                      <code>{course?.code ?? movement.courseId}</code>
                      <span>{course?.title}</span>
                    </th>
                    {terms.map((term) => {
                      const state = cellState(movement, term.id)
                      return (
                        <td className={`cascade-cell cascade-cell--${state}`} key={term.id}>
                          {state === 'failed' ? (
                            <span className="course-event course-event--failed">
                              <CircleX aria-hidden="true" size={15} /> Did not pass
                            </span>
                          ) : null}
                          {state === 'repeat' ? (
                            <span className="course-event course-event--repeat">
                              <RotateCcw aria-hidden="true" size={14} /> Repeat
                            </span>
                          ) : null}
                          {state === 'was' ? (
                            <span className="course-event course-event--was">Was here</span>
                          ) : null}
                          {state === 'moved' ? (
                            <span className="course-event course-event--moved">
                              <ArrowRight aria-hidden="true" size={14} /> Moves here
                            </span>
                          ) : null}
                          {state === 'transit' ? <span className="transit-line" aria-hidden="true" /> : null}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mobile-cascade" role="list" aria-label="Course movement in chronological order">
          <article className="timeline-step timeline-step--failed" role="listitem">
            <time>{termById.get(scenario.disruption.termId)?.shortLabel}</time>
            <div>
              <CircleX aria-hidden="true" size={18} />
              <strong>{failedCourse?.code}</strong>
              <span>Did not pass</span>
            </div>
          </article>
          <article className="timeline-step timeline-step--repeat" role="listitem">
            <time>{termById.get(scenario.repeatTermId)?.shortLabel}</time>
            <div>
              <RotateCcw aria-hidden="true" size={18} />
              <strong>{failedCourse?.code}</strong>
              <span>Repeat</span>
            </div>
          </article>
          {mobileGroups.map(({ moved, term }) => (
            <article className="timeline-step timeline-step--moved" key={term.id} role="listitem">
              <time>{term.shortLabel}</time>
              <div>
                <span className="timeline-step__type">
                  {moved.some((movement) => movement.depth === 1)
                    ? 'Direct blocks clear'
                    : 'Downstream ripple'}
                </span>
                {moved.map((movement) => (
                  <p key={movement.courseId}>
                    <ArrowRight aria-hidden="true" size={17} />
                    <strong>{courseById.get(movement.courseId)?.code}</strong>
                    <span>Moves here</span>
                    <small>was {termById.get(movement.baselineTermId)?.shortLabel}</small>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <ol className="sr-only">
          <li>{failedCourse?.code} is not passed in {termById.get(scenario.disruption.termId)?.label}.</li>
          <li>{failedCourse?.code} can next be repeated in {termById.get(scenario.repeatTermId)?.label}.</li>
          <li>{directCodes.join(' and ')} are blocked directly.</li>
          <li>{downstreamCodes.join(', ')} move after their prerequisites shift.</li>
        </ol>
      </div>

      <aside className="why-panel" aria-labelledby="why-title">
        <h3 id="why-title">Why it moved</h3>
        <ol>
          <li>
            <span>1</span>
            <div>
              <strong>Missed once-yearly course</strong>
              <p>
                {failedCourse?.code} is offered in {offeredSeasons}; the next
                available term is {termById.get(scenario.repeatTermId)?.label}.
              </p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Direct prerequisites</strong>
              <p>{directCodes.join(' and ')} require {failedCourse?.code} first.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Downstream ripple</strong>
              <p>{downstreamCodes.join(', ')} depend on those courses and shift next.</p>
            </div>
          </li>
        </ol>
      </aside>

      <details className="why-disclosure">
        <summary>Why {scenario.affectedCourses.length} courses move</summary>
        <ol>
          <li>{failedCourse?.code} is offered only in Spring.</li>
          <li>{directCodes.join(' and ')} require it first.</li>
          <li>{downstreamCodes.join(', ')} depend on those courses.</li>
        </ol>
      </details>
    </section>
  )
}
