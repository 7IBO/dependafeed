import * as z from "zod"
import { CompleteDependency, RelatedDependencyModel, CompletePackageVersion, RelatedPackageVersionModel } from "./index"

export const PackageModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  latestCheckDate: z.date().nullish(),
  latestUpdateDate: z.date().nullish(),
  githubLink: z.string().nullish(),
  homeLink: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePackage extends z.infer<typeof PackageModel> {
  packageDependencies: CompleteDependency[]
  versions: CompletePackageVersion[]
}

/**
 * RelatedPackageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPackageModel: z.ZodSchema<CompletePackage> = z.lazy(() => PackageModel.extend({
  packageDependencies: RelatedDependencyModel.array(),
  versions: RelatedPackageVersionModel.array(),
}))
