import prisma from "@/utils/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { valid } from "semver";
import { Button } from "@ui/components/button";

const getData = async (slug: string[]) => {
  const isPossibleVersionPage = slug.length > 1 && !!valid(slug.at(-1));

  const decodedSlug = slug.map((item) => decodeURIComponent(item));

  const pkg = await prisma.package.findFirst({
    where: {
      OR: [
        { name: decodedSlug.join("/") },
        isPossibleVersionPage
          ? { name: decodedSlug.slice(0, -1).join("/") }
          : {},
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      githubLink: true,
      homeLink: true,
      latestCheckDate: true,
      latestUpdateDate: true,
      versions: {
        select: {
          details: true,
          name: true,
          isLatestVersion: true,
          latestCheckDate: true,
          latestUpdateDate: true,
          releaseDate: true,
        },
        orderBy: { releaseDate: "asc" },
      },
    },
  });

  if (!pkg) return notFound();

  const version = isPossibleVersionPage
    ? await prisma.packageVersion.findFirst({
        where: { name: decodedSlug.at(-1), packageId: pkg.id },
        select: {
          details: true,
          isLatestVersion: true,
          name: true,
          releaseDate: true,
          latestCheckDate: true,
          latestUpdateDate: true,
          packageDependencies: {
            select: {
              file: {
                select: {
                  name: true,
                  path: true,
                  repository: { select: { fullName: true } },
                },
              },
            },
          },
        },
      })
    : null;

  return {
    package: pkg,
    version: version
      ? {
          ...version,
          packageDependencies: version.packageDependencies.map((pkgDep) => ({
            file: {
              ...pkgDep.file,
              path:
                pkgDep.file.path === pkgDep.file.name
                  ? ""
                  : `/${pkgDep.file.path.replace(`/${pkgDep.file.name}`, "")}`,
            },
          })),
        }
      : null,
  };
};

const PackagePage = async ({
  params: { packageSlug },
}: {
  params: { packageSlug: string[] };
}) => {
  const data = await getData(packageSlug);

  return (
    <div className="container pt-12">
      <h1 className="mb-8 text-2xl font-medium">
        Package {data.package.name}
        {data.version && `@${data.version?.name}`}
      </h1>
      <div className="mb-8">{data.package.description}</div>
      <div className="flex flex-col gap-12">
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="secondary">
            Reload data
          </Button>
          <div className="text-sm font-light">
            {data.package.latestCheckDate
              ? `Mis à jour il y a ${data.package.latestCheckDate}`
              : "Aucune actualisation effectuée"}
          </div>
        </div>

        {data.version ? (
          <div>
            <h2 className="text-2xl text-medium mb-8">Dependencies</h2>
            <div className="flex gap-2 flex-wrap">
              {data.version.packageDependencies.map((dependency) => (
                <Link
                  href={`/feed/${dependency.file.repository.fullName}${dependency.file.path}`}
                  className={`flex border rounded bg-secondary/50 hover:bg-secondary px-2 py-1`}
                  key={`${dependency.file.repository.fullName}${dependency.file.path}`}
                >
                  {dependency.file.repository.fullName}
                  {dependency.file.path}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          {data.version ? (
            <h2 className="text-2xl text-medium mb-8">Other versions</h2>
          ) : null}
          <div className="flex gap-2 flex-wrap">
            {data.package.versions.map((version) => (
              <Link
                href={`/package/${data.package.name}/${version.name}`}
                className={`flex border rounded ${
                  version.name === data.version?.name
                    ? "bg-gray-600 border-gray-600"
                    : "bg-secondary/50 hover:bg-secondary"
                } px-2 py-1`}
                key={version.name}
              >
                {version.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePage;
