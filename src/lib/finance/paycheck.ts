import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  isAfter,
  startOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { PaycheckFrequency } from "@prisma/client";

export type PaycheckDefinition = {
  id: string;
  frequency: PaycheckFrequency;
  anchorDate: Date;
  isActive: boolean;
};

const TZ = "America/New_York";

function zonedStart(date: Date): Date {
  return startOfDay(toZonedTime(date, TZ));
}

function nextOccurrence(
  def: PaycheckDefinition,
  from: Date,
): Date {
  const fromZ = zonedStart(from);
  let cursor = zonedStart(def.anchorDate);

  if (!isAfter(cursor, fromZ)) {
    while (!isAfter(cursor, fromZ)) {
      switch (def.frequency) {
        case "WEEKLY":
          cursor = addWeeks(cursor, 1);
          break;
        case "BIWEEKLY":
          cursor = addWeeks(cursor, 2);
          break;
        case "SEMIMONTHLY": {
          const day = cursor.getDate();
          if (day < 15) {
            cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
          } else {
            cursor = addMonths(
              new Date(cursor.getFullYear(), cursor.getMonth(), 1),
              1,
            );
          }
          break;
        }
        case "MONTHLY":
          cursor = addMonths(cursor, 1);
          break;
        default:
          cursor = addWeeks(cursor, 2);
      }
    }
  }

  return cursor;
}

export function nearestPayday(
  definitions: PaycheckDefinition[],
  now: Date = new Date(),
): { date: Date; definitionId: string } | null {
  const active = definitions.filter((d) => d.isActive);
  if (active.length === 0) return null;

  let best: { date: Date; definitionId: string } | null = null;

  for (const def of active) {
    const occ = nextOccurrence(def, now);
    if (!best || occ < best.date) {
      best = { date: occ, definitionId: def.id };
    }
  }

  return best;
}

export function daysUntilPayday(
  definitions: PaycheckDefinition[],
  now: Date = new Date(),
): number | null {
  const nearest = nearestPayday(definitions, now);
  if (!nearest) return null;
  return differenceInCalendarDays(
    zonedStart(nearest.date),
    zonedStart(now),
  );
}
