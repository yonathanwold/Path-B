import { tracePrerequisiteCascade } from './cascade'
import { generateAlternativePath, pathStrategies } from './schedule'
import {
  CourseFailureDisruptionSchema,
  PrioritySchema,
  type AlternativePath,
  type CourseFailureDisruption,
  type PathBDataset,
  type Priority,
  type ScenarioResult,
} from '../model'

const recommendationByPriority: Record<
  Priority,
  {
    pathId: AlternativePath['id']
    reason: string
    advisorQuestion: string
  }
> = {
  'graduate-on-time': {
    pathId: 'faster-finish',
    reason:
      'This path keeps Maya’s May 2027 finish, but it creates one 15-credit term while she is working.',
    advisorQuestion:
      'If I repeat CS 201 next spring, can CS 301 and CS 330 both count toward a May 2027 graduation plan?',
  },
  'protect-work-schedule': {
    pathId: 'steadier-load',
    reason:
      'This path keeps every term at 10 credits or fewer, but graduation moves to December 2027.',
    advisorQuestion:
      'Could CS 201 be repeated next spring while I take CS 240 and STAT 250 without dropping below half-time?',
  },
  'limit-extra-cost': {
    pathId: 'faster-finish',
    reason:
      'Both paths include the repeated course, but finishing by May avoids the synthetic added-term fee.',
    advisorQuestion:
      'Which repeat-course charges and aid rules should I confirm before choosing the May 2027 path?',
  },
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

  const alternatives = pathStrategies.map((strategy) =>
    generateAlternativePath(dataset, disruption, strategy),
  )
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

  const recommendation = recommendationByPriority[priority]

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
    recommendedPathId: recommendation.pathId,
    recommendationReason: recommendation.reason,
    advisorQuestion: recommendation.advisorQuestion,
    assumptionIds: dataset.assumptions.map((assumption) => assumption.id),
    sourceIds: dataset.sources.map((source) => source.id),
  }
}
