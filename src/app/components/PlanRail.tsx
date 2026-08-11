import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import type { PathBDataset } from '../../domain/index.ts'

export function PlanRail({
  dataset,
  vulnerableCourseId,
}: {
  dataset: PathBDataset
  vulnerableCourseId: string
}) {
  const courses = new Map(dataset.courses.map((course) => [course.id, course]))
  const expectedGraduation = dataset.terms.find(
    (term) => term.id === dataset.baselinePlan.expectedGraduationTermId,
  )
  const terms = dataset.terms
    .filter((term) => term.order <= (expectedGraduation?.order ?? 0))
    .toSorted((left, right) => left.order - right.order)

  return (
    <section className="plan-rail" aria-labelledby="plan-rail-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Baseline plan</span>
          <h2 id="plan-rail-title">Six terms to graduation</h2>
        </div>
        <span className="viability-label">
          <CheckCircle2 aria-hidden="true" size={17} />
          Viable as planned
        </span>
      </div>

      <div className="term-grid" role="list" aria-label="Maya's baseline plan by term">
        {terms.map((term) => {
          const entries = dataset.baselinePlan.entries.filter(
            (entry) => entry.termId === term.id,
          )
          const credits = entries.reduce(
            (total, entry) => total + (courses.get(entry.courseId)?.credits ?? 0),
            0,
          )

          return (
            <article className="term-column" key={term.id} role="listitem">
              <header>
                <strong>{term.shortLabel}</strong>
                <span>{credits} credits</span>
              </header>
              <ul>
                {entries.map((entry) => {
                  const course = courses.get(entry.courseId)
                  const vulnerable = entry.courseId === vulnerableCourseId
                  return (
                    <li
                      className={vulnerable ? 'course-line course-line--vulnerable' : 'course-line'}
                      key={entry.courseId}
                    >
                      <code>{course?.code ?? entry.courseId}</code>
                      {vulnerable ? (
                        <span>
                          <AlertTriangle aria-hidden="true" size={13} />
                          Vulnerable hinge
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
