import * as z from "zod"
import { UserRole } from "@prisma/client"
import { CompleteRepositoryAccess, RelatedRepositoryAccessModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  repositoryAccesses: CompleteRepositoryAccess[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  repositoryAccesses: RelatedRepositoryAccessModel.array(),
}))
