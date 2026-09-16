import { PoolConnection } from "mysql2/promise";

import { ProduitRepository } from "../repositories/produit.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { ProduitVarianteRepository } from "../repositories/produitVariante.repository";
import { ProduitVarianteImageRepository } from "../repositories/produitVarianteImage.repository";

import { db } from "../db";

import { generateUUID } from "../utils/uuid";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ConflictError } from "../errors/ConflictError";
import { ValidationError } from "../errors/ValidationError";

export interface CreateProduitVarianteDTO {
    nom: string;
    stock: number;
    ordre?: number;
}

export interface UpdateProduitVarianteDTO {
    nom?: string;
    stock?: number;
    ordre?: number;
}

export interface CreateProduitVarianteImageDTO {
    image_url: string;
    ordre?: number;
}

export class ProduitVarianteService {

    /**
     * Vérifie que l'utilisateur peut gérer le produit.
     */
    private static async verifyProduitAccess(
        produitUuid: string,
        user_id: number,
        role: string
    ) {

        const produit =
            await ProduitRepository.findByUUID(
                produitUuid
            );

        if (!produit) {
            throw new NotFoundError(
                "Produit introuvable."
            );
        }

        // Les administrateurs ont accès à tous les produits.
        if (
            role === "admin" ||
            role === "super_admin"
        ) {
            return produit;
        }

        const boutique =
            await BoutiqueRepository.findById(
                produit.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        if (
            boutique.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à ce produit."
            );
        }

        return produit;
    }

    /**
     * Liste les variantes d'un produit avec leurs photos.
     */
    static async findByProduit(
        produitUuid: string,
        user_id: number,
        role: string
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variantes =
            await ProduitVarianteRepository.findByProduitId(
                produit.id
            );

        const result = [];

        for (const variante of variantes) {

            const images =
                await ProduitVarianteImageRepository.findByVarianteId(
                    variante.id
                );

            result.push({
                id: variante.id,
                uuid: variante.uuid,
                produit_id: variante.produit_id,
                nom: variante.nom,
                image_url: variante.image_url,
                stock: variante.stock,
                ordre: variante.ordre,
                images: images.map(image => ({
                    id: image.id,
                    uuid: image.uuid,
                    image_url: image.image_url,
                    ordre: image.ordre,
                })),
                created_at: variante.created_at,
                updated_at: variante.updated_at,
            });
        }

        return result;
    }

    /**
     * Récupère les variantes d'un produit publiquement.
     *
     * Le produit doit être actif.
     */
    static async findByProduitPublic(
        produitUuid: string
    ) {

        const produit =
            await ProduitRepository.findByUUID(
                produitUuid
            );

        if (
            !produit ||
            produit.status !== "active"
        ) {
            throw new NotFoundError(
                "Produit introuvable."
            );
        }

        const variantes =
            await ProduitVarianteRepository.findByProduitId(
                produit.id
            );

        const result = [];

        for (const variante of variantes) {

            const images =
                await ProduitVarianteImageRepository.findByVarianteId(
                    variante.id
                );

            result.push({
                id: variante.id,
                uuid: variante.uuid,
                nom: variante.nom,
                stock: variante.stock,
                ordre: variante.ordre,

                // image_url est conservée pour
                // compatibilité avec l'ancien système.
                image_url: variante.image_url,

                images: images.map(image => ({
                    id: image.id,
                    uuid: image.uuid,
                    image_url: image.image_url,
                    ordre: image.ordre,
                })),
            });
        }

        return result;
    }

    /**
     * Création d'une variante.
     */
    static async create(
        produitUuid: string,
        user_id: number,
        role: string,
        data: CreateProduitVarianteDTO
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const nom =
            data.nom.trim();

        if (!nom) {
            throw new ValidationError(
                "Le nom de la variante est obligatoire."
            );
        }

        if (nom.length > 80) {
            throw new ValidationError(
                "Le nom de la variante ne peut pas dépasser 80 caractères."
            );
        }

        if (
            !Number.isInteger(data.stock) ||
            data.stock < 0
        ) {
            throw new ValidationError(
                "Le stock de la variante doit être un entier positif ou nul."
            );
        }

        if (
            data.ordre !== undefined &&
            (
                !Number.isInteger(data.ordre) ||
                data.ordre < 0
            )
        ) {
            throw new ValidationError(
                "L'ordre de la variante est invalide."
            );
        }

        const existing =
            await ProduitVarianteRepository.findByProduitIdAndNom(
                produit.id,
                nom
            );

        if (existing) {
            throw new ConflictError(
                "Cette variante existe déjà pour ce produit."
            );
        }

        const uuid =
            generateUUID();

        const id =
            await ProduitVarianteRepository.create({
                uuid,
                produit_id: produit.id,
                nom,
                stock: data.stock,
                ordre: data.ordre ?? 0,
                image_url: null,
            });

        const variante =
            await ProduitVarianteRepository.findById(
                id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable après création."
            );
        }

        return {
            id: variante.id,
            uuid: variante.uuid,
            produit_id: variante.produit_id,
            nom: variante.nom,
            stock: variante.stock,
            ordre: variante.ordre,
            image_url: variante.image_url,
            images: [],
            created_at: variante.created_at,
            updated_at: variante.updated_at,
        };
    }

    /**
     * Modification d'une variante.
     */
    static async update(
        produitUuid: string,
        varianteUuid: string,
        user_id: number,
        role: string,
        data: UpdateProduitVarianteDTO
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variante =
            await ProduitVarianteRepository.findByUUIDAndProduitId(
                varianteUuid,
                produit.id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable."
            );
        }

        const updateData: UpdateProduitVarianteDTO = {};

        if (data.nom !== undefined) {

            const nom =
                data.nom.trim();

            if (!nom) {
                throw new ValidationError(
                    "Le nom de la variante est obligatoire."
                );
            }

            if (nom.length > 80) {
                throw new ValidationError(
                    "Le nom de la variante ne peut pas dépasser 80 caractères."
                );
            }

            if (nom !== variante.nom) {

                const existing =
                    await ProduitVarianteRepository.findByProduitIdAndNom(
                        produit.id,
                        nom
                    );

                if (
                    existing &&
                    existing.id !== variante.id
                ) {
                    throw new ConflictError(
                        "Cette variante existe déjà pour ce produit."
                    );
                }
            }

            updateData.nom = nom;
        }

        if (data.stock !== undefined) {

            if (
                !Number.isInteger(data.stock) ||
                data.stock < 0
            ) {
                throw new ValidationError(
                    "Le stock de la variante doit être un entier positif ou nul."
                );
            }

            updateData.stock =
                data.stock;
        }

        if (data.ordre !== undefined) {

            if (
                !Number.isInteger(data.ordre) ||
                data.ordre < 0
            ) {
                throw new ValidationError(
                    "L'ordre de la variante est invalide."
                );
            }

            updateData.ordre =
                data.ordre;
        }

        if (
            !Object.keys(updateData).length
        ) {
            const images =
                await ProduitVarianteImageRepository.findByVarianteId(
                    variante.id
                );

            return {
                id: variante.id,
                uuid: variante.uuid,
                produit_id: variante.produit_id,
                nom: variante.nom,
                stock: variante.stock,
                ordre: variante.ordre,
                image_url: variante.image_url,
                images: images.map(image => ({
                    id: image.id,
                    uuid: image.uuid,
                    image_url: image.image_url,
                    ordre: image.ordre,
                })),
                created_at: variante.created_at,
                updated_at: variante.updated_at,
            };
        }

        await ProduitVarianteRepository.update(
            variante.id,
            updateData
        );

        const updated =
            await ProduitVarianteRepository.findById(
                variante.id
            );

        if (!updated) {
            throw new NotFoundError(
                "Variante introuvable après modification."
            );
        }

        const images =
            await ProduitVarianteImageRepository.findByVarianteId(
                updated.id
            );

        return {
            id: updated.id,
            uuid: updated.uuid,
            produit_id: updated.produit_id,
            nom: updated.nom,
            stock: updated.stock,
            ordre: updated.ordre,
            image_url: updated.image_url,
            images: images.map(image => ({
                id: image.id,
                uuid: image.uuid,
                image_url: image.image_url,
                ordre: image.ordre,
            })),
            created_at: updated.created_at,
            updated_at: updated.updated_at,
        };
    }

    /**
     * Suppression d'une variante.
     *
     * Les photos sont supprimées automatiquement grâce
     * à la FK ON DELETE CASCADE.
     */
    static async delete(
        produitUuid: string,
        varianteUuid: string,
        user_id: number,
        role: string
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variante =
            await ProduitVarianteRepository.findByUUIDAndProduitId(
                varianteUuid,
                produit.id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable."
            );
        }

        await ProduitVarianteRepository.delete(
            variante.id
        );

        return {
            message:
                "Variante supprimée avec succès."
        };
    }

    /**
     * Ajoute une photo à une variante.
     */
    static async addImage(
        produitUuid: string,
        varianteUuid: string,
        user_id: number,
        role: string,
        data: CreateProduitVarianteImageDTO
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variante =
            await ProduitVarianteRepository.findByUUIDAndProduitId(
                varianteUuid,
                produit.id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable."
            );
        }

        const imageUrl =
            data.image_url.trim();

        if (!imageUrl) {
            throw new ValidationError(
                "L'URL de l'image est obligatoire."
            );
        }

        if (imageUrl.length > 500) {
            throw new ValidationError(
                "L'URL de l'image est trop longue."
            );
        }

        if (
            data.ordre !== undefined &&
            (
                !Number.isInteger(data.ordre) ||
                data.ordre < 0
            )
        ) {
            throw new ValidationError(
                "L'ordre de l'image est invalide."
            );
        }

        const uuid =
            generateUUID();

        const id =
            await ProduitVarianteImageRepository.create({
                uuid,
                variante_id: variante.id,
                image_url: imageUrl,
                ordre: data.ordre ?? 0,
            });

        const image =
            await ProduitVarianteImageRepository.findById(
                id
            );

        if (!image) {
            throw new NotFoundError(
                "Image introuvable après ajout."
            );
        }

        return {
            id: image.id,
            uuid: image.uuid,
            variante_id: image.variante_id,
            image_url: image.image_url,
            ordre: image.ordre,
            created_at: image.created_at,
            updated_at: image.updated_at,
        };
    }

    /**
     * Ajoute plusieurs photos à une variante.
     */
    static async addImages(
        produitUuid: string,
        varianteUuid: string,
        user_id: number,
        role: string,
        images: CreateProduitVarianteImageDTO[]
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variante =
            await ProduitVarianteRepository.findByUUIDAndProduitId(
                varianteUuid,
                produit.id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable."
            );
        }

        if (!images.length) {
            throw new ValidationError(
                "Au moins une image est requise."
            );
        }

        for (const image of images) {

            const imageUrl =
                image.image_url.trim();

            if (!imageUrl) {
                throw new ValidationError(
                    "L'URL d'une image est obligatoire."
                );
            }

            if (imageUrl.length > 500) {
                throw new ValidationError(
                    "L'URL d'une image est trop longue."
                );
            }

            if (
                image.ordre !== undefined &&
                (
                    !Number.isInteger(image.ordre) ||
                    image.ordre < 0
                )
            ) {
                throw new ValidationError(
                    "L'ordre d'une image est invalide."
                );
            }
        }

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            const rows = images.map(
                (image, index) => ({
                    uuid: generateUUID(),
                    variante_id: variante.id,
                    image_url: image.image_url.trim(),
                    ordre: image.ordre ?? index,
                })
            );

            await ProduitVarianteImageRepository.createMany(
                rows,
                connection
            );

            await connection.commit();

            return await ProduitVarianteImageRepository.findByVarianteId(
                variante.id
            );

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Supprime une photo d'une variante.
     */
    static async deleteImage(
        produitUuid: string,
        varianteUuid: string,
        imageUuid: string,
        user_id: number,
        role: string
    ) {

        const produit =
            await this.verifyProduitAccess(
                produitUuid,
                user_id,
                role
            );

        const variante =
            await ProduitVarianteRepository.findByUUIDAndProduitId(
                varianteUuid,
                produit.id
            );

        if (!variante) {
            throw new NotFoundError(
                "Variante introuvable."
            );
        }

        const image =
            await ProduitVarianteImageRepository.findByUUID(
                imageUuid
            );

        if (!image) {
            throw new NotFoundError(
                "Image introuvable."
            );
        }

        if (
            image.variante_id !== variante.id
        ) {
            throw new ForbiddenError(
                "Cette image n'appartient pas à cette variante."
            );
        }

        await ProduitVarianteImageRepository.delete(
            image.id
        );

        return {
            message:
                "Image supprimée avec succès."
        };
    }
}
