import {
  NextRequest,
  NextResponse,
} from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

import { PaiementService } from "@/lib/services/paiement.service";
import { CommandeRepository } from "@/lib/repositories/commande.repository";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {

    // =========================================================
    // 1. Authentification
    // =========================================================

    const user =
      authMiddleware(req);


    // =========================================================
    // 2. UUID du paiement
    // =========================================================

    const { uuid } =
      await params;


    // =========================================================
    // 3. Récupérer le paiement
    // =========================================================

    const paiement =
      await PaiementService.findByUUID(
        uuid
      );


    // =========================================================
    // 4. Vérifier que le paiement appartient au client
    // =========================================================

    if (
      paiement.client_id !==
      user.id
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Vous n'êtes pas autorisé à initialiser ce paiement.",
        },
        {
          status: 403,
        }
      );

    }


    // =========================================================
    // 5. Récupérer la commande
    // =========================================================

    const commande =
      await CommandeRepository.findById(
        paiement.commande_id
      );


    if (!commande) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Commande associée au paiement introuvable.",
        },
        {
          status: 404,
        }
      );

    }


    // =========================================================
    // 6. Vérification supplémentaire
    // =========================================================

    if (
      commande.client_id !==
      user.id
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Vous n'êtes pas autorisé à accéder à cette commande.",
        },
        {
          status: 403,
        }
      );

    }


    // =========================================================
    // 7. URL publique MarketMali
    // =========================================================

    const appUrl =
      process.env.APP_URL;


    if (!appUrl) {

      throw new Error(
        "APP_URL n'est pas configurée."
      );

    }


    // =========================================================
    // 8. URLs de retour Wave
    // =========================================================

    const successUrl =
      `${appUrl}/paiement/succes?paiement=${paiement.uuid}`;

    const errorUrl =
      `${appUrl}/paiement/echec?paiement=${paiement.uuid}`;


    // =========================================================
    // 9. Initialiser le paiement
    // =========================================================

    const result =
      await PaiementService.initiate(
        paiement.uuid,
        successUrl,
        errorUrl
      );


    // =========================================================
    // 10. Réponse
    // =========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Paiement initialisé avec succès.",

        data: result,
      },
      {
        status: 200,
      }
    );

  });

}