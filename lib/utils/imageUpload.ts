"use client";

import heic2any from "heic2any";

const MAX_INPUT_SIZE = 20 * 1024 * 1024;
const MAX_OUTPUT_SIZE = 4 * 1024 * 1024;
const MAX_DIMENSION = 2000;

function isHeicFile(file: File): boolean {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    return (
        type === "image/heic" ||
        type === "image/heif" ||
        type === "image/heic-sequence" ||
        type === "image/heif-sequence" ||
        name.endsWith(".heic") ||
        name.endsWith(".heif")
    );
}

async function blobToJpeg(
    blob: Blob,
    quality = 0.82
): Promise<Blob> {
    const bitmap = await createImageBitmap(blob);

    const ratio = Math.min(
        1,
        MAX_DIMENSION /
            Math.max(
                bitmap.width,
                bitmap.height
            )
    );

    const width = Math.max(
        1,
        Math.round(bitmap.width * ratio)
    );

    const height = Math.max(
        1,
        Math.round(bitmap.height * ratio)
    );

    const canvas =
        document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context =
        canvas.getContext("2d");

    if (!context) {
        bitmap.close();

        throw new Error(
            "Impossible de préparer l'image."
        );
    }

    context.drawImage(
        bitmap,
        0,
        0,
        width,
        height
    );

    bitmap.close();

    return new Promise(
        (resolve, reject) => {
            canvas.toBlob(
                (result) => {
                    if (!result) {
                        reject(
                            new Error(
                                "Impossible de compresser l'image."
                            )
                        );
                        return;
                    }

                    resolve(result);
                },
                "image/jpeg",
                quality
            );
        }
    );
}

export async function prepareImageForUpload(
    file: File
): Promise<File> {
    if (file.size > MAX_INPUT_SIZE) {
        throw new Error(
            "Cette image est trop volumineuse. Veuillez choisir une image de moins de 20 Mo."
        );
    }

    let sourceBlob: Blob = file;

    if (isHeicFile(file)) {
        try {
            const converted =
                await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.82,
                });

            sourceBlob =
                Array.isArray(converted)
                    ? converted[0]
                    : converted;
        } catch (error) {
            console.error(
                "Erreur conversion HEIC/HEIF :",
                error
            );

            throw new Error(
                "Cette photo iPhone n'a pas pu être convertie. Essayez une autre photo."
            );
        }
    }

    let jpeg =
        await blobToJpeg(
            sourceBlob,
            0.82
        );

    let quality = 0.82;

    while (
        jpeg.size > MAX_OUTPUT_SIZE &&
        quality > 0.45
    ) {
        quality -= 0.08;

        jpeg =
            await blobToJpeg(
                sourceBlob,
                quality
            );
    }

    if (jpeg.size > MAX_OUTPUT_SIZE) {
        throw new Error(
            "Impossible de réduire suffisamment cette image."
        );
    }

    const baseName =
        file.name
            .replace(/\.[^/.]+$/, "")
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            ) || "image";

    return new File(
        [jpeg],
        `${baseName}.jpg`,
        {
            type: "image/jpeg",
            lastModified: Date.now(),
        }
    );
}