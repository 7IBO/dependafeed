import * as z from "zod"
import { CompleteDependency, RelatedDependencyModel, CompletePackageVersion, RelatedPackageVersionModel } from "./index"

export const PackageModel = z.object({
  id: z.string(),
  name: z.string(),
  latestCheckDate: z.date(),
  latestUpdateDate: z.date(),
  githubLink: z.string().nullish(),
  homeLink: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePackage extends z.infer<typeof PackageModel> {
  dependencies: CompleteDependency[]
  versions: CompletePackageVersion[]
}

/**
 * RelatedPackageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPackageModel: z.ZodSchema<CompletePackage> = z.lazy(() => PackageModel.extend({
  dependencies: RelatedDependencyModel.array(),
  versions: RelatedPackageVersionModel.array(),
}))
