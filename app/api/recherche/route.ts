import { NextRequest, NextResponse } from "next/server";

import { ProduitService } from "@/lib/services/produit.service";


export async function GET(
    req: NextRequest
) {

    try {

        const { searchParams } =
            new URL(req.url);


        const q =
            searchParams.get("q")?.trim() || undefined;

        const categorie =
            searchParams.get("categorie")?.trim() || undefined;

        const boutique =
            searchParams.get("boutique")?.trim() || undefined;


        const prixMinParam =
            searchParams.get("prix_min");

        const prixMaxParam =
            searchParams.get("prix_max");

        const noteMinParam =
            searchParams.get("note_min");


        const pageParam =
            searchParams.get("page");

        const limitParam =
            searchParams.get("limit");


        const enStockParam =
            searchParams.get("en_stock");

        const promotionParam =
            searchParams.get("promotion");


        const tri =
            searchParams.get("tri") || "pertinence";


        const prix_min =
            prixMinParam !== null &&
            prixMinParam !== ""
                ? Number(prixMinParam)
                : undefined;


        const prix_max =
            prixMaxParam !== null &&
            prixMaxParam !== ""
                ? Number(prixMaxParam)
                : undefined;


        const note_min =
            noteMinParam !== null &&
            noteMinParam !== ""
                ? Number(noteMinParam)
                : undefined;


        const page =
            pageParam !== null &&
            pageParam !== ""
                ? Number(pageParam)
                : 1;


        const limit =
            limitParam !== null &&
            limitParam !== ""
                ? Number(limitParam)
                : 24;


        const en_stock =
            enStockParam === "true";


        const promotion =
            promotionParam === "true";


        const triValide =
            tri === "prix_asc" ||
            tri === "prix_desc" ||
            tri === "note" ||
            tri === "recent" ||
            tri === "pertinence"
                ? tri
                : "pertinence";


        const result =
            await ProduitService.searchAdvanced({
                q,
                categorie,
                boutique,
                prix_min,
                prix_max,
                note_min,
                en_stock,
                promotion,
                tri: triValide,
                page,
                limit,
            });


        return NextResponse.json({

            success: true,

            message:
                "Recherche effectuée avec succès.",

            data:
                result.produits,

            pagination:
                result.pagination,

        });

    } catch (error) {

        console.error(
            "Erreur recherche produits :",
            error
        );


        return NextResponse.json({

            success: false,

            message:
                "Une erreur est survenue lors de la recherche.",

        }, {
            status: 500
        });

    }

}