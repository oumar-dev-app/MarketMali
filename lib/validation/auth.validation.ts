import { z } from "zod";

export const registerSchema = z.object({
  nom: z.string().trim().min(2).max(100),

  prenom: z.string().trim().min(2).max(100),

  email: z.email().toLowerCase(),

  telephone: z
    .string()
    .trim()
    .min(8)
    .max(20),

  password: z
    .string()
    .min(8)
    .max(100),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),

  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),

  password: z
    .string()
    .min(8)
    .max(100),
});