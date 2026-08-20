import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { BoutiqueRepository } from "@/lib/repositories/boutique.repository";
import { LivreurService } from "@/lib/services/livreur.service";


export async function GET(
  req: NextRequest
) {
  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const boutique =
      await BoutiqueRepository.findByUserId(
        user.id
      );

    if (!boutique) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucune boutique associée à cet utilisateur."
        },
        {
          status: 404
        }
      );
    }

    const livreurs =
      await LivreurService.findByBoutique(
        boutique.id,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          livreurs.length
            ? "Livreurs récupérés avec succès."
            : "Aucun livreur enregistré.",
        data: livreurs
      },
      {
        status: 200
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

    const livreur =
      await LivreurService.create(
        {
          boutique_id:
            Number(body.boutique_id),

          nom:
            body.nom,

          prenom:
            body.prenom,

          telephone:
            body.telephone,

          email:
            body.email,

          password:
            body.password,

          vehicule:
            body.vehicule
        },
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Livreur créé avec succès.",
        data: livreur
      },
      {
        status: 201
      }
    );
  });
}

