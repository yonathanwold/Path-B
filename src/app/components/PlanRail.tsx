import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  GitBranch,
} from 'lucide-react'
import { useState } from 'react'

import type { PathBDataset } from '../../domain/index.ts'

export function PlanRail({
  dataset,
  vulnerableCourseId,
}: {
  dataset: PathBDataset
  vulnerableCourseId: string
}) {
  const courses = new Map(dataset.courses.map((course) => [course.id, course]))
  const [selectedCourseId, setSelectedCourseId] = useState(vulnerableCourseId)
  const expectedGraduation = dataset.terms.find(
    (term) => term.id === dataset.baselinePlan.expectedGraduationTermId,
  )
  const terms = dataset.terms
    .filter((term) => term.order <= (expectedGraduation?.order ?? 0))
    .toSorted((left, right) => left.order - right.order)
  const selectedCourse = courses.get(selectedCourseId)
  const selectedEntry = dataset.baselinePlan.entries.find(
    (entry) => entry.courseId === selectedCourseId,
  )
  const selectedTerm = dataset.terms.find(
    (term) => term.id === selectedEntry?.termId,
  )
  const prerequisites = (selectedCourse?.prerequisites ?? []).map(
    (courseId) => courses.get(courseId)?.code ?? courseId,
  )
  const unlocks = dataset.courses
    .filter((course) => course.prerequisites.includes(selectedCourseId))
    .map((course) => course.code)
  const offeringLabel = selectedCourse?.offeredIn
    .map((season) => season.charAt(0).toUpperCase() + season.slice(1))
    .join(' and ')
  const selectedIsVulnerable = selectedCourseId === vulnerableCourseId

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
                      className={[
                        'course-line',
                        vulnerable ? 'course-line--vulnerable' : '',
                        selectedCourseId === entry.courseId
                          ? 'course-line--selected'
                          : '',
                      ].filter(Boolean).join(' ')}
                      key={entry.courseId}
                    >
                      <button
                        aria-pressed={selectedCourseId === entry.courseId}
                        onClick={() => setSelectedCourseId(entry.courseId)}
                        type="button"
                      >
                        <code>{course?.code ?? entry.courseId}</code>
                        {vulnerable ? (
                          <span>
                            <AlertTriangle aria-hidden="true" size={13} />
                            Vulnerable hinge
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>

      <section
        aria-labelledby="course-inspector-title"
        className="course-inspector"
      >
        <div className="course-inspector__title">
          <span className="eyebrow">Selected course</span>
          <h3 id="course-inspector-title">
            {selectedCourse?.code}{' '}
            <span>{selectedCourse?.title}</span>
          </h3>
          <p>
            {selectedCourse?.credits} credits · {selectedTerm?.label} · Offered{' '}
            {offeringLabel}
          </p>
        </div>
        <dl>
          <div>
            <dt><CalendarClock aria-hidden="true" size={17} /> Prerequisites</dt>
            <dd>{prerequisites.length > 0 ? prerequisites.join(', ') : 'None in this plan'}</dd>
          </div>
          <div>
            <dt><GitBranch aria-hidden="true" size={17} /> Directly unlocks</dt>
            <dd>{unlocks.length > 0 ? unlocks.join(', ') : 'No later course directly'}</dd>
          </div>
          <div>
            <dt><AlertTriangle aria-hidden="true" size={17} /> Why it matters</dt>
            <dd>
              {selectedIsVulnerable
                ? 'Spring-only timing makes this the plan’s vulnerable hinge.'
                : unlocks.length > 0
                  ? `It unlocks ${unlocks.length} later ${unlocks.length === 1 ? 'course' : 'courses'}.`
                  : 'It completes part of Maya’s baseline degree plan.'}
            </dd>
          </div>
        </dl>
        <p aria-live="polite" className="sr-only" role="status">
          {selectedCourse?.code} details opened.
        </p>
      </section>
    </section>
  )
}
