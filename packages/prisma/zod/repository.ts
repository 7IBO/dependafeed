import * as z from "zod"
import { CompleteRepositoryAccess, RelatedRepositoryAccessModel, CompleteDependencyFile, RelatedDependencyFileModel } from "./index"

export const RepositoryModel = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  ownerLogin: z.string(),
  isMonorepo: z.boolean(),
  isIndexed: z.boolean(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRepository extends z.infer<typeof RepositoryModel> {
  userAccesses: CompleteRepositoryAccess[]
  dependencyFiles: CompleteDependencyFile[]
}

/**
 * RelatedRepositoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRepositoryModel: z.ZodSchema<CompleteRepository> = z.lazy(() => RepositoryModel.extend({
  userAccesses: RelatedRepositoryAccessModel.array(),
  dependencyFiles: RelatedDependencyFileModel.array(),
}))
