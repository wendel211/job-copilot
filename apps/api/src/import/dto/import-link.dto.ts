import { z } from "zod";

export const ImportLinkSchema = z.object({
  url: z.string().url(),
  userId: z.string().min(5), 
});

export type ImportLinkDto = z.infer<typeof ImportLinkSchema>;
