import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { NotificationService } from "@/lib/services/notification.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function PATCH(req: NextRequest) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    await NotificationService.markAllAsRead(
      user.id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Toutes les notifications ont été marquées comme lues.",
      },
      {
        status: 200,
      }
    );
  });
}