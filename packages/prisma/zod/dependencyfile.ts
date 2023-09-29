import * as z from "zod"
import { CompleteRepository, RelatedRepositoryModel, CompleteDependency, RelatedDependencyModel } from "./index"

export const DependencyFileModel = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string().nullish(),
  repositoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteDependencyFile extends z.infer<typeof DependencyFileModel> {
  repository: CompleteRepository
  dependencies: CompleteDependency[]
}

/**
 * RelatedDependencyFileModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDependencyFileModel: z.ZodSchema<CompleteDependencyFile> = z.lazy(() => DependencyFileModel.extend({
  repository: RelatedRepositoryModel,
  dependencies: RelatedDependencyModel.array(),
}))
