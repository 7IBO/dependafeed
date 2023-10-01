import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import validateNpmPackageName from "validate-npm-package-name";
import { valid } from "semver";
import prisma from "@/utils/db";

export const POST = async (request: NextRequest) => {
  try {
    const schema = z.object({
      name: z.custom<string>((val) => {
        if (typeof val !== "string") return false;

        const test = validateNpmPackageName(val);
        return test.validForNewPackages || test.validForOldPackages;
      }),
      provider: z.enum(["npm"]),
    });

    const body = schema.parse(await request.json());

    const existingPackage = await prisma.package.findUnique({
      where: { name: body.name },
    });

    if (existingPackage)
      return NextResponse.json(
        { error: "Package already exists" },
        { status: 422 },
      );

    const registryRes = await fetch(`https://registry.npmjs.org/${body.name}/`);

    if (!registryRes.ok) throw new Error("Package not found");

    const registryData = await registryRes.json();

    const latestVersion = registryData["dist-tags"].latest;

    const versions = Object.keys(registryData.versions).map((version) => ({
      name: version,
      releaseDate: registryData.time[version],
      isLatestVersion: version === latestVersion,
    }));

    const newPackage = await prisma.package.create({
      data: {
        name: registryData.name,
        description: registryData.description,
        versions: { createMany: { data: versions.map((version) => version) } },
      },
      include: {
        versions: {
          select: {
            id: true,
            name: true,
            releaseDate: true,
            isLatestVersion: true,
          },
        },
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(e.message, { status: 400 });
  }
};
