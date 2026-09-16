import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitVarianteService } from "@/lib/services/produitVariante.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

export async function PATCH(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            uuid: string;
            varianteUuid: string;
        }>;
    }
) {
    return apiHandler(async () => {

        const user =
            vendeurMiddleware(req);

        const {
            uuid,
            varianteUuid,
        } = await params;

        const body =
            await req.json();

        const variante =
            await ProduitVarianteService.update(
                uuid,
                varianteUuid,
                user.id,
                user.role,
                {
                    nom: body.nom,
                    stock: body.stock,
                    ordre: body.ordre,
                }
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Variante modifiée avec succès.",
                data: variante,
            },
            {
                status: 200,
            }
        );
    });
}

export async function DELETE(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            uuid: string;
            varianteUuid: string;
        }>;
    }
) {
    return apiHandler(async () => {

        const user =
            vendeurMiddleware(req);

        const {
            uuid,
            varianteUuid,
        } = await params;

        const result =
            await ProduitVarianteService.delete(
                uuid,
                varianteUuid,
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
