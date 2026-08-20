import { z } from "zod";


export const createBoutiqueSchema = z.object({

  nom: z
    .string()
    .trim()
    .min(3)
    .max(100),


  description: z
    .string()
    .max(1000)
    .optional(),


  logo: z
    .string()
    .max(255)
    .optional(),


  telephone: z
    .string()
    .trim()
    .min(8)
    .max(30)
    .optional(),


  email: z
    .string()
    .email()
    .optional(),


  adresse: z
    .string()
    .max(255)
    .optional(),


  ville: z
    .string()
    .max(100)
    .optional(),

});


export const updateBoutiqueSchema =
  createBoutiqueSchema.partial();