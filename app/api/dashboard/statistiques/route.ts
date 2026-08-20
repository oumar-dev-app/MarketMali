import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { DashboardService } from "@/lib/services/dashboard.service";

export const GET = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    const statistiques =
      await DashboardService.statistiques(
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      data: statistiques
    });

  }
);