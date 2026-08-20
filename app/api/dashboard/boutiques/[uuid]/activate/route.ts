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

    const boutique =
      await BoutiqueService.activate(
        uuid,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message: "Boutique activée avec succès.",
        data: boutique,
      },
      {
        status: 200,
      }
    );

  })(req);

}