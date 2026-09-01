import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { LivraisonService } from "@/lib/services/livraison.service";

type Params = {
  params: Promise<{
    uuid: string;
  }>;
};

export const POST = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {
    const user = await getAuthUser(req);

    const { uuid } = await context.params;

    const body = await req.json();

    const qrToken =
      typeof body.qrToken === "string"
        ? body.qrToken.trim()
        : "";

    if (!qrToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Le token QR est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await LivraisonService.verifyPickupQr(
        uuid,
        user.id,
        user.role,
        qrToken
      );

    return NextResponse.json(result);
  }
);
