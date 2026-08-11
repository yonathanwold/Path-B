import { AlertCircle, ArrowRight, Info } from 'lucide-react'

import type { PathBDataset } from '../../domain'

type BaselinePlanProps = {
  dataset: PathBDataset
}

const criticalCourseIds = ['CS201', 'CS301', 'CS330', 'CS495']
const displayedTermIds = [
  'fall-2024',
  'spring-2025',
  'fall-2025',
  'spring-2026',
  'fall-2026',
  'spring-2027',
]

export function BaselinePlan({ dataset }: BaselinePlanProps) {
  const courses = criticalCourseIds.flatMap((courseId) => {
    const course = dataset.courses.find((candidate) => candidate.id === courseId)
    return course ? [course] : []
  })
  const terms = displayedTermIds.flatMap((termId) => {
    const term = dataset.terms.find((candidate) => candidate.id === termId)
    return term ? [term] : []
  })

  return (
    <section className="baseline-plan" aria-labelledby="baseline-title">
      <div className="section-heading section-heading--inline">
        <h2 id="baseline-title">Maya's degree plan</h2>
        <span>(before the crash)</span>
      </div>

      <div className="legend" aria-label="Plan legend">
        <span>
          <i className="legend__line legend__line--available" />
          Available as planned
        </span>
        <span>
          <i className="legend__line legend__line--link" />
          Prerequisite link
        </span>
      </div>

      <div className="baseline-table-wrap">
        <table className="plan-table plan-table--baseline">
          <caption className="sr-only">
            Maya's baseline sequence for the CS 201 prerequisite chain.
          </caption>
          <thead>
            <tr>
              <th scope="col">Course</th>
              {terms.map((term) => (
                <th key={term.id} scope="col">
                  {term.shortLabel}
                  {term.id === 'fall-2024' ? <small>Completed</small> : null}
                  {term.id === 'spring-2025' ? <small>Current</small> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const entry = dataset.baselinePlan.entries.find(
                (candidate) => candidate.courseId === course.id,
              )

              return (
                <tr key={course.id}>
                  <th scope="row">
                    <code>{course.code}</code>
                    <span>{course.title}</span>
                  </th>
                  {terms.map((term) => {
                    const isPlanned = entry?.termId === term.id
                    const isVulnerable = isPlanned && course.id === 'CS201'
                    return (
                      <td key={term.id}>
                        {isPlanned ? (
                          <span
                            className={`course-mark${
                              isVulnerable ? ' course-mark--vulnerable' : ''
                            }`}
                          >
                            {isVulnerable ? (
                              <AlertCircle aria-hidden="true" size={15} />
                            ) : null}
                            {isVulnerable ? 'Vulnerable hinge' : 'Planned'}
                          </span>
                        ) : (
                          <span className="empty-cell" aria-hidden="true">
                            —
                          </span>
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

      <div className="baseline-dependency" aria-label="Prerequisite chain">
        <span>CS 201</span>
        <ArrowRight aria-hidden="true" size={16} />
        <span>CS 301 + CS 330</span>
        <ArrowRight aria-hidden="true" size={16} />
        <span>CS 495</span>
        <strong>Once-yearly course · 2 direct blocks · 5 downstream shifts</strong>
      </div>

      <p className="plan-method-note">
        <Info aria-hidden="true" size={18} />
        Path B follows course dependencies, term availability, workload, and
        Maya's constraints — then compares viable ways forward.
      </p>
    </section>
  )
}
