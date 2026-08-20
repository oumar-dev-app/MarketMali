import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CommandeService } from "@/lib/services/commande.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {

    return apiHandler(async () => {

        const user =
            authMiddleware(req);

        const { uuid } =
            await params;

        const body =
            await req.json().catch(() => ({}));

        const result =
            await CommandeService.cancelByClient(
                uuid,
                user.id,
                body.commentaire
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
    });
}
