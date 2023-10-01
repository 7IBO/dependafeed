import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Octokit } from "octokit";
import { DependencyType, Prisma } from "prisma";
import semver from "semver";
import prisma from "@/utils/db";

type PackageJsonFile = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  bundleDependencies?: Record<string, string>;
};

export const POST = async (request: NextRequest) => {
  try {
    const octokit = new Octokit({
      auth: "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",
    });

    const schema = z.object({
      repo: z.string().regex(/[\w-]+\/[\w-]+/),
      provider: z.enum(["github"]),
    });

    const body = schema.parse(await request.json());

    const { data: githubRepository } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner: body.repo.split("/")[0],
        repo: body.repo.split("/")[1],
        headers: {
          accept: "application/vnd.github.v3.raw+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const {
      data: { items },
    } = await octokit.rest.search.code({
      q: `filename:package.json+repo:${githubRepository.full_name}`,
      headers: { accept: "application/vnd.github.v3.raw+json" },
    });

    const repository = await prisma.repository.create({
      data: {
        fullName: githubRepository.full_name,
        ownerLogin: githubRepository.owner.login,
        name: githubRepository.name,
      },
    });

    console.log(`▶️ Created repository with id ${repository.id}`);

    for (let index = 0; index < items.length; index++) {
      const element = items[index];

      const file = await prisma.dependencyFile.create({
        data: {
          name: element.name,
          path: element.path,
          repositoryId: repository.id,
        },
      });

      console.log(`▶️ Created file with id ${file.id}`);

      const dependencies: {
        packageName: string;
        versionName: string;
        fileId: string;
        type: DependencyType;
      }[] = [];

      const data = await octokit
        .request(`GET ${element.url}`, {
          headers: {
            accept: "application/vnd.github.v3.raw+json",
          },
        })
        .then(({ data }) => JSON.parse(data) as PackageJsonFile);

      const formatDependencies = (
        items: Record<string, string>,
        type: DependencyType,
      ) =>
        Object.entries(items)
          .filter((item) => semver.valid(semver.coerce(item[1])))
          .map(([packageName, versionName]) => ({
            packageName,
            versionName,
            fileId: file.id,
            type,
          }));

      if (data.dependencies) {
        dependencies.push(
          ...formatDependencies(data.dependencies, "DEPENDENCY"),
        );
      }

      if (data.devDependencies) {
        dependencies.push(
          ...formatDependencies(data.devDependencies, "DEV_DEPENDENCY"),
        );
      }

      if (data.peerDependencies) {
        dependencies.push(
          ...formatDependencies(data.peerDependencies, "PEER_DEPENDENCY"),
        );
      }

      if (data.bundleDependencies) {
        dependencies.push(
          ...formatDependencies(data.bundleDependencies, "BUNDLE_DEPENDENCY"),
        );
      }

      const existingPackages = await prisma.package.findMany({
        where: {
          name: {
            in: dependencies.map((dependency) => dependency.packageName),
          },
        },
        select: { id: true, name: true },
      });

      const repositoryDeps: {
        packageId: string;
        versionId: string;
        semver: string;
        fileId: string;
        type: DependencyType;
      }[] = [];

      for (let index = 0; index < dependencies.length; index++) {
        const dependency = dependencies[index];

        const formattedVersion = semver.valid(
          semver.coerce(dependency.versionName),
        );

        let packageId = existingPackages.find(
          (pkg) => pkg.name === dependency.packageName,
        )?.id;
        let versionId: string | undefined = undefined;

        if (!packageId) {
          await prisma.package
            .create({
              data: { name: dependency.packageName },
              select: { id: true },
            })
            .then((newPackage) => (packageId = newPackage.id));

          console.log(`▶️ Created package with id ${packageId}`);
        }

        await prisma.packageVersion
          .findFirst({
            where: { name: formattedVersion, packageId },
          })
          .then((version) => (versionId = version?.id));

        if (!versionId) {
          await prisma.packageVersion
            .create({
              data: { packageId, name: formattedVersion },
              select: { id: true },
            })
            .then((newVersion) => (versionId = newVersion.id));

          console.log(`▶️ Created version with id ${versionId}`);
        }

        repositoryDeps.push({
          packageId,
          versionId,
          semver: dependency.versionName,
          fileId: file.id,
          type: dependency.type,
        });
      }

      await prisma.dependency.createMany({
        data: repositoryDeps.map((dependency) => ({
          packageId: dependency.packageId,
          versionId: dependency.versionId,
          fileId: dependency.fileId,
          type: dependency.type,
          semverNumber: dependency.semver,
        })),
      });

      console.log(`▶️ Created dependencies for file ${file.id}`);
    }

    return NextResponse.json(repository, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(e, { status: 400 });
  }
};
