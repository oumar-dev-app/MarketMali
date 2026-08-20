import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { LivraisonPositionService } from "@/lib/services/livraison-position.service";

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

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    const precision_gps =
      body.precision_gps !== undefined &&
      body.precision_gps !== null
        ? Number(body.precision_gps)
        : null;

    const result =
      await LivraisonPositionService.updatePosition(
        uuid,
        user.id,
        user.role,
        latitude,
        longitude,
        precision_gps
      );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      }
    );
  }
);

export const GET = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user = await getAuthUser(req);

    const { uuid } = await context.params;

    const position =
      await LivraisonPositionService.findPosition(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        position,
      },
      {
        status: 200,
      }
    );
  }
);