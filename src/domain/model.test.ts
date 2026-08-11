import { describe, expect, it } from 'vitest'

import { mayaDataset } from './fixtures/maya'
import { PathBDatasetSchema } from './model'

describe('PathBDatasetSchema', () => {
  it('accepts the fully linked Maya fixture', () => {
    expect(PathBDatasetSchema.safeParse(mayaDataset).success).toBe(true)
  })

  it('rejects a catalog with a dangling prerequisite', () => {
    const invalidDataset = structuredClone(mayaDataset)
    invalidDataset.courses.find((course) => course.id === 'CS301')!.prerequisites = [
      'CS999',
    ]

    const result = PathBDatasetSchema.safeParse(invalidDataset)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Unknown prerequisite: CS999',
          }),
        ]),
      )
    }
  })

  it('rejects duplicate term order and duplicate baseline courses', () => {
    const invalidDataset = structuredClone(mayaDataset)
    invalidDataset.terms[1]!.order = invalidDataset.terms[0]!.order
    invalidDataset.baselinePlan.entries.push({
      courseId: 'CS201',
      termId: 'spring-2026',
      status: 'planned',
    })

    const result = PathBDatasetSchema.safeParse(invalidDataset)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'Duplicate term order: 0',
          'Duplicate baseline course: CS201',
        ]),
      )
    }
  })

  it('rejects a prerequisite cycle', () => {
    const invalidDataset = structuredClone(mayaDataset)
    invalidDataset.courses.find((course) => course.id === 'CS150')!.prerequisites = [
      'CS201',
    ]

    const result = PathBDatasetSchema.safeParse(invalidDataset)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.startsWith('Prerequisite cycle:'),
        ),
      ).toBe(true)
    }
  })
})
