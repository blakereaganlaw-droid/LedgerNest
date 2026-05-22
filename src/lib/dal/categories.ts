import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import {
  buildCategoryTree,
  type CategoryLeafDTO,
  type CategoryTreeGroupDTO,
} from "@/lib/categories/build-tree";

export type { CategoryLeafDTO, CategoryTreeGroupDTO };

export const getCategoryTree = async (): Promise<CategoryTreeGroupDTO[]> => {
  const { userId } = await verifySession();

  const nodes = await prisma.categoryNode.findMany({
    where: { userId, isArchived: false },
    select: {
      id: true,
      name: true,
      depth: true,
      parentId: true,
      isSystem: true,
      slug: true,
    },
    orderBy: [{ depth: "asc" }, { name: "asc" }],
  });

  return buildCategoryTree(nodes);
};

export const getLeafCategories = async (): Promise<CategoryLeafDTO[]> => {
  const { userId } = await verifySession();
  const leaves = await prisma.categoryNode.findMany({
    where: { userId, depth: 2, isArchived: false },
    select: { id: true, name: true, isSystem: true },
    orderBy: { name: "asc" },
  });
  return leaves;
};

export async function getTransferGroupId(userId: string): Promise<string | null> {
  const group = await prisma.categoryNode.findFirst({
    where: { userId, depth: 0, slug: "transfers" },
    select: { id: true },
  });
  return group?.id ?? null;
}
