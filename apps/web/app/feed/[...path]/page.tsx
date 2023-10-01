import prisma from "@/utils/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { Switch } from "ui/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "ui/components/ui/tabs";

const getData = async ({ path }: { path: string[] }) => {
  const [ownerLogin, name] = path.slice(0, 2);
  const filePath = path.slice(2).join("/");

  const fileName = "package.json";

  const repository = await prisma.repository
    .findFirst({
      where: { ownerLogin, name },
      select: {
        id: true,
        name: true,
        ownerLogin: true,
        fullName: true,
        dependencyFiles: {
          select: {
            path: true,
            name: true,
            _count: { select: { dependencies: true } },
          },
        },
      },
    })
    .then((repository) => {
      if (!repository) return null;

      return {
        ...repository,
        dependencyFiles: repository.dependencyFiles.map((file) => ({
          ...file,
          path:
            file.path === fileName
              ? ""
              : `/${file.path.replace(`/${fileName}`, "")}`,
        })),
      };
    });

  if (!repository) return notFound();

  const file = await prisma.dependencyFile
    .findFirst({
      where: {
        path: filePath === "" ? fileName : `${filePath}/${fileName}`,
        repository: { ownerLogin, name },
      },
      select: {
        name: true,
        path: true,
        dependencies: {
          select: {
            package: { select: { name: true } },
            version: { select: { name: true } },
            semverNumber: true,
          },
        },
      },
    })
    .then((file) => {
      if (!file) return null;

      return {
        ...file,
        path:
          file.path === fileName
            ? ""
            : `/${file.path.replace(`/${fileName}`, "")}`,
      };
    });

  if (filePath.includes(fileName))
    return redirect(`/feed/${path.join("/").replace(fileName, "")}`);

  if (file) return { repository, file };

  if (filePath !== "") return notFound();

  return redirect(`/repo/${ownerLogin}/${name}`);
};

const DependencyFilePage = async ({
  params,
}: {
  params: { path: string[] };
}) => {
  const { repository, file } = await getData(params);

  return (
    <main className="pt-12 px-4 container flex">
      <div className="mb-8 w-2/3">
        <h1 className="mb-4 text-2xl font-medium">
          Repository {repository.fullName}
        </h1>
        <span className="font-light">
          File path :{" "}
          {file.path === file.name ? file.name : `${file.path}/${file.name}`}
        </span>
      </div>
      {/* <div className="flex flex-col h-96">
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="password">
            Change your password here.
          </TabsContent>
        </Tabs>
      </div> */}
      <div className="w-1/3 static rounded-lg border flex flex-col gap-2 max-h-[80vh] overflow-auto p-4">
        <h3 className="text-lg font-medium mb-2">Other files</h3>
        <div className="flex flex-col w-full gap-1.5">
          {repository.dependencyFiles.map((repoFile, index, initialArray) => (
            <Fragment key={file.path}>
              <p>
                <Link
                  href={`/feed/${repository.fullName}${repoFile.path}`}
                  className="font-medium hover:underline"
                >
                  {repoFile.path}/{repoFile.name}
                </Link>
              </p>
              {index !== initialArray.length - 1 && <hr />}
            </Fragment>
          ))}
        </div>

        <hr className="mt-4 mb-6" />

        <h3 className="text-lg font-medium mb-2">Dependencies</h3>
        <div className="flex flex-col w-full gap-1.5">
          {file.dependencies.map((dependency, index, initialArray) => (
            <Fragment key={dependency.package.name}>
              <div className="flex justify-between gap-2">
                <p>
                  <Link
                    href={`/package/${dependency.package.name}`}
                    className="font-medium hover:underline"
                  >
                    {dependency.package.name}
                  </Link>

                  <Link
                    href={`/package/${dependency.package.name}/${dependency.version.name}`}
                    className="font-thin text-primary/70 ml-3 hover:underline"
                  >
                    v{dependency.version.name}
                  </Link>
                </p>
                <Switch defaultChecked />
              </div>
              {index !== initialArray.length - 1 && <hr />}
            </Fragment>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DependencyFilePage;
