import { ArrowRight, CircleX, RotateCcw } from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain'

type PlanCascadeProps = {
  dataset: PathBDataset
  scenario: ScenarioResult
  activePath: AlternativePath
}

type RailEvent = {
  courseId: string
  label: string
  tone: 'failed' | 'repeat' | 'was' | 'moved' | 'stays'
}

export function PlanCascade({
  dataset,
  scenario,
  activePath,
}: PlanCascadeProps) {
  const termsById = new Map(dataset.terms.map((term) => [term.id, term]))
  const courseById = new Map(dataset.courses.map((course) => [course.id, course]))
  const disruptionOrder = termsById.get(scenario.disruption.termId)?.order ?? 0
  const lastGraduationOrder = Math.max(
    ...scenario.alternatives.map(
      (path) => termsById.get(path.graduationTermId)?.order ?? disruptionOrder,
    ),
  )
  const terms = dataset.terms
    .filter(
      (term) =>
        term.order >= disruptionOrder && term.order <= lastGraduationOrder,
    )
    .toSorted((left, right) => left.order - right.order)
  const placements = new Map<string, string>()
  activePath.schedule.forEach((term) => {
    term.courseIds.forEach((courseId) => placements.set(courseId, term.termId))
  })
  const rows = [
    {
      courseId: scenario.failedCourseId,
      baselineTermId: scenario.disruption.termId,
      newTermId: placements.get(scenario.failedCourseId) ?? scenario.repeatTermId,
      failed: true,
    },
    ...scenario.affectedCourses.map((affected) => ({
      courseId: affected.courseId,
      baselineTermId: affected.baselineTermId,
      newTermId:
        activePath.id === 'faster-finish'
          ? affected.fasterTermId
          : affected.steadierTermId,
      failed: false,
    })),
  ]

  const eventFor = (
    row: (typeof rows)[number],
    termId: string,
  ): RailEvent | undefined => {
    if (row.failed && termId === row.baselineTermId) {
      return { courseId: row.courseId, label: 'Did not pass', tone: 'failed' }
    }
    if (row.failed && termId === row.newTermId) {
      return { courseId: row.courseId, label: 'Repeat', tone: 'repeat' }
    }
    if (!row.failed && row.baselineTermId === row.newTermId && termId === row.newTermId) {
      return { courseId: row.courseId, label: 'Stays here', tone: 'stays' }
    }
    if (!row.failed && termId === row.baselineTermId) {
      return { courseId: row.courseId, label: 'Was here', tone: 'was' }
    }
    if (!row.failed && termId === row.newTermId) {
      return { courseId: row.courseId, label: 'Moves here', tone: 'moved' }
    }
    return undefined
  }

  return (
    <section className="plan-cascade" aria-labelledby="cascade-title">
      <div className="section-heading section-heading--inline">
        <h2 id="cascade-title">Your degree plan</h2>
        <span>(before and after the fault)</span>
      </div>

      <div className="legend" aria-label="Impact legend">
        <span>
          <i className="legend__symbol legend__symbol--failed">×</i>
          Failed course
        </span>
        <span>
          <i className="legend__symbol legend__symbol--moved" />
          Delayed / moved
        </span>
        <span>
          <i className="legend__line legend__line--available" />
          Protected / viable
        </span>
      </div>

      <div className="dependency-path" aria-label="Dependency cascade">
        <span>CS 201</span>
        <ArrowRight aria-hidden="true" size={15} />
        <span>CS 301 + CS 330</span>
        <ArrowRight aria-hidden="true" size={15} />
        <span>CS 450 + CS 451 + CS 495</span>
      </div>

      <p className="visualization-description" id="cascade-description">
        CS 201 is not passed in Spring 2025 and can next be repeated in Spring
        2026. Two courses are blocked directly; five planned courses move in the
        selected {activePath.title.toLowerCase()} path.
      </p>

      <div className="cascade-table-wrap">
        <table
          aria-describedby="cascade-description"
          aria-label={`${activePath.title} course movement by term`}
          className="plan-table plan-table--cascade"
        >
          <thead>
            <tr>
              <th scope="col">Course</th>
              {terms.map((term) => (
                <th key={term.id} scope="col">
                  {term.shortLabel}
                  {term.id === scenario.disruption.termId ? (
                    <small>Fault</small>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const course = courseById.get(row.courseId)
              return (
                <tr key={row.courseId}>
                  <th scope="row">
                    <code>{course?.code ?? row.courseId}</code>
                    <span>{course?.title}</span>
                  </th>
                  {terms.map((term) => {
                    const event = eventFor(row, term.id)
                    return (
                      <td key={term.id}>
                        {event ? (
                          <span className={`course-mark course-mark--${event.tone}`}>
                            {event.tone === 'failed' ? (
                              <CircleX aria-hidden="true" size={15} />
                            ) : null}
                            {event.tone === 'repeat' ? (
                              <RotateCcw aria-hidden="true" size={14} />
                            ) : null}
                            {event.label}
                          </span>
                        ) : (
                          <span className="rail-continuation" aria-hidden="true" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div
        aria-label={`${activePath.title} course movement by term, mobile view`}
        className="mobile-cascade"
        role="list"
      >
        {terms.map((term) => {
          const events = rows.flatMap((row) => {
            const event = eventFor(row, term.id)
            return event ? [event] : []
          })
          return (
            <div className="mobile-term" key={term.id} role="listitem">
              <strong>{term.shortLabel}</strong>
              <div>
                {events.length > 0 ? (
                  events.map((event) => (
                    <span
                      className={`course-mark course-mark--${event.tone}`}
                      key={`${event.courseId}-${event.tone}`}
                    >
                      <code>{courseById.get(event.courseId)?.code}</code>
                      {event.label}
                    </span>
                  ))
                ) : (
                  <span className="mobile-term__quiet">No chain change</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
