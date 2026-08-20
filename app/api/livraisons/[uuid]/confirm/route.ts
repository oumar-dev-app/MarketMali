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

    const result =
      await LivraisonService.confirmDeliveryByClient(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  }
);

