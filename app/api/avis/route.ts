import {
  NextRequest,
  NextResponse
} from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";
import { AvisService } from "@/lib/services/avis.service";


export async function POST(
  req: NextRequest
) {
  return apiHandler(async () => {
    const user =
      authMiddleware(req);

    /**
     * Seuls les clients peuvent laisser
     * un avis sur leurs achats.
     */
    if (user.role !== "client") {

      return NextResponse.json(
        {
          success: false,
          message:
            "Seuls les clients peuvent laisser un avis."
        },
        {
          status: 403
        }
      );

    }

    const body =
      await req.json();

    const avis =
      await AvisService.create(
        {
          commande_produit_id:
            Number(
              body.commande_produit_id
            ),

          note:
            Number(body.note),

          commentaire:
            body.commentaire
        },
        user.id
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Votre avis a été publié avec succès.",

        data: avis
      },
      {
        status: 201
      }
    );

  });

}
