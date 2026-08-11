import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

import {
  ExplanationContentSchema,
  ExplanationRequestSchema,
  type ExplanationApiResponse,
  type ExplanationContent,
  type ExplanationRequest,
} from '../src/ai/contracts.ts'
import {
  analyzeCourseFailure,
  mayaCourseFailure,
  mayaDataset,
  type AlternativePath,
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
    scenarioId: z.literal('maya-cs201-failure'),
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

function courseCode(datasetCourseId: string) {
  return (
    mayaDataset.courses.find((course) => course.id === datasetCourseId)?.code ??
    datasetCourseId
  )
}

function factPath(path: AlternativePath) {
  const presented = presentPath(mayaDataset, path)

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
  const comparisonPath =
    scenario.alternatives.find((path) => path.id !== selectedPath.id) ??
    selectedPath
  const failedCourse = mayaDataset.courses.find(
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
    syntheticInstitution: mayaDataset.institutionLabel,
    fixtureWarning:
      'All academic, eligibility, and cost values are synthetic planning facts that the student must verify with the real institution.',
    student: {
      firstName: mayaDataset.student.name,
      workHoursPerWeek: mayaDataset.student.workHoursPerWeek,
      minimumCreditsPerTerm: mayaDataset.student.minimumCreditsPerTerm,
      selectedPriority: priorityLabel,
    },
    disruption: {
      failedCourseCode: failedCourse?.code ?? scenario.failedCourseId,
      failedCourseTitle: failedCourse?.title ?? scenario.failedCourseId,
      failedTerm: termLabel(mayaDataset, scenario.disruption.termId),
      nextRepeatTerm: termLabel(mayaDataset, scenario.repeatTermId),
      directBlockedCourseCodes: directBlocked.map((affected) =>
        courseCode(affected.courseId),
      ),
      affectedCourseCodes: scenario.affectedCourses.map((affected) =>
        courseCode(affected.courseId),
      ),
      directBlockedCount: directBlocked.length,
      downstreamShiftCount: scenario.affectedCourses.length,
    },
    selectedPath: factPath(selectedPath),
    comparisonPath: factPath(comparisonPath),
    repeatTermCompanionCourseCodes: (repeatTerm?.courseIds ?? [])
      .filter((courseId) => courseId !== scenario.failedCourseId)
      .map(courseCode),
    sourceIds: scenario.sourceIds,
    assumptionIds: scenario.assumptionIds,
  })
}

function outputText(explanation: ExplanationContent) {
  return [
    explanation.summary,
    explanation.tradeoff,
    ...explanation.nextSteps,
    explanation.advisorQuestion,
  ].join(' ')
}

function normalizedCourseCode(value: string) {
  return value.replace(/\s+/g, '').toUpperCase()
}

function matchesEvery<T>(values: T[], allowed: Set<T>) {
  return values.every((value) => allowed.has(value))
}

export function isGroundedExplanation(
  explanation: ExplanationContent,
  facts: ClaudeFactPacket,
) {
  const text = outputText(explanation)
  const courseClaims = [...text.matchAll(/\b[A-Z]{2,5}\s?\d{3}\b/g)].map(
    (match) => normalizedCourseCode(match[0]),
  )
  const allowedCourses = new Set(
    [
      facts.disruption.failedCourseCode,
      ...facts.disruption.affectedCourseCodes,
      ...facts.repeatTermCompanionCourseCodes,
    ].map(normalizedCourseCode),
  )

  if (!matchesEvery(courseClaims, allowedCourses)) return false

  const factText = JSON.stringify(facts)
  const years = [...text.matchAll(/\b20\d{2}\b/g)].map((match) => match[0])
  if (!years.every((year) => factText.includes(year))) return false

  const moneyClaims = [...text.matchAll(/\$[\d,]+/g)].map((match) => match[0])
  const allowedMoney = new Set([
    facts.selectedPath.illustrativeAddedCost,
    facts.comparisonPath.illustrativeAddedCost,
  ])
  if (!matchesEvery(moneyClaims, allowedMoney)) return false

  const allowedUnits: Record<string, Set<number>> = {
    credit: new Set([
      facts.student.minimumCreditsPerTerm,
      facts.selectedPath.maximumCredits,
      facts.comparisonPath.maximumCredits,
    ]),
    hour: new Set([facts.student.workHoursPerWeek]),
    course: new Set([
      facts.disruption.directBlockedCount,
      facts.disruption.downstreamShiftCount,
    ]),
    term: new Set([
      facts.selectedPath.addedTerms,
      facts.comparisonPath.addedTerms,
    ]),
  }

  for (const match of text.matchAll(
    /\b(\d{1,3})[ -](credits?|hours?|courses?|terms?|semesters?)\b/gi,
  )) {
    const amount = Number(match[1])
    const rawUnit = match[2]?.toLowerCase() ?? ''
    const unit = rawUnit.startsWith('credit')
      ? 'credit'
      : rawUnit.startsWith('hour')
        ? 'hour'
        : rawUnit.startsWith('course')
          ? 'course'
          : 'term'
    if (!allowedUnits[unit]?.has(amount)) return false
  }

  const requiredQuestionFacts = [
    normalizedCourseCode(facts.disruption.failedCourseCode),
    facts.disruption.nextRepeatTerm.toLowerCase(),
  ]
  const normalizedQuestion = normalizedCourseCode(
    explanation.advisorQuestion,
  ).toLowerCase()

  return requiredQuestionFacts.every((fact) =>
    normalizedQuestion.includes(normalizedCourseCode(fact).toLowerCase()),
  )
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
    max_tokens: 700,
    system: [
      'You are the personalized explanation layer for Path B, a college-plan resilience tool.',
      'The JSON fact packet is the complete source of truth. Never add, modify, or infer a course requirement, prerequisite, offering, date, credit load, cost, aid rule, or eligibility result.',
      'Explain the selected path versus the comparison path in calm student-facing language. Make the tradeoff explicit, give 2 or 3 practical verification steps, and end with one useful advisor question.',
      'Treat every value as synthetic demo data. Use projected or modeled language, never promise an outcome. Return plain text fields with no markdown or links.',
    ].join(' '),
    messages: [
      {
        role: 'user',
        content: JSON.stringify(facts),
      },
    ],
    output_config: {
      effort: 'low',
      format: zodOutputFormat(ExplanationContentSchema),
    },
  })

  if (!message.parsed_output) {
    throw new Error('Claude returned no structured explanation.')
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
  const scenario = analyzeCourseFailure(
    mayaDataset,
    mayaCourseFailure,
    request.priority,
  )
  const selectedPath = scenario.alternatives.find(
    (path) => path.id === request.selectedPathId,
  )
  if (!selectedPath) throw new InvalidExplanationRequestError()

  const fallback = ExplanationContentSchema.parse(
    buildDeterministicExplanation(mayaDataset, scenario, selectedPath),
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
    const parsed = ExplanationContentSchema.safeParse(generated)

    if (!parsed.success || !isGroundedExplanation(parsed.data, facts)) {
      return deterministicResponse(fallback, 'invalid-ai-output')
    }

    return {
      mode: 'claude',
      reason: 'ai-complete',
      explanation: parsed.data,
    }
  } catch {
    return deterministicResponse(fallback, 'ai-unavailable')
  }
}
