import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitVarianteService } from "@/lib/services/produitVariante.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

export async function POST(
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

        /*
         * Accepte :
         *
         * {
         *   "images": [
         *      {
         *        "image_url": "...",
         *        "ordre": 0
         *      },
         *      {
         *        "image_url": "...",
         *        "ordre": 1
         *      }
         *   ]
         * }
         *
         * et également une seule image :
         *
         * {
         *   "image_url": "...",
         *   "ordre": 0
         * }
         */

        let images;

        if (Array.isArray(body.images)) {
            images = body.images;
        } else {
            images = [
                {
                    image_url: body.image_url,
                    ordre: body.ordre,
                },
            ];
        }

        const result =
            await ProduitVarianteService.addImages(
                uuid,
                varianteUuid,
                user.id,
                user.role,
                images
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Photos ajoutées avec succès.",
                data: result,
            },
            {
                status: 201,
            }
        );
    });
}
