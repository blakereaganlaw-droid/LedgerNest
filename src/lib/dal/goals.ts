import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

export type GoalDTO = {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  isRetirement: boolean;
  progressPercent: number;
};

export const getGoalsDTO = async (): Promise<GoalDTO[]> => {
  const { userId } = await verifySession();

  const goals = await prisma.goal.findMany({
    where: { userId, isArchived: false },
    orderBy: { name: "asc" },
  });

  return goals.map((g) => {
    const target = Number(g.targetCents);
    const current = Number(g.currentCents);
    const progressPercent =
      target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      id: g.id,
      name: g.name,
      targetCents: target,
      currentCents: current,
      isRetirement: g.isRetirement,
      progressPercent,
    };
  });
};

export async function getSavingsSummaryDTO() {
  const goals = await getGoalsDTO();
  const savings = goals.filter((g) => !g.isRetirement);
  const retirement = goals.filter((g) => g.isRetirement);
  const totalSavings = savings.reduce((s, g) => s + g.currentCents, 0);
  const totalRetirement = retirement.reduce((s, g) => s + g.currentCents, 0);
  return { totalSavings, totalRetirement, goals: savings, retirement };
}
