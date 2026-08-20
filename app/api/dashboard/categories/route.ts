import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CategorieService } from "@/lib/services/categorie.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";


export async function GET(
  req: NextRequest
) {

  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);


    const categories =
      await CategorieService.findByUser(
        user.id,
        user.role
      );


    return NextResponse.json(
      {
        success: true,
        message:
          categories.length
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



export async function POST(
  req: NextRequest
) {

  console.log("=== POST DASHBOARD CATEGORIES DEBUT ===");

  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);

    console.log("USER CONNECTE :", user);


    const body =
      await req.json();

    console.log("BODY CATEGORIE :", body);


    const categorie =
      await CategorieService.create(
        {
          boutique_id: body.boutique_id,
          nom: body.nom,
          description: body.description,
          image: body.image,
        },
        user.id,
        user.role
      );


    console.log("CATEGORIE CREE :", categorie);


    return NextResponse.json(
      {
        success: true,
        message:
          "Catégorie créée avec succès.",
        data: categorie,
      },
      {
        status: 201,
      }
    );

  });

}