import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitVarianteService } from "@/lib/services/produitVariante.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    return apiHandler(async () => {

        const user =
            vendeurMiddleware(req);

        const { uuid } =
            await params;

        const variantes =
            await ProduitVarianteService.findByProduit(
                uuid,
                user.id,
                user.role
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    variantes.length
                        ? "Variantes récupérées avec succès."
                        : "Aucune variante disponible.",
                data: variantes,
            },
            {
                status: 200,
            }
        );
    });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    return apiHandler(async () => {

        const user =
            vendeurMiddleware(req);

        const { uuid } =
            await params;

        const body =
            await req.json();

        const variante =
            await ProduitVarianteService.create(
                uuid,
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
                    "Variante créée avec succès.",
                data: variante,
            },
            {
                status: 201,
            }
        );
    });
}
