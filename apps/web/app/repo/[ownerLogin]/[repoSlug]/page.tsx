import prisma from "@/utils/db";
import { notFound } from "next/navigation";

const getData = async ({
  ownerLogin,
  repoSlug,
}: {
  ownerLogin: string;
  repoSlug: string;
}) => {
  const repository = await prisma.repository.findFirst({
    where: { ownerLogin, name: repoSlug },
    select: { id: true, dependencyFiles: { select: { path: true } } },
  });

  if (!repository) return notFound();

  return repository;
};

const RepositoryPage = async ({
  params,
}: {
  params: { ownerLogin: string; repoSlug: string };
}) => {
  const data = await getData(params);

return (
  <div className="text-white">{data.id}</div>);
};

export default RepositoryPage;
