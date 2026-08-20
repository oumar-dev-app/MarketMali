import { NextRequest } from "next/server";
import { requireApiKey } from "../../middleware/apiKey";
import { SynchronisationService } from "@/lib/services/synchronisation.service";
import { syncCategoriesSchema } from "@/lib/validation/synchronisation.validation";
import { ValidationError } from "@/lib/errors/ValidationError";


export async function POST(
    request: NextRequest
) {

    try {


        const apiKey =
            await requireApiKey(
                request
            );



        const body =
            await request.json();


        const validation =
            syncCategoriesSchema.safeParse(
                body
            );



        if (!validation.success) {

            throw new ValidationError(
                "Données de synchronisation invalides."
            );

        }



        const {
            categories
        } = validation.data;

console.log(categories);
const result =
    await SynchronisationService.syncCategories(
        apiKey.boutique_id,
        categories
    );



        return Response.json(
            {
                success: true,

                message:
                    "Catégories synchronisées avec succès.",

                data: result
            },
            {
                status: 200
            }
        );


    } catch (error: any) {


        return Response.json(
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