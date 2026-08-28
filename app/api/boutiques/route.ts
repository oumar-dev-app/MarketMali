import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { BoutiqueService } from "@/lib/services/boutique.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";


export async function GET() {

  return apiHandler(async () => {

    const boutiques =
      await BoutiqueService.findAllActive();


    return NextResponse.json(
      {
        success: true,
        message:
          boutiques.length
            ? "Boutiques récupérées avec succès."
            : "Aucune boutique disponible.",
        data: boutiques,
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


    const boutique =
      await BoutiqueService.create(
        {
          user_id: user.id,

          nom: body.nom,
          description: body.description,
          logo: body.logo,
          telephone: body.telephone,
          email: body.email,
          adresse: body.adresse,
          ville: body.ville,
        }
      );


    return NextResponse.json(
      {
        success: true,
        message:
          "Boutique créée avec succès.",
        data: boutique,
      },
      {
        status: 201,
      }
    );

  });

}