import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { NotificationService } from "@/lib/services/notification.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const { uuid } = await params;

    await NotificationService.markAsRead(
      uuid,
      user.id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification marquée comme lue.",
      },
      {
        status: 200,
      }
    );
  });
}