import { NextRequest, NextResponse } from "next/server";

import { BoutiqueService } from "@/lib/services/boutique.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ uuid: string }>
  }
) {

  return apiHandler(async () => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const result =
      await BoutiqueService.block(
        uuid,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      {
        status: 200,
      }
    );

  })(req);

}