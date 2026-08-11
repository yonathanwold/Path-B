import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

import {
  ClaudeNarrativePlanSchema,
  ExplanationContentSchema,
  ExplanationRequestSchema,
  type ExplanationApiResponse,
  type ClaudeNarrativePlan,
  type ExplanationContent,
  type ExplanationRequest,
} from '../src/ai/contracts.ts'
import {
  analyzeCourseFailure,
  resolveScenario,
  ScenarioIdSchema,
  type AlternativePath,
  type PathBDataset,
  type ScenarioResult,
} from '../src/domain/index.ts'
import {
  buildDeterministicExplanation,
  presentPath,
  priorityOptions,
  termLabel,
} from '../src/presentation/scenario.ts'

const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-5'

const FactPathSchema = z
  .object({
    id: z.enum(['faster-finish', 'steadier-load']),
    title: z.string(),
    projectedGraduation: z.string(),
    busiestTerm: z.string(),
    maximumCredits: z.number().int().positive(),
    workFit: z.enum(['comfortable', 'tight']),
    remainsHalfTime: z.boolean(),
    illustrativeAddedCost: z.string(),
    addedTerms: z.number().int().nonnegative(),
    sacrifice: z.string(),
    protects: z.array(z.string()).min(1),
  })
  .strict()

export const ClaudeFactPacketSchema = z
  .object({
    scenarioId: ScenarioIdSchema,
    syntheticInstitution: z.string(),
    fixtureWarning: z.string(),
    student: z
      .object({
        firstName: z.string(),
        workHoursPerWeek: z.number().int().nonnegative(),
        minimumCreditsPerTerm: z.number().int().positive(),
        selectedPriority: z.string(),
      })
      .strict(),
    disruption: z
      .object({
        failedCourseCode: z.string(),
        failedCourseTitle: z.string(),
        failedTerm: z.string(),
        nextRepeatTerm: z.string(),
        directBlockedCourseCodes: z.array(z.string()),
        affectedCourseCodes: z.array(z.string()),
        directBlockedCount: z.number().int().nonnegative(),
        downstreamShiftCount: z.number().int().nonnegative(),
      })
      .strict(),
    selectedPath: FactPathSchema,
    comparisonPath: FactPathSchema,
    repeatTermCompanionCourseCodes: z.array(z.string()),
    sourceIds: z.array(z.string()).min(1),
    assumptionIds: z.array(z.string()).min(1),
  })
  .strict()

export type ClaudeFactPacket = z.infer<typeof ClaudeFactPacketSchema>

type ClaudeGenerationConfig = {
  apiKey: string
  model: string
}

export type ClaudeGenerator = (
  facts: ClaudeFactPacket,
  config: ClaudeGenerationConfig,
) => Promise<unknown>

type ExplanationServiceOptions = {
  apiKey?: string
  model?: string
  generate?: ClaudeGenerator
}

export class InvalidExplanationRequestError extends Error {
  constructor() {
    super('Invalid explanation request.')
    this.name = 'InvalidExplanationRequestError'
  }
}

function courseCode(dataset: PathBDataset, datasetCourseId: string) {
  return (
    dataset.courses.find((course) => course.id === datasetCourseId)?.code ??
    datasetCourseId
  )
}

function factPath(dataset: PathBDataset, path: AlternativePath) {
  const presented = presentPath(dataset, path)

  return FactPathSchema.parse({
    id: path.id,
    title: path.title,
    projectedGraduation: presented.graduation,
    busiestTerm: presented.busiestTerm,
    maximumCredits: path.maximumCredits,
    workFit: path.workFit,
    remainsHalfTime: path.remainsHalfTime,
    illustrativeAddedCost: presented.additionalCost,
    addedTerms: path.additionalTerms,
    sacrifice: presented.sacrifice,
    protects: presented.protects,
  })
}

export function buildClaudeFactPacket(
  request: ExplanationRequest,
  scenario: ScenarioResult,
  selectedPath: AlternativePath,
): ClaudeFactPacket {
  const { dataset } = resolveScenario(request.scenarioId)
  const comparisonPath =
    scenario.alternatives.find((path) => path.id !== selectedPath.id) ??
    selectedPath
  const failedCourse = dataset.courses.find(
    (course) => course.id === scenario.failedCourseId,
  )
  const directBlocked = scenario.affectedCourses.filter(
    (affected) => affected.depth === 1,
  )
  const repeatTerm = selectedPath.schedule.find((term) =>
    term.courseIds.includes(scenario.failedCourseId),
  )
  const priorityLabel =
    priorityOptions.find((option) => option.id === request.priority)?.label ??
    request.priority

  return ClaudeFactPacketSchema.parse({
    scenarioId: request.scenarioId,
    syntheticInstitution: dataset.institutionLabel,
    fixtureWarning:
      'All academic, eligibility, and cost values are synthetic planning facts that the student must verify with the real institution.',
    student: {
      firstName: dataset.student.name,
      workHoursPerWeek: dataset.student.workHoursPerWeek,
      minimumCreditsPerTerm: dataset.student.minimumCreditsPerTerm,
      selectedPriority: priorityLabel,
    },
    disruption: {
      failedCourseCode: failedCourse?.code ?? scenario.failedCourseId,
      failedCourseTitle: failedCourse?.title ?? scenario.failedCourseId,
      failedTerm: termLabel(dataset, scenario.disruption.termId),
      nextRepeatTerm: termLabel(dataset, scenario.repeatTermId),
      directBlockedCourseCodes: directBlocked.map((affected) =>
        courseCode(dataset, affected.courseId),
      ),
      affectedCourseCodes: scenario.affectedCourses.map((affected) =>
        courseCode(dataset, affected.courseId),
      ),
      directBlockedCount: directBlocked.length,
      downstreamShiftCount: scenario.affectedCourses.length,
    },
    selectedPath: factPath(dataset, selectedPath),
    comparisonPath: factPath(dataset, comparisonPath),
    repeatTermCompanionCourseCodes: (repeatTerm?.courseIds ?? [])
      .filter((courseId) => courseId !== scenario.failedCourseId)
      .map((courseId) => courseCode(dataset, courseId)),
    sourceIds: scenario.sourceIds,
    assumptionIds: scenario.assumptionIds,
  })
}

export function compileClaudeExplanation(
  facts: ClaudeFactPacket,
  plan: ClaudeNarrativePlan,
): ExplanationContent {
  const summaryByFocus: Record<ClaudeNarrativePlan['summaryFocus'], string> = {
    'recovery-window': `${facts.student.firstName} can next repeat ${facts.disruption.failedCourseCode} in ${facts.disruption.nextRepeatTerm}. ${facts.selectedPath.title} is projected to reach ${facts.selectedPath.projectedGraduation}.`,
    'dependency-cascade': `${facts.disruption.directBlockedCount} courses are blocked directly and ${facts.disruption.downstreamShiftCount} planned courses move downstream. ${facts.selectedPath.title} is projected to reach ${facts.selectedPath.projectedGraduation}.`,
    'protected-priority': `${facts.selectedPath.title} protects ${facts.selectedPath.protects.join(' and ')} after the ${facts.disruption.failedCourseCode} disruption.`,
  }
  const comparisonByFocus: Record<
    ClaudeNarrativePlan['comparisonFocus'],
    string
  > = {
    'graduation-timing': `${facts.selectedPath.title} is projected for ${facts.selectedPath.projectedGraduation}; ${facts.comparisonPath.title} is projected for ${facts.comparisonPath.projectedGraduation}.`,
    'workload-fit': `${facts.selectedPath.title} peaks at ${facts.selectedPath.maximumCredits} credits with a ${facts.selectedPath.workFit} work fit; ${facts.comparisonPath.title} peaks at ${facts.comparisonPath.maximumCredits} credits with a ${facts.comparisonPath.workFit} work fit.`,
    'added-cost': `${facts.selectedPath.title} has a modeled added cost of ${facts.selectedPath.illustrativeAddedCost}; ${facts.comparisonPath.title} has a modeled added cost of ${facts.comparisonPath.illustrativeAddedCost}.`,
  }
  const nextStepById: Record<
    ClaudeNarrativePlan['nextStepIds'][number],
    string
  > = {
    'repeat-registration': `Confirm the ${facts.disruption.nextRepeatTerm} ${facts.disruption.failedCourseCode} repeat offering and registration deadline.`,
    'aid-threshold': `Ask financial aid to verify the ${facts.student.minimumCreditsPerTerm}-credit half-time assumption before changing enrollment.`,
    'compare-paths': `Bring ${facts.selectedPath.title} and ${facts.comparisonPath.title} to advising before changing the registered plan.`,
    'workload-check': `Ask whether the ${facts.selectedPath.maximumCredits}-credit peak is realistic alongside ${facts.student.workHoursPerWeek} weekly work hours.`,
    'cost-review': `Confirm what the illustrative ${facts.selectedPath.illustrativeAddedCost} added cost would actually be after aid and institution-specific pricing.`,
  }
  const advisorQuestionByFocus: Record<
    ClaudeNarrativePlan['advisorQuestionFocus'],
    string
  > = {
    graduation: `Can we confirm I can repeat ${facts.disruption.failedCourseCode} in ${facts.disruption.nextRepeatTerm} and that ${facts.selectedPath.title} is still projected to reach ${facts.selectedPath.projectedGraduation}?`,
    workload: `Can we confirm I can repeat ${facts.disruption.failedCourseCode} in ${facts.disruption.nextRepeatTerm} and whether the ${facts.selectedPath.maximumCredits}-credit peak is workable alongside ${facts.student.workHoursPerWeek} weekly work hours?`,
    'aid-and-cost': `Can financial aid confirm that repeating ${facts.disruption.failedCourseCode} in ${facts.disruption.nextRepeatTerm} keeps me at or above ${facts.student.minimumCreditsPerTerm} credits and what the modeled ${facts.selectedPath.illustrativeAddedCost} added cost would mean for my aid?`,
  }

  return ExplanationContentSchema.parse({
    summary: summaryByFocus[plan.summaryFocus],
    tradeoff: comparisonByFocus[plan.comparisonFocus],
    nextSteps: plan.nextStepIds.map((id) => nextStepById[id]),
    advisorQuestion: advisorQuestionByFocus[plan.advisorQuestionFocus],
  })
}

export async function generateClaudeExplanation(
  facts: ClaudeFactPacket,
  config: ClaudeGenerationConfig,
) {
  const client = new Anthropic({
    apiKey: config.apiKey,
    maxRetries: 0,
    timeout: 7_000,
  })
  const message = await client.messages.parse({
    model: config.model,
    max_tokens: 220,
    system: [
      'You are the constrained personalization layer for Path B, a college-plan resilience tool.',
      'The JSON packet is the complete source of truth. Select only the allowed focus and action IDs in the response schema.',
      'Choose the emphasis, comparison lens, next-step order, and advisor-question focus that best fit the selected priority and path.',
      'Do not write student-facing prose or introduce any academic, cost, aid, eligibility, or timing claim. The server will render the selected IDs from verified facts.',
    ].join(' '),
    messages: [
      {
        role: 'user',
        content: JSON.stringify(facts),
      },
    ],
    output_config: {
      effort: 'low',
      format: zodOutputFormat(ClaudeNarrativePlanSchema),
    },
  })

  if (!message.parsed_output) {
    throw new Error('Claude returned no structured narrative plan.')
  }

  return message.parsed_output
}

function deterministicResponse(
  explanation: ExplanationContent,
  reason: Exclude<ExplanationApiResponse['reason'], 'ai-complete'>,
): ExplanationApiResponse {
  return {
    mode: 'deterministic',
    reason,
    explanation,
  }
}

export async function createExplanation(
  input: unknown,
  options: ExplanationServiceOptions = {},
): Promise<ExplanationApiResponse> {
  const requestResult = ExplanationRequestSchema.safeParse(input)
  if (!requestResult.success) throw new InvalidExplanationRequestError()

  const request = requestResult.data
  const { dataset, disruption } = resolveScenario(request.scenarioId)
  const scenario = analyzeCourseFailure(
    dataset,
    disruption,
    request.priority,
  )
  const selectedPath = scenario.alternatives.find(
    (path) => path.id === request.selectedPathId,
  )
  if (!selectedPath) throw new InvalidExplanationRequestError()

  const fallback = ExplanationContentSchema.parse(
    buildDeterministicExplanation(dataset, scenario, selectedPath),
  )
  const apiKey = options.apiKey?.trim()

  if (!apiKey) return deterministicResponse(fallback, 'missing-api-key')

  const facts = buildClaudeFactPacket(request, scenario, selectedPath)

  try {
    const generated = await (options.generate ?? generateClaudeExplanation)(
      facts,
      {
        apiKey,
        model: options.model?.trim() || DEFAULT_CLAUDE_MODEL,
      },
    )
    const parsed = ClaudeNarrativePlanSchema.safeParse(generated)

    if (!parsed.success) {
      return deterministicResponse(fallback, 'invalid-ai-output')
    }

    return {
      mode: 'claude',
      reason: 'ai-complete',
      explanation: compileClaudeExplanation(facts, parsed.data),
    }
  } catch {
    return deterministicResponse(fallback, 'ai-unavailable')
  }
}
