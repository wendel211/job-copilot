import { AtsType } from "@prisma/client";

export function detectATS(input?: string): AtsType {
  if (!input) return AtsType.unknown;

  const text = input.toLowerCase();

  if (text.includes("greenhouse")) return AtsType.greenhouse;
  if (text.includes("lever.co")) return AtsType.lever;
  if (text.includes("workday")) return AtsType.workday;
  if (text.includes("gupy")) return AtsType.gupy;

  return AtsType.unknown;
}
