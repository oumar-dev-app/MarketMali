import { z } from "zod";

export const apiKeySchema = z.object({
  nom: z
    .string()
    .trim()
    .min(3)
    .max(100),

  expiration: z
    .iso
    .datetime()
    .optional(),
});