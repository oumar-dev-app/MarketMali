import { NextResponse } from "next/server";

import { CommandeService } from "@/lib/services/commande.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

export const GET = apiHandler(
  async (
    req: Request,
    context: {
      params: Promise<{
        uuid: string;
      }>;
    }
  ) => {
    const user = await getAuthUser(req);

    const { uuid } = await context.params;

    const commande =
      await CommandeService.findByUUIDForUser(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      data: commande,
    });
  }
);

export const DELETE = apiHandler(
  async (
    req: Request,
    context: {
      params: Promise<{
        uuid: string;
      }>;
    }
  ) => {
    const user = await getAuthUser(req);

    const { uuid } = await context.params;

    const result =
      await CommandeService.delete(
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