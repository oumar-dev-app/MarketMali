import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { getAuthUser } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";

export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request);

        if (user.status !== "active") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Votre compte n'est pas actif.",
                },
                { status: 403 }
            );
        }

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        const type =
            formData.get("type");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Aucun fichier reçu.",
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
                    message:
                        "Type de fichier invalide.",
                },
                { status: 400 }
            );
        }

        if (file.type !== "image/jpeg") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "L'image doit être au format JPEG après préparation.",
                },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "L'image préparée est encore trop volumineuse.",
                },
                { status: 400 }
            );
        }

        const folder =
            type === "boutique"
                ? "boutiques"
                : type === "categorie"
                    ? "categories"
                    : "produits";

        const filename =
            `${folder}/${Date.now()}-${crypto.randomUUID()}.jpg`;

        const blob = await put(
            filename,
            file,
            {
                access: "public",
                addRandomSuffix: true,
                contentType: "image/jpeg",
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

        if (
            error instanceof
            UnauthorizedError
        ) {
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