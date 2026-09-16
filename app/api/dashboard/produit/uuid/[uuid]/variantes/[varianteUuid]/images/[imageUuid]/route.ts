import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitVarianteService } from "@/lib/services/produitVariante.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

export async function DELETE(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            uuid: string;
            varianteUuid: string;
            imageUuid: string;
        }>;
    }
) {
    return apiHandler(async () => {

        const user =
            vendeurMiddleware(req);

        const {
            uuid,
            varianteUuid,
            imageUuid,
        } = await params;

        const result =
            await ProduitVarianteService.deleteImage(
                uuid,
                varianteUuid,
                imageUuid,
                user.id,
                user.role
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
