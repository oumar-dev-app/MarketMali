import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { NotificationService } from "@/lib/services/notification.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const count =
      await NotificationService.countUnread(
        user.id
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          count,
        },
      },
      {
        status: 200,
      }
    );
  });
}