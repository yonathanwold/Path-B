import { ArrowRight, GitBranch, ShieldCheck } from 'lucide-react'

import type { PathBDataset, ScenarioResult } from '../../domain/index.ts'
import { graduationLabel } from '../../presentation/scenario.ts'
import { PlanRail } from '../components/PlanRail.tsx'
import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function PlanPage({
  dataset,
  navigate,
  previewScenario,
}: {
  dataset: PathBDataset
  navigate: (to: RoutePath) => void
  previewScenario: ScenarioResult
}) {
  const failedCourse = dataset.courses.find(
    (course) => course.id === previewScenario.failedCourseId,
  )
  const directCodes = previewScenario.affectedCourses
    .filter((course) => course.depth === 1)
    .map(
      (affected) =>
        dataset.courses.find((course) => course.id === affected.courseId)?.code ??
        affected.courseId,
    )

  return (
    <div className="page page--plan">
      <header className="page-header page-header--with-status">
        <div>
          <span className="eyebrow">My Plan</span>
          <h1 data-route-heading tabIndex={-1}>
            Maya is on track—if one spring-only course holds.
          </h1>
          <p className="page-lede">
            The baseline reaches{' '}
            {graduationLabel(dataset, dataset.baselinePlan.expectedGraduationTermId)}.
            Path B first verifies the healthy plan, then finds the hinge worth testing.
          </p>
        </div>
        <span className="status-pill status-pill--viable">
          <ShieldCheck aria-hidden="true" size={18} /> Viable today
        </span>
      </header>

      <PlanRail dataset={dataset} vulnerableCourseId={previewScenario.failedCourseId} />

      <section className="hinge-explanation" aria-labelledby="hinge-title">
        <span className="hinge-explanation__icon">
          <GitBranch aria-hidden="true" size={26} />
        </span>
        <div>
          <span className="eyebrow">Vulnerable hinge</span>
          <h2 id="hinge-title">
            {failedCourse?.code} unlocks {previewScenario.affectedCourses.length}{' '}
            planned courses.
          </h2>
          <p>
            {failedCourse?.code} is offered only in Spring. It directly unlocks{' '}
            {directCodes.join(' and ')}, which then unlock the remaining capstone chain.
          </p>
        </div>
        <RouteLink className="primary-button" navigate={navigate} to="/stress-test">
          Stress-test this plan <ArrowRight aria-hidden="true" size={18} />
        </RouteLink>
      </section>
    </div>
  )
}
