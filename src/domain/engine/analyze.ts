import { tracePrerequisiteCascade } from './cascade.ts'
import { generateAlternativePath, pathStrategies } from './schedule.ts'
import {
  CourseFailureDisruptionSchema,
  PrioritySchema,
  type AlternativePath,
  type CourseFailureDisruption,
  type PathBDataset,
  type Priority,
  type ScenarioResult,
} from '../model.ts'

const recommendationByPriority: Record<Priority, AlternativePath['id']> = {
  'graduate-on-time': 'faster-finish',
  'protect-work-schedule': 'steadier-load',
  'limit-extra-cost': 'faster-finish',
}

function placementByCourse(path: AlternativePath) {
  const placements = new Map<string, string>()
  path.schedule.forEach((term) => {
    term.courseIds.forEach((courseId) => placements.set(courseId, term.termId))
  })
  return placements
}

export function analyzeCourseFailure(
  dataset: PathBDataset,
  disruptionInput: CourseFailureDisruption,
  priorityInput: Priority,
): ScenarioResult {
  const disruption = CourseFailureDisruptionSchema.parse(disruptionInput)
  const priority = PrioritySchema.parse(priorityInput)
  const failedCourse = dataset.courses.find(
    (course) => course.id === disruption.courseId,
  )
  const disruptionEntry = dataset.baselinePlan.entries.find(
    (entry) =>
      entry.courseId === disruption.courseId && entry.termId === disruption.termId,
  )

  if (!failedCourse || !disruptionEntry) {
    throw new Error('The disruption must target a course in the baseline plan.')
  }
  if (disruptionEntry.status !== 'in-progress') {
    throw new Error('A course-failure disruption must target an in-progress course.')
  }

  const alternatives = pathStrategies.map((strategy) =>
    generateAlternativePath(dataset, disruption, strategy),
  )

  const invalidPath = alternatives.find((path) => path.issues.length > 0)
  if (invalidPath) {
    throw new Error(
      `${invalidPath.title} violates the current planning assumptions: ${invalidPath.issues
        .map((issue) => issue.message)
        .join(' ')}`,
    )
  }
  const fasterPath = alternatives.find((path) => path.id === 'faster-finish')
  const steadierPath = alternatives.find((path) => path.id === 'steadier-load')

  if (!fasterPath || !steadierPath) {
    throw new Error('Both comparison paths are required.')
  }

  const fasterPlacements = placementByCourse(fasterPath)
  const steadierPlacements = placementByCourse(steadierPath)
  const repeatTermId = fasterPlacements.get(disruption.courseId)

  if (!repeatTermId) {
    throw new Error('The failed course was not placed in the recovery schedule.')
  }

  return {
    disruption,
    priority,
    failedCourseId: failedCourse.id,
    repeatTermId,
    affectedCourses: tracePrerequisiteCascade(dataset, disruption).map(
      (affected) => ({
        ...affected,
        fasterTermId:
          fasterPlacements.get(affected.courseId) ?? affected.baselineTermId,
        steadierTermId:
          steadierPlacements.get(affected.courseId) ?? affected.baselineTermId,
      }),
    ),
    alternatives,
    recommendedPathId: recommendationByPriority[priority],
    assumptionIds: dataset.assumptions.map((assumption) => assumption.id),
    sourceIds: dataset.sources.map((source) => source.id),
  }
}
