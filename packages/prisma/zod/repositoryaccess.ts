import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteRepository, RelatedRepositoryModel } from "./index"

export const RepositoryAccessModel = z.object({
  id: z.string(),
  userId: z.string(),
  repositoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRepositoryAccess extends z.infer<typeof RepositoryAccessModel> {
  user: CompleteUser
  repository: CompleteRepository
}

/**
 * RelatedRepositoryAccessModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRepositoryAccessModel: z.ZodSchema<CompleteRepositoryAccess> = z.lazy(() => RepositoryAccessModel.extend({
  user: RelatedUserModel,
  repository: RelatedRepositoryModel,
}))
