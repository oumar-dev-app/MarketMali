import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { TarifLivraisonService } from "@/lib/services/tarifLivraison.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { BoutiqueRepository } from "@/lib/repositories/boutique.repository";

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

    const tarifs =
      await TarifLivraisonService.findByBoutique(
        boutique.id,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          tarifs.length
            ? "Tarifs de livraison récupérés avec succès."
            : "Aucun tarif de livraison configuré.",
        data: tarifs
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

    /*
     * Le serveur détermine lui-même
     * la boutique de l'utilisateur.
     *
     * On ne fait pas confiance à
     * boutique_id envoyé par le client.
     */
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

    const tarif =
      await TarifLivraisonService.create(
        boutique.id,
        user.id,
        user.role,
        body.zone,
        Number(body.frais)
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Tarif de livraison créé avec succès.",
        data: tarif
      },
      {
        status: 201
      }
    );
  });
}
