import type { PrismaClient } from "@prisma/client";
import { CATEGORY_TAXONOMY } from "./data/category-taxonomy";

export async function seedCategoriesForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const existing = await prisma.categoryNode.count({ where: { userId } });
  if (existing > 0) return;

  for (const group of CATEGORY_TAXONOMY) {
    const groupNode = await prisma.categoryNode.create({
      data: {
        userId,
        name: group.name,
        depth: 0,
        slug: group.name.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    for (const category of group.categories) {
      const categoryNode = await prisma.categoryNode.create({
        data: {
          userId,
          name: category.name,
          depth: 1,
          parentId: groupNode.id,
        },
      });

      for (const sub of category.subcategories) {
        await prisma.categoryNode.create({
          data: {
            userId,
            name: sub.name,
            depth: 2,
            parentId: categoryNode.id,
            isSystem: sub.isSystem ?? false,
          },
        });
      }
    }
  }
}
