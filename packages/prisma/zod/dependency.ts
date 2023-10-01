import * as z from "zod"
import { DependencyType } from "@prisma/client"
import { CompleteDependencyFile, RelatedDependencyFileModel, CompletePackage, RelatedPackageModel, CompletePackageVersion, RelatedPackageVersionModel } from "./index"

export const DependencyModel = z.object({
  id: z.string(),
  fileId: z.string(),
  packageId: z.string(),
  versionId: z.string().nullish(),
  semverNumber: z.string(),
  type: z.nativeEnum(DependencyType),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteDependency extends z.infer<typeof DependencyModel> {
  file: CompleteDependencyFile
  package: CompletePackage
  version?: CompletePackageVersion | null
}

/**
 * RelatedDependencyModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDependencyModel: z.ZodSchema<CompleteDependency> = z.lazy(() => DependencyModel.extend({
  file: RelatedDependencyFileModel,
  package: RelatedPackageModel,
  version: RelatedPackageVersionModel.nullish(),
}))
