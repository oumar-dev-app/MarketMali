import { z } from "zod";

export const createCommandeSchema = z.object({
  boutique_id: z
    .number()
    .int()
    .positive(),

  produits: z
    .array(
      z.object({
        produit_id: z
          .number()
          .int()
          .positive(),

        quantite: z
          .number()
          .int()
          .positive(),
      })
    )
    .min(1, "La commande doit contenir au moins un produit."),

  zone_livraison: z
    .string()
    .trim()
    .min(1, "La zone de livraison est obligatoire."),

  adresse_livraison: z
    .string()
    .trim()
    .optional(),

  latitude: z
    .number()
    .optional(),

  longitude: z
    .number()
    .optional(),

  gps_precision: z
    .number()
    .nonnegative()
    .optional(),
});

export const updateCommandeStatusSchema =
  z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  });