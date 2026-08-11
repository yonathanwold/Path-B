import {
  CalendarClock,
  CircleX,
  GitBranch,
  ShieldCheck,
} from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../../domain'
import { priorityOptions, termLabel } from '../../presentation/scenario'

type ImpactStoryProps = {
  dataset: PathBDataset
  scenario: ScenarioResult
  priority: Priority
  recommendedPath: AlternativePath
}

export function ImpactStory({
  dataset,
  scenario,
  priority,
  recommendedPath,
}: ImpactStoryProps) {
  const failedCourse = dataset.courses.find(
    (course) => course.id === scenario.failedCourseId,
  )
  const directCount = scenario.affectedCourses.filter(
    (course) => course.depth === 1,
  ).length
  const priorityLabel = priorityOptions.find(
    (option) => option.id === priority,
  )?.label

  const steps = [
    {
      icon: CircleX,
      label: 'Fault',
      copy: `${failedCourse?.code ?? scenario.failedCourseId} not passed in ${termLabel(
        dataset,
        scenario.disruption.termId,
      )}.`,
      tone: 'fault',
    },
    {
      icon: CalendarClock,
      label: 'Cause',
      copy: `${failedCourse?.code ?? scenario.failedCourseId} is offered only in spring, so the next attempt is ${termLabel(
        dataset,
        scenario.repeatTermId,
      )}.`,
      tone: 'cause',
    },
    {
      icon: GitBranch,
      label: 'Effect',
      copy: `${directCount} direct blocks create ${scenario.affectedCourses.length} downstream course shifts.`,
      tone: 'effect',
    },
    {
      icon: ShieldCheck,
      label: 'What you protected',
      copy: `${priorityLabel}. Path B recommends ${recommendedPath.title.toLowerCase()} for that priority.`,
      tone: 'protected',
    },
  ]

  return (
    <aside className="impact-story" aria-labelledby="impact-story-title">
      <h2 id="impact-story-title">What happened and why</h2>
      <ol>
        {steps.map(({ icon: Icon, label, copy, tone }) => (
          <li className={`impact-step impact-step--${tone}`} key={label}>
            <span className="impact-step__icon">
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            </span>
            <div>
              <strong>{label}</strong>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
