import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CategorieService } from "@/lib/services/categorie.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const user = vendeurMiddleware(req);

    const scope = req.nextUrl.searchParams.get("scope");

    // Catalogue global des catégories actives.
    // Utilisé notamment lors de l'ajout d'une catégorie
    // à la boutique d'un vendeur.
    if (scope === "global") {
      const categories =
        await CategorieService.findAvailableGlobal(user.role);

      return NextResponse.json(
        {
          success: true,
          message: categories.length
            ? "Catégories disponibles récupérées avec succès."
            : "Aucune catégorie disponible.",
          data: categories,
        },
        {
          status: 200,
        }
      );
    }

    // Vue normale du dashboard :
    // - admin / super_admin : toutes les catégories
    // - vendeur : uniquement les catégories associées à sa boutique
    const categories =
      await CategorieService.findByUser(
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message: categories.length
          ? "Catégories récupérées avec succès."
          : "Aucune catégorie trouvée.",
        data: categories,
      },
      {
        status: 200,
      }
    );
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const user = vendeurMiddleware(req);

    const body = await req.json();

    const categorie =
      await CategorieService.create(
        {
          nom: body.nom,
          parent_id:
            body.parent_id !== undefined
              ? body.parent_id
              : null,
          description: body.description,
          image: body.image,
        },
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message: "Catégorie créée avec succès.",
        data: categorie,
      },
      {
        status: 201,
      }
    );
  });
}

export async function DELETE(req: NextRequest) {
  return apiHandler(async () => {
    const user = vendeurMiddleware(req);

    const body = await req.json();

    const categorieId = Number(
      body.categorie_id
    );

    if (
      !Number.isInteger(categorieId) ||
      categorieId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Identifiant de catégorie invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await CategorieService.removeFromBoutique(
        categorieId,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      {
        status: 200,
      }
    );
  });
}