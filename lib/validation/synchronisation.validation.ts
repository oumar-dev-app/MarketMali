import { z } from "zod";

export const syncCategorieSchema = z.object({

  uuid: z.uuid(),

  nom: z.string()
    .min(2)
    .max(100),

  slug: z.string()
    .min(2)
    .max(150),

  description:
    z.string()
    .optional()
    .nullable(),

  image:
    z.string()
    .optional()
    .nullable(),

  status:
    z.enum([
      "active",
      "pending",
      "blocked"
    ])
    .default("active"),

});

export const syncProduitSchema = z.object({

  uuid: z.uuid(),

  categorie_uuid: z.uuid(),

  nom: z.string()
    .trim()
    .min(2)
    .max(150),

  slug: z.string()
    .trim()
    .min(2)
    .max(180),

  description:
    z.string()
    .optional()
    .nullable(),

  prix:
    z.number()
    .positive(),

  stock:
    z.number()
    .int()
    .min(0),

  image:
    z.string()
    .optional()
    .nullable(),

  status:
    z.enum([
      "active",
      "pending",
      "blocked"
    ])
    .default("active"),

});

export const syncCategoriesSchema = z.object({
  categories: z.array(syncCategorieSchema),
});

export const syncProduitsSchema = z.object({
  produits: z.array(syncProduitSchema),
});

export const syncStocksSchema = z.object({
  stocks: z.array(
    z.object({
      uuid: z.uuid(),
      stock: z.number().int().min(0),
    })
  ),
});

export const syncCommandeSchema = z.object({
  commande_uuid: z.uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});