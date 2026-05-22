"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const ArchiveCategorySchema = z.object({
  categoryId: z.string().min(1),
});

export async function archiveCategoryAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = ArchiveCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid category." };
  }

  const category = await prisma.categoryNode.findFirst({
    where: { id: parsed.data.categoryId, userId },
    select: { id: true, isSystem: true, name: true, depth: true },
  });

  if (!category) {
    return { success: false as const, error: "Category not found." };
  }

  if (category.isSystem) {
    return { success: false as const, error: "System categories cannot be archived." };
  }

  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  await prisma.categoryNode.update({
    where: { id: category.id },
    data: { isArchived: true },
  });

  await logAuditEvent({
    type: "CATEGORY_ARCHIVE",
    userId,
    context: {
      categoryId: category.id,
      name: category.name,
      depth: category.depth,
    },
    ...meta,
  });

  revalidatePath("/categories");
  revalidatePath("/budget");
  return { success: true as const };
}
