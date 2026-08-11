import { describe, expect, it } from 'vitest'

import { mayaCourseFailure, mayaDataset } from '../fixtures/maya'
import { tracePrerequisiteCascade } from './cascade'

describe('tracePrerequisiteCascade', () => {
  it('finds direct and indirect consequences of the failed prerequisite', () => {
    const cascade = tracePrerequisiteCascade(mayaDataset, mayaCourseFailure)

    expect(cascade).toEqual([
      {
        courseId: 'CS301',
        depth: 1,
        dependencyPath: ['CS201', 'CS301'],
        baselineTermId: 'fall-2025',
      },
      {
        courseId: 'CS330',
        depth: 1,
        dependencyPath: ['CS201', 'CS330'],
        baselineTermId: 'fall-2025',
      },
      {
        courseId: 'CS450',
        depth: 2,
        dependencyPath: ['CS201', 'CS301', 'CS450'],
        baselineTermId: 'fall-2026',
      },
      {
        courseId: 'CS451',
        depth: 2,
        dependencyPath: ['CS201', 'CS330', 'CS451'],
        baselineTermId: 'fall-2026',
      },
      {
        courseId: 'CS495',
        depth: 2,
        dependencyPath: ['CS201', 'CS301', 'CS495'],
        baselineTermId: 'fall-2026',
      },
    ])
  })
})
