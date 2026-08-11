import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  GitBranch,
  ShieldCheck,
} from 'lucide-react'

import type { PathBDataset, ScenarioResult } from '../../domain/index.ts'
import { graduationLabel } from '../../presentation/scenario.ts'
import type { RoutePath } from '../routing.ts'
import { RouteLink } from '../components/RouteLink.tsx'

export function OverviewPage({
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
  const baselineGraduation = graduationLabel(
    dataset,
    dataset.baselinePlan.expectedGraduationTermId,
  )

  return (
    <div className="page page--overview">
      <section className="overview-hero">
        <div className="overview-copy">
          <span className="eyebrow">A crash test for your college plan</span>
          <h1 data-route-heading tabIndex={-1}>
            Real life changed. Will Maya&apos;s plan hold?
          </h1>
          <p className="page-lede">
            Path B shows exactly what moves, why it moves, and which recovery
            path protects what matters most.
          </p>
          <div className="hero-actions">
            <RouteLink className="primary-button" navigate={navigate} to="/plan">
              Review Maya&apos;s plan <ArrowRight aria-hidden="true" size={18} />
            </RouteLink>
            <RouteLink className="text-link" navigate={navigate} to="/stress-test">
              Start the two-minute demo
            </RouteLink>
          </div>
          <p className="fixture-note">
            <ShieldCheck aria-hidden="true" size={17} />
            Synthetic student and catalog data, clearly labeled throughout.
          </p>
        </div>

        <div className="overview-visual" aria-label="Preview of Maya's plan vulnerability">
          <div className="overview-visual__header">
            <span>
              <CalendarCheck2 aria-hidden="true" size={18} />
              Today
            </span>
            <strong>On track for {baselineGraduation}</strong>
          </div>
          <div className="hinge-preview">
            <div className="hinge-preview__course">
              <span>Spring 2025</span>
              <strong>{failedCourse?.code}</strong>
              <small>{failedCourse?.title}</small>
              <em>Spring-only hinge</em>
            </div>
            <ArrowRight aria-hidden="true" size={20} />
            <div className="hinge-preview__branch">
              <span>Unlocks next</span>
              <strong>CS 301 + CS 330</strong>
              <small>then {previewScenario.affectedCourses.length - 2} more courses</small>
            </div>
          </div>
          <div className="stress-preview">
            <GitBranch aria-hidden="true" size={20} />
            <span>
              <strong>If {failedCourse?.code} is not passed</strong>
              Path B traces the entire prerequisite cascade before suggesting a response.
            </span>
          </div>
        </div>
      </section>

      <section className="student-snapshot" aria-labelledby="student-snapshot-title">
        <div>
          <span className="eyebrow">Demo student</span>
          <h2 id="student-snapshot-title">Meet Maya</h2>
          <p>
            A sophomore balancing a computer science degree, a 20-hour work week,
            and a half-time enrollment requirement.
          </p>
        </div>
        <dl>
          <div>
            <dt><CalendarCheck2 aria-hidden="true" size={18} /> Expected graduation</dt>
            <dd>{baselineGraduation}</dd>
          </div>
          <div>
            <dt><BriefcaseBusiness aria-hidden="true" size={18} /> Weekly work</dt>
            <dd>{dataset.student.workHoursPerWeek} hours</dd>
          </div>
          <div>
            <dt><ShieldCheck aria-hidden="true" size={18} /> Enrollment floor</dt>
            <dd>{dataset.student.minimumCreditsPerTerm} credits</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
