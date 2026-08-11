import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../domain'

export type PresentedPath = {
  id: AlternativePath['id']
  title: string
  description: string
  graduation: string
  busiestTerm: string
  maximumCredits: number
  workFit: string
  halfTime: string
  additionalCost: string
  sacrifice: string
  protects: string[]
}

export const priorityOptions: {
  id: Priority
  label: string
  description: string
}[] = [
  {
    id: 'graduate-on-time',
    label: 'Finish as soon as possible',
    description: 'Prioritize the earliest graduation, even if workload spikes.',
  },
  {
    id: 'protect-work-schedule',
    label: 'Keep my work schedule',
    description: 'Protect my 20 work hours each week and keep a steadier load.',
  },
  {
    id: 'limit-extra-cost',
    label: 'Limit extra costs',
    description: 'Avoid an added term when the plan makes that possible.',
  },
]

export function termLabel(dataset: PathBDataset, termId: string) {
  return dataset.terms.find((term) => term.id === termId)?.label ?? termId
}

export function graduationLabel(dataset: PathBDataset, termId: string) {
  const term = dataset.terms.find((candidate) => candidate.id === termId)
  if (!term) return termId

  const month =
    term.season === 'spring' ? 'May' : term.season === 'fall' ? 'December' : 'August'
  return `${month} ${term.year}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function presentPath(
  dataset: PathBDataset,
  path: AlternativePath,
): PresentedPath {
  const graduation = graduationLabel(dataset, path.graduationTermId)
  const busiestTerm = termLabel(dataset, path.busiestTermId)
  const halfTime = path.remainsHalfTime
    ? `At least ${dataset.student.minimumCreditsPerTerm} credits every term`
    : 'One or more terms fall below the planning threshold'

  if (path.id === 'faster-finish') {
    return {
      ...path,
      graduation,
      busiestTerm,
      workFit: `${path.workFit} — ${path.maximumCredits}-credit peak`,
      halfTime,
      additionalCost: formatCurrency(path.estimatedAdditionalCost),
      sacrifice: `${path.maximumCredits} credits in ${busiestTerm} while working ${dataset.student.workHoursPerWeek} hours weekly`,
      protects: [`${graduation} graduation`, 'Half-time status in every term'],
    }
  }

  return {
    ...path,
    graduation,
    busiestTerm,
    workFit: `${path.workFit} — ${path.maximumCredits}-credit maximum`,
    halfTime,
    additionalCost: formatCurrency(path.estimatedAdditionalCost),
    sacrifice: `Graduation moves ${path.additionalTerms} ${
      path.additionalTerms === 1 ? 'term' : 'terms'
    } later, to ${graduation}`,
    protects: [
      `${path.maximumCredits}-credit maximum`,
      `${dataset.student.workHoursPerWeek}-hour weekly work schedule`,
    ],
  }
}

export function buildAdvisorQuestion(
  dataset: PathBDataset,
  scenario: ScenarioResult,
  selectedPath: AlternativePath,
) {
  const failedCourse = dataset.courses.find(
    (course) => course.id === scenario.failedCourseId,
  )
  const repeatTerm = selectedPath.schedule.find((term) =>
    term.courseIds.includes(scenario.failedCourseId),
  )
  const companionCodes = (repeatTerm?.courseIds ?? [])
    .filter((courseId) => courseId !== scenario.failedCourseId)
    .slice(0, 2)
    .map(
      (courseId) =>
        dataset.courses.find((course) => course.id === courseId)?.code ?? courseId,
    )
  const companionPhrase =
    companionCodes.length > 0 ? ` alongside ${companionCodes.join(' and ')}` : ''

  const repeatCourse = failedCourse?.code ?? scenario.failedCourseId
  const repeatTermLabel = termLabel(dataset, scenario.repeatTermId)

  if (selectedPath.id === 'steadier-load') {
    return `Can we confirm that repeating ${repeatCourse} in ${repeatTermLabel}${companionPhrase} keeps every term at ${selectedPath.maximumCredits} credits or fewer, and what would a ${graduationLabel(dataset, selectedPath.graduationTermId)} graduation change for my aid?`
  }

  return `Can we confirm I can repeat ${repeatCourse} in ${repeatTermLabel}${companionPhrase}, stay at or above ${dataset.student.minimumCreditsPerTerm} credits, and still graduate in ${graduationLabel(dataset, selectedPath.graduationTermId)}?`
}

export function buildDeterministicExplanation(
  dataset: PathBDataset,
  scenario: ScenarioResult,
  selectedPath: AlternativePath,
) {
  const presented = presentPath(dataset, selectedPath)
  const directCount = scenario.affectedCourses.filter(
    (course) => course.depth === 1,
  ).length

  const tradeoff = `${presented.sacrifice.charAt(0).toLowerCase()}${presented.sacrifice.slice(1)}`

  return {
    summary: `${directCount} courses are blocked directly and ${scenario.affectedCourses.length} planned courses move downstream. ${selectedPath.title} reaches ${presented.graduation}.`,
    tradeoff: `This protects ${presented.protects.join(' and ')}. The tradeoff is ${tradeoff}.`,
    nextSteps: [
      `Confirm the ${termLabel(dataset, scenario.repeatTermId)} repeat offering and registration deadline.`,
      'Ask financial aid to verify the six-credit half-time assumption for Maya.',
      'Bring both paths to advising before changing the registered plan.',
    ],
    advisorQuestion: buildAdvisorQuestion(dataset, scenario, selectedPath),
  }
}
