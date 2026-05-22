import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

export type ProfileSettingsDTO = {
  displayName: string | null;
  timezone: string;
  locale: string;
  allowNegativeRollover: boolean;
};

export const getProfileSettingsDTO = async (): Promise<ProfileSettingsDTO> => {
  const { userId, userName } = await verifySession();

  const settings = await prisma.profileSettings.findUnique({
    where: { userId },
  });

  return {
    displayName: settings?.displayName ?? userName,
    timezone: settings?.timezone ?? "America/New_York",
    locale: settings?.locale ?? "en-US",
    allowNegativeRollover: settings?.allowNegativeRollover ?? false,
  };
};
