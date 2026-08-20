import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { CategorieService } from "@/lib/services/categorie.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";


export const GET = apiHandler(
  async () => {

    const categories =
      await CategorieService.findAllActive();


    return NextResponse.json(
      {
        success: true,

        message:
          categories.length
            ? "Catégories récupérées avec succès."
            : "Aucune catégorie disponible.",

        data: categories,
      },
      {
        status: 200,
      }
    );

  }
);



export const POST = apiHandler(
  async (
    req: Request
  ) => {


    const request =
      req as NextRequest;



    const user =
      vendeurMiddleware(request);



    const body =
      await request.json();



    console.log(
      "BODY CATEGORIE :",
      body
    );



    const categorie =
      await CategorieService.create(
        {
          boutique_id:
            body.boutique_id,

          nom:
            body.nom,

          description:
            body.description,

          image:
            body.image,

        },
        user.id,
        user.role
      );



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

  }
);