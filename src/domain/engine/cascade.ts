import type {
  CourseFailureDisruption,
  PathBDataset,
} from '../model.ts'

export type CascadeNode = {
  courseId: string
  depth: number
  dependencyPath: string[]
  baselineTermId: string
}

export function tracePrerequisiteCascade(
  dataset: PathBDataset,
  disruption: CourseFailureDisruption,
): CascadeNode[] {
  const baselineTerms = new Map(
    dataset.baselinePlan.entries.map((entry) => [entry.courseId, entry.termId]),
  )
  const dependentCourses = new Map<string, string[]>()

  dataset.courses.forEach((course) => {
    course.prerequisites.forEach((prerequisite) => {
      const dependents = dependentCourses.get(prerequisite) ?? []
      dependents.push(course.id)
      dependentCourses.set(prerequisite, dependents)
    })
  })

  const visited = new Set([disruption.courseId])
  const queue: { courseId: string; path: string[] }[] = [
    { courseId: disruption.courseId, path: [disruption.courseId] },
  ]
  const cascade: CascadeNode[] = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break

    const nextCourses = (dependentCourses.get(current.courseId) ?? []).toSorted()
    nextCourses.forEach((courseId) => {
      if (visited.has(courseId)) return

      visited.add(courseId)
      const dependencyPath = [...current.path, courseId]
      const baselineTermId = baselineTerms.get(courseId)

      if (baselineTermId) {
        cascade.push({
          courseId,
          depth: dependencyPath.length - 1,
          dependencyPath,
          baselineTermId,
        })
      }

      queue.push({ courseId, path: dependencyPath })
    })
  }

  const termOrder = new Map(dataset.terms.map((term) => [term.id, term.order]))
  const baselineOrder = new Map(
    dataset.baselinePlan.entries.map((entry, index) => [entry.courseId, index]),
  )

  return cascade.toSorted((left, right) => {
    const termDifference =
      (termOrder.get(left.baselineTermId) ?? 0) -
      (termOrder.get(right.baselineTermId) ?? 0)
    return (
      termDifference ||
      left.depth - right.depth ||
      (baselineOrder.get(left.courseId) ?? 0) -
        (baselineOrder.get(right.courseId) ?? 0)
    )
  })
}
