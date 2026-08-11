export { analyzeCourseFailure } from './engine/analyze.ts'
export { tracePrerequisiteCascade } from './engine/cascade.ts'
export {
  generateAlternativePath,
  pathStrategies,
  validateSchedule,
} from './engine/schedule.ts'
export { mayaCourseFailure, mayaDataset } from './fixtures/maya.ts'
export {
  RecoveryPathIdSchema,
  resolveScenario,
  ScenarioIdSchema,
  ScenarioSessionSchema,
} from './scenarios.ts'
export {
  CourseFailureDisruptionSchema,
  PathBDatasetSchema,
  PrioritySchema,
} from './model.ts'
export type {
  AffectedCourse,
  AlternativePath,
  Course,
  CourseFailureDisruption,
  PathBDataset,
  Priority,
  ScenarioResult,
  ScheduledTerm,
} from './model.ts'
export type { ScenarioId, ScenarioSession } from './scenarios.ts'
