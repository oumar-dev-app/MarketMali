import { Router } from "express";
import { CategorieController } from "../controllers/categorie.controller";
import { authMiddleware } from "../middleware/auth.middleware";


const router = Router();


// ===============================
// Routes publiques
// ===============================

// Toutes les catégories actives
router.get(
  "/active",
  CategorieController.findAllActive
);


// Catégorie active par slug
router.get(
  "/active/:boutique_id/:slug",
  CategorieController.findBySlugActive
);


// Catégories actives d'une boutique
router.get(
  "/boutique/:boutique_id/active",
  CategorieController.findByBoutiqueActive
);


// ===============================
// Routes protégées
// ===============================

router.use(authMiddleware);


// Créer une catégorie
router.post(
  "/",
  CategorieController.create
);


// Toutes les catégories (admin/vendeur)
router.get(
  "/",
  CategorieController.findAll
);


// Catégories de l'utilisateur connecté
router.get(
  "/user",
  CategorieController.findByUser
);


// Une catégorie par UUID
router.get(
  "/:uuid",
  CategorieController.findByUUID
);


// Catégories d'une boutique
router.get(
  "/boutique/:boutique_id",
  CategorieController.findByBoutique
);


// Une catégorie par UUID
router.get(
  "/:uuid",
  CategorieController.findByUUID
);


// Modifier
router.patch(
  "/:uuid",
  CategorieController.update
);


// Supprimer définitivement
router.delete(
  "/:uuid",
  CategorieController.delete
);


// Bloquer
router.patch(
  "/:uuid/block",
  CategorieController.block
);


// Débloquer
router.patch(
  "/:uuid/unblock",
  CategorieController.unblock
);


// Activer
router.patch(
  "/:uuid/activate",
  CategorieController.activate
);


export default router;