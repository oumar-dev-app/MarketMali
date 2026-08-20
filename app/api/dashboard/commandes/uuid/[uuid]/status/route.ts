import { NextResponse } from "next/server";

import { CommandeService } from "@/lib/services/commande.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import {
  CommandeStatus
} from "@/lib/types/commande";

export const PATCH = apiHandler(
  async (
    req: Request,
    context: {
      params: Promise<{
        uuid: string;
      }>;
    }
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const body =
      await req.json();

    const status =
      body.status as CommandeStatus;

    const commentaire =
      typeof body.commentaire === "string"
        ? body.commentaire.trim()
        : undefined;

    const allowedStatus: CommandeStatus[] = [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (
      !allowedStatus.includes(status)
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Statut invalide."
        },
        {
          status: 400
        }
      );
    }

    const result =
      await CommandeService.updateStatus(
        uuid,
        user.id,
        user.role,
        status,
        commentaire
      );

    return NextResponse.json({
      success: true,
      ...result
    });

  }
);