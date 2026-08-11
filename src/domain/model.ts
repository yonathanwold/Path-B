import { z } from 'zod'

export const SeasonSchema = z.enum(['fall', 'spring', 'summer'])
export type Season = z.infer<typeof SeasonSchema>

export const SourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1),
  url: z.url().optional(),
})

export const AssumptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  kind: z.enum(['fixture-fact', 'student-constraint', 'cost-model']),
  sourceId: z.string().min(1),
  verificationNote: z.string().min(1),
})

export const TermSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shortLabel: z.string().min(1),
  season: SeasonSchema,
  year: z.number().int().min(2020).max(2100),
  order: z.number().int().nonnegative(),
})

export const CourseSchema = z.object({
  id: z.string().regex(/^[A-Z]{2,5}\d{3}$/),
  code: z.string().min(1),
  title: z.string().min(1),
  credits: z.number().int().min(1).max(6),
  prerequisites: z.array(z.string()),
  offeredIn: z.array(SeasonSchema).min(1),
  sourceId: z.string().min(1),
})

export const PlanEntrySchema = z.object({
  courseId: z.string().min(1),
  termId: z.string().min(1),
  status: z.enum(['completed', 'in-progress', 'planned']),
})

export const StudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  classYearLabel: z.string().min(1),
  program: z.string().min(1),
  workHoursPerWeek: z.number().int().nonnegative().max(80),
  minimumCreditsPerTerm: z.number().int().positive(),
  comfortableCreditCap: z.number().int().positive(),
})

export const CostModelSchema = z.object({
  tuitionPerCredit: z.number().nonnegative(),
  enrollmentFeePerTerm: z.number().nonnegative(),
  currency: z.literal('USD'),
  sourceId: z.string().min(1),
})

export const BaselinePlanSchema = z.object({
  expectedGraduationTermId: z.string().min(1),
  entries: z.array(PlanEntrySchema).min(1),
})

const UniqueIdsSchema = z.object({
  institutionLabel: z.string().min(1),
  fixtureDisclosure: z.string().min(1),
  sources: z.array(SourceSchema).min(1),
  assumptions: z.array(AssumptionSchema).min(1),
  terms: z.array(TermSchema).min(1),
  courses: z.array(CourseSchema).min(1),
  student: StudentSchema,
  costModel: CostModelSchema,
  baselinePlan: BaselinePlanSchema,
})

function reportDuplicates(
  values: string[],
  path: (string | number)[],
  label: string,
  context: z.core.$RefinementCtx,
) {
  const seen = new Set<string>()

  values.forEach((value, index) => {
    if (seen.has(value)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate ${label}: ${value}`,
        path: [...path, index, 'id'],
      })
    }
    seen.add(value)
  })
}

export const PathBDatasetSchema = UniqueIdsSchema.superRefine((dataset, context) => {
  reportDuplicates(
    dataset.sources.map((source) => source.id),
    ['sources'],
    'source id',
    context,
  )
  reportDuplicates(
    dataset.terms.map((term) => term.id),
    ['terms'],
    'term id',
    context,
  )
  reportDuplicates(
    dataset.assumptions.map((assumption) => assumption.id),
    ['assumptions'],
    'assumption id',
    context,
  )
  reportDuplicates(
    dataset.courses.map((course) => course.id),
    ['courses'],
    'course id',
    context,
  )

  const seenTermOrders = new Set<number>()
  dataset.terms.forEach((term, index) => {
    if (seenTermOrders.has(term.order)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate term order: ${term.order}`,
        path: ['terms', index, 'order'],
      })
    }
    seenTermOrders.add(term.order)
  })

  const seenPlanCourses = new Set<string>()
  dataset.baselinePlan.entries.forEach((entry, index) => {
    if (seenPlanCourses.has(entry.courseId)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate baseline course: ${entry.courseId}`,
        path: ['baselinePlan', 'entries', index, 'courseId'],
      })
    }
    seenPlanCourses.add(entry.courseId)
  })

  const inProgressTermIds = new Set(
    dataset.baselinePlan.entries
      .filter((entry) => entry.status === 'in-progress')
      .map((entry) => entry.termId),
  )
  if (inProgressTermIds.size !== 1) {
    context.addIssue({
      code: 'custom',
      message: 'All in-progress courses must share one current term.',
      path: ['baselinePlan', 'entries'],
    })
  }

  const sourceIds = new Set(dataset.sources.map((source) => source.id))
  const termIds = new Set(dataset.terms.map((term) => term.id))
  const courseIds = new Set(dataset.courses.map((course) => course.id))
  const coursesById = new Map(dataset.courses.map((course) => [course.id, course]))
  const termsById = new Map(dataset.terms.map((term) => [term.id, term]))
  const planByCourse = new Map(
    dataset.baselinePlan.entries.map((entry) => [entry.courseId, entry]),
  )

  if (!sourceIds.has(dataset.costModel.sourceId)) {
    context.addIssue({
      code: 'custom',
      message: `Unknown cost model source: ${dataset.costModel.sourceId}`,
      path: ['costModel', 'sourceId'],
    })
  }

  dataset.assumptions.forEach((assumption, index) => {
    if (!sourceIds.has(assumption.sourceId)) {
      context.addIssue({
        code: 'custom',
        message: `Unknown assumption source: ${assumption.sourceId}`,
        path: ['assumptions', index, 'sourceId'],
      })
    }
  })

  dataset.courses.forEach((course, courseIndex) => {
    if (!sourceIds.has(course.sourceId)) {
      context.addIssue({
        code: 'custom',
        message: `Unknown course source: ${course.sourceId}`,
        path: ['courses', courseIndex, 'sourceId'],
      })
    }

    course.prerequisites.forEach((prerequisite, prerequisiteIndex) => {
      if (!courseIds.has(prerequisite)) {
        context.addIssue({
          code: 'custom',
          message: `Unknown prerequisite: ${prerequisite}`,
          path: [
            'courses',
            courseIndex,
            'prerequisites',
            prerequisiteIndex,
          ],
        })
      }
    })
  })

  dataset.baselinePlan.entries.forEach((entry, index) => {
    if (!courseIds.has(entry.courseId)) {
      context.addIssue({
        code: 'custom',
        message: `Unknown planned course: ${entry.courseId}`,
        path: ['baselinePlan', 'entries', index, 'courseId'],
      })
    }
    if (!termIds.has(entry.termId)) {
      context.addIssue({
        code: 'custom',
        message: `Unknown planned term: ${entry.termId}`,
        path: ['baselinePlan', 'entries', index, 'termId'],
      })
    }

    const course = coursesById.get(entry.courseId)
    const term = termsById.get(entry.termId)
    if (course && term && !course.offeredIn.includes(term.season)) {
      context.addIssue({
        code: 'custom',
        message: `${course.code} is not offered in ${term.label}`,
        path: ['baselinePlan', 'entries', index, 'termId'],
      })
    }

    if (course && term) {
      course.prerequisites.forEach((prerequisite) => {
        const prerequisiteEntry = planByCourse.get(prerequisite)
        const prerequisiteTerm = prerequisiteEntry
          ? termsById.get(prerequisiteEntry.termId)
          : undefined

        if (!prerequisiteEntry || !prerequisiteTerm) {
          context.addIssue({
            code: 'custom',
            message: `Baseline plan is missing prerequisite ${prerequisite} for ${course.code}`,
            path: ['baselinePlan', 'entries', index, 'courseId'],
          })
        } else if (prerequisiteTerm.order >= term.order) {
          context.addIssue({
            code: 'custom',
            message: `${course.code} must follow ${prerequisite}`,
            path: ['baselinePlan', 'entries', index, 'termId'],
          })
        }
      })
    }
  })

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const reportedCycles = new Set<string>()

  function visit(courseId: string, path: string[]) {
    if (visited.has(courseId)) return
    if (visiting.has(courseId)) {
      const cycleStart = path.indexOf(courseId)
      const cycle = [...path.slice(cycleStart), courseId]
      const cycleKey = cycle.toSorted().join('|')
      if (!reportedCycles.has(cycleKey)) {
        reportedCycles.add(cycleKey)
        context.addIssue({
          code: 'custom',
          message: `Prerequisite cycle: ${cycle.join(' → ')}`,
          path: ['courses'],
        })
      }
      return
    }

    visiting.add(courseId)
    const course = coursesById.get(courseId)
    course?.prerequisites.forEach((prerequisite) =>
      visit(prerequisite, [...path, courseId]),
    )
    visiting.delete(courseId)
    visited.add(courseId)
  }

  dataset.courses.forEach((course) => visit(course.id, []))

  if (!termIds.has(dataset.baselinePlan.expectedGraduationTermId)) {
    context.addIssue({
      code: 'custom',
      message: 'The expected graduation term is not in the fixture.',
      path: ['baselinePlan', 'expectedGraduationTermId'],
    })
  }
})

export const PrioritySchema = z.enum([
  'graduate-on-time',
  'protect-work-schedule',
  'limit-extra-cost',
])

export const CourseFailureDisruptionSchema = z.object({
  type: z.literal('course-not-passed'),
  courseId: z.string().min(1),
  termId: z.string().min(1),
})

export type Source = z.infer<typeof SourceSchema>
export type Assumption = z.infer<typeof AssumptionSchema>
export type Term = z.infer<typeof TermSchema>
export type Course = z.infer<typeof CourseSchema>
export type PlanEntry = z.infer<typeof PlanEntrySchema>
export type Student = z.infer<typeof StudentSchema>
export type PathBDataset = z.infer<typeof PathBDatasetSchema>
export type Priority = z.infer<typeof PrioritySchema>
export type CourseFailureDisruption = z.infer<
  typeof CourseFailureDisruptionSchema
>

export type PathStrategy = {
  id: 'faster-finish' | 'steadier-load'
  title: string
  description: string
  maximumCredits: number
}

export type ScheduledTerm = {
  termId: string
  courseIds: string[]
  credits: number
}

export type ScheduleIssue = {
  code:
    | 'below-half-time'
    | 'credit-mismatch'
    | 'duplicate-course'
    | 'duplicate-term'
    | 'missing-course'
    | 'over-credit-cap'
    | 'prerequisite-order'
    | 'course-unavailable'
    | 'term-order'
    | 'unexpected-course'
    | 'unknown-course'
    | 'unknown-term'
  message: string
}

export type AlternativePath = {
  id: PathStrategy['id']
  title: string
  description: string
  schedule: ScheduledTerm[]
  graduationTermId: string
  busiestTermId: string
  maximumCredits: number
  workFit: 'comfortable' | 'tight'
  remainsHalfTime: boolean
  estimatedAdditionalCost: number
  additionalTerms: number
  issues: ScheduleIssue[]
}

export type AffectedCourse = {
  courseId: string
  depth: number
  dependencyPath: string[]
  baselineTermId: string
  fasterTermId: string
  steadierTermId: string
}

export type ScenarioResult = {
  disruption: CourseFailureDisruption
  priority: Priority
  failedCourseId: string
  repeatTermId: string
  affectedCourses: AffectedCourse[]
  alternatives: AlternativePath[]
  recommendedPathId: AlternativePath['id']
  assumptionIds: string[]
  sourceIds: string[]
}
