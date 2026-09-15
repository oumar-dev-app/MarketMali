import {
  NextRequest,
  NextResponse
} from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";
import { ValidationError } from "@/lib/errors/ValidationError";

import { AvisService } from "@/lib/services/avis.service";


interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}


export async function GET(
  req: NextRequest,
  context: RouteContext
) {

  return apiHandler(async () => {

    const user =
      authMiddleware(req);


    /**
     * Seuls les clients peuvent consulter
     * l'état de leurs avis.
     */
    if (user.role !== "client") {

      return NextResponse.json(
        {
          success: false,
          message:
            "Seuls les clients peuvent consulter leurs avis."
        },
        {
          status: 403
        }
      );

    }


    const { id } =
      await context.params;


    const commandeProduitId =
      Number(id);


    if (
      !Number.isInteger(commandeProduitId) ||
      commandeProduitId <= 0
    ) {
      throw new ValidationError(
        "La ligne de commande est invalide."
      );
    }


    const avis =
      await AvisService.findByCommandeProduitId(
        commandeProduitId,
        user.id
      );


    return NextResponse.json(
      {
        success: true,

        data: {
          a_deja_avis:
            Boolean(avis),

          avis:
            avis
              ? {
                  uuid: avis.uuid,
                  note: avis.note,
                  commentaire:
                    avis.commentaire,
                  status: avis.status,
                  created_at:
                    avis.created_at,
                  updated_at:
                    avis.updated_at
                }
              : null
        }
      },
      {
        status: 200
      }
    );

  });

}
