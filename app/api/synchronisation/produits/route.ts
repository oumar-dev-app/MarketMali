import { NextRequest, NextResponse } from "next/server";

import { requireApiKey } from "../../middleware/apiKey";

import { SynchronisationService } from "@/lib/services/synchronisation.service";

import {
    syncProduitsSchema
} from "@/lib/validation/synchronisation.validation";

import { ValidationError } from "@/lib/errors/ValidationError";


export async function POST(
    request: NextRequest
) {

    try {


        const apiKey =
            await requireApiKey(request);



        const body =
            await request.json();



        const validation =
            syncProduitsSchema.safeParse(body);



        if (!validation.success) {

            throw new ValidationError(
                "Données de synchronisation des produits invalides."
            );

        }



        const {
            produits
        } = validation.data;

        console.log("PRODUITS VALIDES :", produits);

        const result =
            await SynchronisationService.syncProduits(
                apiKey.boutique_id,
                produits
            );



        return NextResponse.json(
            {
                success: true,

                message:
                    "Produits synchronisés avec succès.",

                data: result
            },
            {
                status: 200
            }
        );


    } catch (error: any) {


        return NextResponse.json(
            {
                success: false,

                message:
                    error.message ??
                    "Erreur serveur."
            },
            {
                status:
                    error.statusCode ?? 500
            }
        );

    }

}