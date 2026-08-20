import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { NotificationService } from "@/lib/services/notification.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const searchParams = req.nextUrl.searchParams;

    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? "1")
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("limit") ?? "20")
      )
    );

    const notifications =
      await NotificationService.findByUser(
        user.id,
        page,
        limit
      );

    return NextResponse.json(
      {
        success: true,
        data: notifications,
      },
      {
        status: 200,
      }
    );
  });
}