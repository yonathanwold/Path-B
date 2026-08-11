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
})
