import { NextResponse } from "next/server";

import { PaiementService } from "@/lib/services/paiement.service";
import { apiHandler } from "@/lib/utils/api-handler";

export const PATCH = apiHandler(
  async (
    _req: Request,
    context: {
      params: Promise<{ uuid: string }>;
    }
  ) => {
    const { uuid } = await context.params;

    const result =
      await PaiementService.markAsPaid(uuid);

    return NextResponse.json({
      success: true,
      ...result,
    });
  }
);