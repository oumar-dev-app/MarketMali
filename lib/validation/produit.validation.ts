import { z } from "zod";


// Création dashboard
export const createProduitSchema = z.object({

  categorie_id: z.number().int().positive(),

  nom: z.string().trim().min(2).max(150),

  description: z.string().optional(),

  prix: z.number().positive(),

  stock: z.number().int().min(0),

  image: z.url().optional(),

  actif: z.boolean().optional(),

});


// Modification dashboard
export const updateProduitSchema =
  createProduitSchema.partial();




// =============================
// Synchronisation catégories
// =============================

export const syncCategorieSchema = z.object({

  uuid: z.uuid(),

  nom: z.string()
    .trim()
    .min(2)
    .max(100),

  slug: z.string()
    .trim()
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



export const syncCategoriesSchema = z.object({

  categories:
    z.array(syncCategorieSchema),

});




// =============================
// Synchronisation produits
// =============================

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



export const syncProduitsSchema = z.object({

  produits:
    z.array(syncProduitSchema),

});




// =============================
// Synchronisation stocks
// =============================

export const syncStocksSchema = z.object({

  stocks:
    z.array(
      z.object({

        uuid: z.uuid(),

        stock:
          z.number()
          .int()
          .min(0),

      })
    ),

});