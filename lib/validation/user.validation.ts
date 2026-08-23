import { z } from "zod";

export const updateUserSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  prenom: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .email()
    .toLowerCase()
    .optional(),

  telephone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1),

  newPassword: z
    .string()
    .min(8)
    .max(100),
});