import { z } from "zod";

export const registerSchema = z
  .object({
    nom: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100),

    prenom: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(100),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Adresse e-mail invalide"),

    telephone: z
      .string()
      .trim()
      .min(8, "Le numéro de téléphone est invalide")
      .max(30),

    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(100),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse e-mail invalide"),

  password: z.string().min(1, "Le mot de passe est obligatoire"),
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;