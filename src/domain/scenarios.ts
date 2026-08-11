import { z } from 'zod'

import { mayaCourseFailure, mayaDataset } from './fixtures/maya.ts'
import { PrioritySchema } from './model.ts'

export const ScenarioIdSchema = z.literal('maya-cs201-failure')
export const RecoveryPathIdSchema = z.enum(['faster-finish', 'steadier-load'])

export const ScenarioSessionSchema = z
  .object({
    version: z.literal(1),
    scenarioId: ScenarioIdSchema,
    priority: PrioritySchema,
    selectedPathId: RecoveryPathIdSchema,
  })
  .strict()

export type ScenarioId = z.infer<typeof ScenarioIdSchema>
export type ScenarioSession = z.infer<typeof ScenarioSessionSchema>

const scenarioRegistry = {
  'maya-cs201-failure': {
    dataset: mayaDataset,
    disruption: mayaCourseFailure,
  },
} as const

export function resolveScenario(scenarioId: ScenarioId) {
  return scenarioRegistry[scenarioId]
}
