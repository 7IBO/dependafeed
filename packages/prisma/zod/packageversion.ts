import * as z from "zod"
import { CompletePackage, RelatedPackageModel, CompleteDependency, RelatedDependencyModel } from "./index"

export const PackageVersionModel = z.object({
  id: z.string(),
  name: z.string(),
  details: z.string(),
  latestCheckDate: z.date().nullish(),
  latestUpdateDate: z.date().nullish(),
  packageId: z.string(),
  isLatestVersion: z.boolean().nullish(),
  githubCommitSha: z.string().nullish(),
  releaseDate: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePackageVersion extends z.infer<typeof PackageVersionModel> {
  package: CompletePackage
  packageDependencies: CompleteDependency[]
}

/**
 * RelatedPackageVersionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPackageVersionModel: z.ZodSchema<CompletePackageVersion> = z.lazy(() => PackageVersionModel.extend({
  package: RelatedPackageModel,
  packageDependencies: RelatedDependencyModel.array(),
}))
