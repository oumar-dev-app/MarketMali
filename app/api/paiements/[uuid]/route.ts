import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";
import { PaiementService } from "@/lib/services/paiement.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const { uuid } = await params;

    const paiement = await PaiementService.findByUUID(uuid);

    if (paiement.client_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Accès non autorisé à ce paiement.",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uuid: paiement.uuid,
        commande_id: paiement.commande_id,
        methode: paiement.methode,
        statut: paiement.statut,
        montant: paiement.montant,
        devise: paiement.devise,
        provider: paiement.provider,
        reference_externe: paiement.reference_externe,
        paid_at: paiement.paid_at,
        failed_at: paiement.failed_at,
        cancelled_at: paiement.cancelled_at,
        created_at: paiement.created_at,
        updated_at: paiement.updated_at,
      },
    });
  });
}
