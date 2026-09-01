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

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const body =
      await req.json();

    const method =
      body?.method;

    const otp =
      typeof body?.otp === "string"
        ? body.otp
        : undefined;

    const result =
      await LivraisonService.confirmDeliveryByClient(
        uuid,
        user.id,
        user.role,
        method,
        otp
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  }
);

