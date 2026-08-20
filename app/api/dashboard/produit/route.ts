import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitService } from "@/lib/services/produit.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";



export async function GET(
  req: NextRequest
) {

  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const produits =
      await ProduitService.findByUser(
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          produits.length
            ? "Produits récupérés avec succès."
            : "Aucun produit disponible.",
        data: produits,
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

  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);


    const body =
      await req.json();


    const produit =
      await ProduitService.create(
        {
          categorie_id: body.categorie_id,
          nom: body.nom,
          description: body.description,
          prix: body.prix,
          stock: body.stock,
          image: body.image,
        },
        user.id,
        user.role
      );


    return NextResponse.json(
      {
        success: true,
        message:
          "Produit créé avec succès.",
        data: produit,
      },
      {
        status: 201,
      }
    );

  });

}

