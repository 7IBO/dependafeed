import * as z from "zod"
import { CompletePackage, RelatedPackageModel, CompleteDependency, RelatedDependencyModel } from "./index"

export const PackageVersionModel = z.object({
  id: z.string(),
  name: z.string(),
  details: z.string(),
  packageId: z.string(),
  isLatestVersion: z.boolean(),
  githubCommitSha: z.string().nullish(),
  releaseDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePackageVersion extends z.infer<typeof PackageVersionModel> {
  package: CompletePackage
  dependencies: CompleteDependency[]
}

/**
 * RelatedPackageVersionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPackageVersionModel: z.ZodSchema<CompletePackageVersion> = z.lazy(() => PackageVersionModel.extend({
  package: RelatedPackageModel,
  dependencies: RelatedDependencyModel.array(),
}))
