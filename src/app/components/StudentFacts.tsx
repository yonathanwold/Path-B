import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import type { PathBDataset } from '../../domain'
import { graduationLabel } from '../../presentation/scenario'

type StudentFactsProps = {
  dataset: PathBDataset
  compact?: boolean
}

export function StudentFacts({ dataset, compact = false }: StudentFactsProps) {
  const facts = [
    {
      icon: UserRound,
      text: dataset.student.name,
    },
    {
      icon: GraduationCap,
      text: `${dataset.student.classYearLabel} · ${dataset.student.program}`,
    },
    {
      icon: BriefcaseBusiness,
      text: `Works ${dataset.student.workHoursPerWeek} hours weekly`,
    },
    {
      icon: ShieldCheck,
      text: `Must remain at least half-time`,
    },
    {
      icon: CalendarDays,
      text: `Expected graduation ${graduationLabel(
        dataset,
        dataset.baselinePlan.expectedGraduationTermId,
      )}`,
      setupOnly: true,
    },
  ]

  return (
    <ul className={`student-facts${compact ? ' student-facts--compact' : ''}`}>
      {facts.map(({ icon: Icon, text, setupOnly }) =>
        compact && setupOnly ? null : (
          <li key={text}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{text}</span>
          </li>
        ),
      )}
    </ul>
  )
}
