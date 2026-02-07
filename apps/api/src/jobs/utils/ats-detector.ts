import { AtsType } from "@prisma/client";

/**
 * Detecta o tipo de ATS com base na URL.
 * Para ATS desconhecido, o GenericScraper é usado automaticamente.
 */
export function detectATS(input?: string): AtsType {
  if (!input) return AtsType.unknown;

  const url = input.toLowerCase();

  if (url.includes("greenhouse")) return AtsType.greenhouse;
  if (url.includes("lever.co")) return AtsType.lever;
  if (url.includes("workday")) return AtsType.workday;
  if (url.includes("gupy")) return AtsType.gupy;

  // Qualquer outro site usa GenericScraper via "unknown"
  return AtsType.unknown;
}
