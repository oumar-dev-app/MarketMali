import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import {
  LivraisonService,
} from "@/lib/services/livraison.service";
import {
  LivraisonStatus,
} from "@/lib/repositories/livraison.repository";

type Params = {
  params: Promise<{
    uuid: string;
  }>;
};

const allowedStatuses: LivraisonStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_pending_confirmation",
  "delivered",
  "cancelled",
];

export const GET = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const livraison =
      await LivraisonService.findByUUID(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      message:
        "Livraison récupérée avec succès.",
      data: livraison,
    });
  }
);

export const PATCH = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const body =
      await req.json();

    const status =
      body.status as LivraisonStatus;

    if (
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Statut de livraison invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const commentaire =
      typeof body.commentaire === "string"
        ? body.commentaire.trim()
        : undefined;

    const result =
      await LivraisonService.updateStatus(
        uuid,
        user.id,
        user.role,
        status,
        commentaire
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  }
);

