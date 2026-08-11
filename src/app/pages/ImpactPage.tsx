import {
  ArrowRight,
  CalendarClock,
  CircleX,
  GitBranch,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain/index.ts'
import { graduationLabel, termLabel } from '../../presentation/scenario.ts'
import { ImpactCascade } from '../components/ImpactCascade.tsx'
import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function ImpactPage({
  dataset,
  navigate,
  path,
  scenario,
}: {
  dataset: PathBDataset
  navigate: (to: RoutePath) => void
  path: AlternativePath
  scenario: ScenarioResult
}) {
  const failedCourse = dataset.courses.find(
    (course) => course.id === scenario.failedCourseId,
  )
  const directCount = scenario.affectedCourses.filter(
    (course) => course.depth === 1,
  ).length

  return (
    <div className="page page--impact">
      <header className="page-header page-header--impact">
        <span className="eyebrow">Impact</span>
        <h1 data-route-heading tabIndex={-1}>
          {failedCourse?.code} wasn&apos;t passed. {scenario.affectedCourses.length}{' '}
          planned courses must move.
        </h1>
        <p className="page-lede">
          Spring-only availability delays the retry to {termLabel(dataset, scenario.repeatTermId)},
          blocking {directCount} courses and shifting {scenario.affectedCourses.length} downstream.
        </p>
      </header>

      <dl className="impact-facts">
        <div className="impact-fact impact-fact--coral">
          <CircleX aria-hidden="true" size={25} />
          <span><dt>Failed</dt><dd>{failedCourse?.code}</dd></span>
        </div>
        <div>
          <CalendarClock aria-hidden="true" size={25} />
          <span><dt>Next offering</dt><dd>{termLabel(dataset, scenario.repeatTermId)}</dd></span>
        </div>
        <div className="impact-fact impact-fact--coral">
          <GitBranch aria-hidden="true" size={25} />
          <span><dt>Direct blocks</dt><dd>{directCount} courses</dd></span>
        </div>
        <div>
          <GraduationCap aria-hidden="true" size={25} />
          <span><dt>Earliest finish</dt><dd>{graduationLabel(dataset, path.graduationTermId)}</dd></span>
        </div>
      </dl>

      <ImpactCascade dataset={dataset} path={path} scenario={scenario} />

      <footer className="route-footer route-footer--impact">
        <p>
          <ShieldCheck aria-hidden="true" size={18} />
          Deterministic plan facts · no AI changed course requirements
        </p>
        <RouteLink className="primary-button" navigate={navigate} to="/paths">
          Compare recovery paths <ArrowRight aria-hidden="true" size={18} />
        </RouteLink>
      </footer>
    </div>
  )
}
