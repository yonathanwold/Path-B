import type {
  AlternativePath,
  Course,
  CourseFailureDisruption,
  PathBDataset,
  PathStrategy,
  ScheduleIssue,
  ScheduledTerm,
} from '../model.ts'

export const pathStrategies: PathStrategy[] = [
  {
    id: 'faster-finish',
    title: 'Faster finish',
    description:
      'Use the open terms aggressively so the prerequisite chain can recover by May 2027.',
    maximumCredits: 15,
  },
  {
    id: 'steadier-load',
    title: 'Steadier load',
    description:
      'Keep every term at 10 credits or fewer and give Maya more room for work.',
    maximumCredits: 10,
  },
]

function courseById(dataset: PathBDataset) {
  return new Map(dataset.courses.map((course) => [course.id, course]))
}

function termById(dataset: PathBDataset) {
  return new Map(dataset.terms.map((term) => [term.id, term]))
}

function baselinePriority(dataset: PathBDataset) {
  const terms = termById(dataset)
  return new Map(
    dataset.baselinePlan.entries.map((entry, entryIndex) => [
      entry.courseId,
      (terms.get(entry.termId)?.order ?? 0) * 100 + entryIndex,
    ]),
  )
}

function scheduleRemainingCourses(
  dataset: PathBDataset,
  disruption: CourseFailureDisruption,
  strategy: PathStrategy,
): ScheduledTerm[] {
  const courses = courseById(dataset)
  const terms = dataset.terms.toSorted((left, right) => left.order - right.order)
  const disruptionOrder =
    terms.find((term) => term.id === disruption.termId)?.order ?? -1
  const priority = baselinePriority(dataset)
  const completed = new Set(
    dataset.baselinePlan.entries
      .filter(
        (entry) =>
          entry.courseId !== disruption.courseId &&
          (entry.status === 'completed' ||
            (entry.status === 'in-progress' &&
              entry.termId === disruption.termId)),
      )
      .map((entry) => entry.courseId),
  )
  const remaining = new Set(
    dataset.baselinePlan.entries
      .filter((entry) => {
        const order = terms.find((term) => term.id === entry.termId)?.order ?? -1
        return entry.courseId === disruption.courseId || order > disruptionOrder
      })
      .map((entry) => entry.courseId),
  )
  const scheduledTerms: ScheduledTerm[] = []

  terms
    .filter((term) => term.order > disruptionOrder)
    .forEach((term) => {
      if (remaining.size === 0) return

      const candidates = [...remaining]
        .map((courseId) => courses.get(courseId))
        .filter((course): course is Course => Boolean(course))
        .filter(
          (course) =>
            course.offeredIn.includes(term.season) &&
            course.prerequisites.every((prerequisite) =>
              completed.has(prerequisite),
            ),
        )
        .toSorted(
          (left, right) =>
            (priority.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
            (priority.get(right.id) ?? Number.MAX_SAFE_INTEGER),
        )

      const selected: Course[] = []
      let credits = 0

      candidates.forEach((course) => {
        if (credits + course.credits > strategy.maximumCredits) return
        selected.push(course)
        credits += course.credits
      })

      if (selected.length === 0) return

      selected.forEach((course) => remaining.delete(course.id))
      scheduledTerms.push({
        termId: term.id,
        courseIds: selected.map((course) => course.id),
        credits,
      })
      selected.forEach((course) => completed.add(course.id))
    })

  if (remaining.size > 0) {
    throw new Error(
      `The ${strategy.id} strategy could not schedule: ${[...remaining].join(', ')}`,
    )
  }

  return scheduledTerms
}

export function validateSchedule(
  dataset: PathBDataset,
  disruption: CourseFailureDisruption,
  strategy: PathStrategy,
  schedule: ScheduledTerm[],
): ScheduleIssue[] {
  const courses = courseById(dataset)
  const terms = termById(dataset)
  const disruptionOrder = terms.get(disruption.termId)?.order ?? -1
  const expectedCourseIds = new Set(
    dataset.baselinePlan.entries
      .filter((entry) => {
        const baselineOrder = terms.get(entry.termId)?.order ?? -1
        return (
          entry.courseId === disruption.courseId ||
          baselineOrder > disruptionOrder
        )
      })
      .map((entry) => entry.courseId),
  )
  const completed = new Set(
    dataset.baselinePlan.entries
      .filter(
        (entry) =>
          entry.courseId !== disruption.courseId &&
          (entry.status === 'completed' ||
            (entry.status === 'in-progress' &&
              entry.termId === disruption.termId)),
      )
      .map((entry) => entry.courseId),
  )
  const issues: ScheduleIssue[] = []
  const scheduledCourseIds = new Set<string>()
  const scheduledTermIds = new Set<string>()
  let previousTermOrder = disruptionOrder

  schedule.forEach((scheduledTerm) => {
    const term = terms.get(scheduledTerm.termId)
    if (scheduledTermIds.has(scheduledTerm.termId)) {
      issues.push({
        code: 'duplicate-term',
        message: `Scheduled term appears more than once: ${scheduledTerm.termId}.`,
      })
    }
    scheduledTermIds.add(scheduledTerm.termId)

    if (term && term.order <= previousTermOrder) {
      issues.push({
        code: 'term-order',
        message: `${term.label} is not after the prior scheduled term and disruption.`,
      })
    }
    if (term) previousTermOrder = Math.max(previousTermOrder, term.order)

    const scheduledCourses = scheduledTerm.courseIds.flatMap((courseId) => {
      if (scheduledCourseIds.has(courseId)) {
        issues.push({
          code: 'duplicate-course',
          message: `Course is scheduled more than once: ${courseId}.`,
        })
      }
      scheduledCourseIds.add(courseId)

      if (!expectedCourseIds.has(courseId)) {
        issues.push({
          code: 'unexpected-course',
          message: `Course is outside the remaining baseline plan: ${courseId}.`,
        })
      }

      const course = courses.get(courseId)
      if (!course) {
        issues.push({
          code: 'unknown-course',
          message: `Unknown scheduled course: ${courseId}.`,
        })
        return []
      }
      return [course]
    })
    const actualCredits = scheduledCourses.reduce(
      (total, course) => total + course.credits,
      0,
    )

    if (!term) {
      issues.push({
        code: 'unknown-term',
        message: `Unknown scheduled term: ${scheduledTerm.termId}.`,
      })
    }
    if (scheduledTerm.credits !== actualCredits) {
      issues.push({
        code: 'credit-mismatch',
        message: `${scheduledTerm.termId} declares ${scheduledTerm.credits} credits, but its known courses total ${actualCredits}.`,
      })
    }
    if (actualCredits > strategy.maximumCredits) {
      issues.push({
        code: 'over-credit-cap',
        message: `${scheduledTerm.termId} exceeds ${strategy.maximumCredits} credits.`,
      })
    }
    if (actualCredits < dataset.student.minimumCreditsPerTerm) {
      issues.push({
        code: 'below-half-time',
        message: `${scheduledTerm.termId} falls below the ${dataset.student.minimumCreditsPerTerm}-credit assumption.`,
      })
    }

    scheduledCourses.forEach((course) => {
      if (term && !course.offeredIn.includes(term.season)) {
        issues.push({
          code: 'course-unavailable',
          message: `${course.code} is not offered in ${term.label}.`,
        })
      }

      const missingPrerequisite = course.prerequisites.find(
        (prerequisite) => !completed.has(prerequisite),
      )
      if (missingPrerequisite) {
        issues.push({
          code: 'prerequisite-order',
          message: `${course.code} is scheduled before ${missingPrerequisite}.`,
        })
      }
    })

    scheduledCourses.forEach((course) => completed.add(course.id))
  })

  expectedCourseIds.forEach((courseId) => {
    if (!scheduledCourseIds.has(courseId)) {
      issues.push({
        code: 'missing-course',
        message: `Remaining baseline course was not scheduled: ${courseId}.`,
      })
    }
  })

  return issues
}

function measurePath(
  dataset: PathBDataset,
  strategy: PathStrategy,
  schedule: ScheduledTerm[],
) {
  const maximumCredits = Math.max(...schedule.map((term) => term.credits))
  const remainsHalfTime = schedule.every(
    (term) => term.credits >= dataset.student.minimumCreditsPerTerm,
  )
  const workFit =
    maximumCredits <= dataset.student.comfortableCreditCap
      ? ('comfortable' as const)
      : ('tight' as const)

  if (strategy.id === 'faster-finish') {
    return {
      maximumCredits,
      remainsHalfTime,
      workFit,
    }
  }

  return {
    maximumCredits,
    remainsHalfTime,
    workFit,
  }
}

export function generateAlternativePath(
  dataset: PathBDataset,
  disruption: CourseFailureDisruption,
  strategy: PathStrategy,
): AlternativePath {
  const schedule = scheduleRemainingCourses(dataset, disruption, strategy)
  const issues = validateSchedule(dataset, disruption, strategy, schedule)
  const lastTerm = schedule.at(-1)

  if (!lastTerm) {
    throw new Error(`The ${strategy.id} strategy produced an empty schedule.`)
  }

  const busiestTerm = schedule.reduce((current, candidate) =>
    candidate.credits > current.credits ? candidate : current,
  )
  const termOrder = new Map(dataset.terms.map((term) => [term.id, term.order]))
  const baselineGraduationOrder =
    termOrder.get(dataset.baselinePlan.expectedGraduationTermId) ?? 0
  const graduationOrder = termOrder.get(lastTerm?.termId ?? '') ?? 0
  const additionalTerms = Math.max(0, graduationOrder - baselineGraduationOrder)
  const repeatedCourse = dataset.courses.find(
    (course) => course.id === disruption.courseId,
  )
  const estimatedAdditionalCost =
    (repeatedCourse?.credits ?? 0) * dataset.costModel.tuitionPerCredit +
    additionalTerms * dataset.costModel.enrollmentFeePerTerm
  const measurements = measurePath(dataset, strategy, schedule)

  return {
    id: strategy.id,
    title: strategy.title,
    description: strategy.description,
    schedule,
    graduationTermId: lastTerm.termId,
    busiestTermId: busiestTerm.termId,
    maximumCredits: measurements.maximumCredits,
    workFit: measurements.workFit,
    remainsHalfTime: measurements.remainsHalfTime,
    estimatedAdditionalCost,
    additionalTerms,
    issues,
  }
}
