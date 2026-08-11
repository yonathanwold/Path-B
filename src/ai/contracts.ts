import { z } from 'zod'

import { PrioritySchema } from '../domain/index.ts'

export const ScenarioIdSchema = z.literal('maya-cs201-failure')
export const RecoveryPathIdSchema = z.enum(['faster-finish', 'steadier-load'])

export const ExplanationRequestSchema = z
  .object({
    version: z.literal(1),
    scenarioId: ScenarioIdSchema,
    priority: PrioritySchema,
    selectedPathId: RecoveryPathIdSchema,
  })
  .strict()

export const ClaudeNarrativePlanSchema = z
  .object({
    summaryFocus: z.enum([
      'recovery-window',
      'dependency-cascade',
      'protected-priority',
    ]),
    comparisonFocus: z.enum([
      'graduation-timing',
      'workload-fit',
      'added-cost',
    ]),
    nextStepIds: z
      .array(
        z.enum([
          'repeat-registration',
          'aid-threshold',
          'compare-paths',
          'workload-check',
          'cost-review',
        ]),
      )
      .min(2)
      .max(3)
      .refine((values) => new Set(values).size === values.length, {
        message: 'Next-step IDs must be unique.',
      }),
    advisorQuestionFocus: z.enum([
      'graduation',
      'workload',
      'aid-and-cost',
    ]),
  })
  .strict()

const StudentFacingSentenceSchema = z
  .string()
  .trim()
  .min(12)
  .max(320)
  .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), {
    message: 'HTML is not allowed.',
  })
  .refine((value) => !/https?:\/\//i.test(value), {
    message: 'Links are not allowed.',
  })

export const ExplanationContentSchema = z
  .object({
    summary: StudentFacingSentenceSchema.max(260),
    tradeoff: StudentFacingSentenceSchema.max(300),
    nextSteps: z.array(StudentFacingSentenceSchema.max(180)).min(2).max(3),
    advisorQuestion: StudentFacingSentenceSchema.max(280).refine(
      (value) => value.endsWith('?'),
      { message: 'The advisor question must end with a question mark.' },
    ),
  })
  .strict()

export const ExplanationResponseReasonSchema = z.enum([
  'ai-complete',
  'missing-api-key',
  'ai-unavailable',
  'invalid-ai-output',
])

export const ExplanationApiResponseSchema = z
  .object({
    mode: z.enum(['claude', 'deterministic']),
    reason: ExplanationResponseReasonSchema,
    explanation: ExplanationContentSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const validPair =
      (value.mode === 'claude' && value.reason === 'ai-complete') ||
      (value.mode === 'deterministic' && value.reason !== 'ai-complete')

    if (!validPair) {
      context.addIssue({
        code: 'custom',
        message: 'Explanation mode and reason do not match.',
      })
    }
  })

export type ExplanationRequest = z.infer<typeof ExplanationRequestSchema>
export type ClaudeNarrativePlan = z.infer<typeof ClaudeNarrativePlanSchema>
export type ExplanationContent = z.infer<typeof ExplanationContentSchema>
export type ExplanationApiResponse = z.infer<
  typeof ExplanationApiResponseSchema
>
