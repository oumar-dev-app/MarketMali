import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { BoutiqueRepository } from "@/lib/repositories/boutique.repository";
import { ApiKeyService } from "@/lib/services/apiKey.service";
import { NotFoundError } from "@/lib/errors/NotFoundError";



export async function GET(
    req: NextRequest
) {


    return apiHandler(async () => {


        const user =
            vendeurMiddleware(req);



        const boutique =
            await BoutiqueRepository.findByUserId(
                user.id
            );



        if(!boutique){

            throw new NotFoundError(
                "Aucune boutique trouvée."
            );

        }



        const apiKeys =
            await ApiKeyService.listByBoutique(
                boutique.id
            );



        return NextResponse.json({

            success:true,

            data:apiKeys.map(key => ({

                uuid:key.uuid,

                name:key.name,

                status:key.status,

                last_used_at:key.last_used_at,

                expires_at:key.expires_at,

                created_at:key.created_at

            }))

        });


    });

}





export async function POST(
    req: NextRequest
) {


    return apiHandler(async () => {


        const user =
            vendeurMiddleware(req);



        const boutique =
            await BoutiqueRepository.findByUserId(
                user.id
            );



        if(!boutique){

            throw new NotFoundError(
                "Aucune boutique trouvée."
            );

        }



        const body =
            await req.json();



        const result =
            await ApiKeyService.create({

                boutique_id:
                    boutique.id,

                name:
                    body.name ?? "API Key"

            });



        return NextResponse.json(

            {
                success:true,

                message:
                    "API Key créée avec succès.",

                data:result
            },

            {
                status:201
            }

        );


    });

}