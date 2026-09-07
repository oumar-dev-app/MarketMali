import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { getAuthUser } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request);

        if (user.status !== "active") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Votre compte n'est pas actif.",
                },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const file = formData.get("file");
        const type = formData.get("type");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Aucun fichier reçu.",
                },
                { status: 400 }
            );
        }

        if (
            type !== "produit" &&
            type !== "boutique" &&
            type !== "categorie"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Type de fichier invalide.",
                },
                { status: 400 }
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le fichier doit être une image.",
                },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    message: "L'image ne doit pas dépasser 5 Mo.",
                },
                { status: 400 }
            );
        }

        const originalName = file.name
            .replace(/[^a-zA-Z0-9._-]/g, "-")
            .replace(/-+/g, "-");

        const folder =
            type === "boutique"
                ? "boutiques"
                : type === "categorie"
                    ? "categories"
                    : "produits";

        const filename =
            `${folder}/${Date.now()}-${originalName}`;

        const blob = await put(
            filename,
            file,
            {
                access: "public",
                addRandomSuffix: true,
            }
        );

        return NextResponse.json({
            success: true,
            url: blob.url,
        });

    } catch (error) {
        console.error(
            "Erreur upload image :",
            error
        );

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de télécharger l'image.",
            },
            { status: 500 }
        );
    }
}