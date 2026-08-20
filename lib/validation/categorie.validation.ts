import { z } from "zod";


export const createCategorieSchema = z.object({

  nom: z
    .string()
    .trim()
    .min(2)
    .max(100),

  description: z
    .string()
    .max(500)
    .optional(),

  image: z
    .string()
    .max(255)
    .optional(),

});


export const updateCategorieSchema =
  createCategorieSchema.partial();