import { CommandeRepository } from "../repositories/commande.repository";
import { CommandeProduitRepository } from "../repositories/commandeProduit.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { ProduitRepository } from "../repositories/produit.repository";
import { CommandeStatutRepository } from "../repositories/commandeStatut.repository";
import { TarifLivraisonRepository } from "../repositories/tarifLivraison.repository";
import { NotificationService } from "./notification.service";
import { generateUUID } from "../utils/uuid";
import { LivreurRepository } from "../repositories/livreur.repository";
import { LivraisonRepository } from "../repositories/livraison.repository";
import { LivraisonSecuriteService } from "./livraison-securite.service";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { PromotionRepository } from "../repositories/promotion.repository";


import {
    CreateCommandeDTO,
    UpdateCommandeDTO,
    CommandeStatus
} from "../types/commande";
import { db } from "../db";



export class CommandeService {

    static async create(
        data: CreateCommandeDTO,
        client_id: number
    ) {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            // =========================================================
            // 1 - Vérifier la boutique
            // =========================================================

            const boutique =
                await BoutiqueRepository.findById(
                    data.boutique_id
                );

            if (!boutique) {
                throw new NotFoundError(
                    "Boutique introuvable."
                );
            }

            // =========================================================
            // 2 - Préparer les produits
            // =========================================================

            let total = 0;

            const produitsCommande: {
                produit_id: number;
                quantite: number;
                prix: number;
                promotion_id: number | null;
            }[] = [];

            // Éviter qu'un même produit soit envoyé plusieurs fois
            // dans la même commande.
            const quantitesProduits = new Map<number, number>();

            for (const item of data.produits) {

                const quantiteExistante =
                    quantitesProduits.get(
                        item.produit_id
                    ) ?? 0;

                quantitesProduits.set(
                    item.produit_id,
                    quantiteExistante + item.quantite
                );
            }

            // =========================================================
            // 3 - Vérifier chaque produit et sa promotion
            // =========================================================

            for (
                const [
                    produit_id,
                    quantite
                ] of quantitesProduits
            ) {

                const produit =
                    await ProduitRepository.findById(
                        produit_id
                    );

                if (!produit) {
                    throw new NotFoundError(
                        "Produit introuvable."
                    );
                }

                // Le produit doit appartenir à la boutique
                if (
                    produit.boutique_id !==
                    data.boutique_id
                ) {
                    throw new ForbiddenError(
                        "Ce produit n'appartient pas à cette boutique."
                    );
                }

                // Le produit doit être actif
                if (
                    produit.status !== "active"
                ) {
                    throw new ForbiddenError(
                        `Le produit "${produit.nom}" n'est pas disponible.`
                    );
                }

                // Vérification du stock
                if (
                    produit.stock < quantite
                ) {
                    throw new ForbiddenError(
                        `Stock insuffisant pour ${produit.nom}.`
                    );
                }

                const prixNormal =
                    Number(produit.prix);

                let prixFinal =
                    prixNormal;

                let promotionId:
                    number | null = null;

                // =====================================================
                // Vérifier la promotion active
                // =====================================================

                const promotion =
                    await PromotionRepository.findActiveByProduit(
                        produit.id,
                        connection
                    );

                if (promotion) {

                    // La promotion doit également appartenir
                    // à la même boutique que le produit.
                    if (
                        promotion.boutique_id !==
                        data.boutique_id
                    ) {
                        throw new ForbiddenError(
                            "Promotion invalide pour ce produit."
                        );
                    }

                    // -------------------------------------------------
                    // Calcul du prix promotionnel
                    // -------------------------------------------------

                    if (
                        promotion.type === "percentage"
                    ) {

                        const reduction =
                            Number(
                                promotion.reduction_pourcentage
                            );

                        if (
                            !Number.isFinite(reduction) ||
                            reduction <= 0 ||
                            reduction >= 100
                        ) {
                            throw new ForbiddenError(
                                `La promotion "${promotion.nom}" est invalide.`
                            );
                        }

                        prixFinal =
                            prixNormal -
                            (
                                prixNormal *
                                reduction /
                                100
                            );

                    } else if (
                        promotion.type === "special_price"
                    ) {

                        const prixPromotionnel =
                            Number(
                                promotion.prix_promotionnel
                            );

                        if (
                            !Number.isFinite(
                                prixPromotionnel
                            ) ||
                            prixPromotionnel < 0 ||
                            prixPromotionnel >= prixNormal
                        ) {
                            throw new ForbiddenError(
                                `Le prix promotionnel de "${promotion.nom}" est invalide.`
                            );
                        }

                        prixFinal =
                            prixPromotionnel;
                    }

                    // -------------------------------------------------
                    // Vérifier la quantité maximale de la promotion
                    // -------------------------------------------------

                    if (
                        promotion.quantite_limite !== null
                    ) {

                        const quantiteVendue =
                            await PromotionRepository.getQuantiteVendue(
                                promotion.id,
                                connection
                            );

                        const quantiteRestante =
                            Number(
                                promotion.quantite_limite
                            ) -
                            quantiteVendue;

                        if (
                            quantite > quantiteRestante
                        ) {
                            throw new ForbiddenError(
                                `La promotion "${promotion.nom}" ne dispose plus que de ${Math.max(
                                    0,
                                    quantiteRestante
                                )} unité(s) disponible(s).`
                            );
                        }
                    }

                    promotionId =
                        promotion.id;
                }

                // =====================================================
                // Calcul serveur du prix
                // =====================================================

                total +=
                    prixFinal *
                    quantite;

                produitsCommande.push({
                    produit_id:
                        produit.id,

                    quantite,

                    prix:
                        Number(
                            prixFinal.toFixed(2)
                        ),

                    promotion_id:
                        promotionId
                });
            }

            // =========================================================
            // 4 - Vérifier la zone de livraison
            // =========================================================

            const zoneLivraison =
                data.zone_livraison?.trim();

            if (!zoneLivraison) {
                throw new ForbiddenError(
                    "La zone de livraison est obligatoire."
                );
            }

            // =========================================================
            // 5 - Calcul serveur des frais de livraison
            // =========================================================

            const tarifLivraison =
                await TarifLivraisonRepository.findByBoutiqueAndZone(
                    data.boutique_id,
                    zoneLivraison
                );

            if (!tarifLivraison) {
                throw new NotFoundError(
                    "Aucun tarif de livraison n'est défini pour cette zone."
                );
            }

            const fraisLivraison =
                Number(
                    tarifLivraison.frais
                );

            // =========================================================
            // 6 - Total final serveur
            // =========================================================

            const totalCommande =
                Number(
                    (
                        total +
                        fraisLivraison
                    ).toFixed(2)
                );

            // =========================================================
            // 7 - Créer la commande
            // =========================================================

            const uuid =
                generateUUID();

            const commandeId =
                await CommandeRepository.create(
                    {
                        uuid,

                        boutique_id:
                            data.boutique_id,

                        client_id,

                        zone_livraison:
                            zoneLivraison,

                        total:
                            totalCommande,

                        frais_livraison:
                            fraisLivraison,

                        adresse_livraison:
                            data.adresse_livraison,

                        latitude:
                            data.latitude,

                        longitude:
                            data.longitude,

                        gps_precision:
                            data.gps_precision
                    },
                    connection
                );

            // =========================================================
            // 8 - Créer les lignes de commande
            // =========================================================

            await CommandeProduitRepository.createMany(
                commandeId,
                produitsCommande,
                connection
            );

            // =========================================================
            // 9 - Historique du statut
            // =========================================================

            await CommandeStatutRepository.create(
                commandeId,
                "pending",
                "Commande créée.",
                connection
            );

            // =========================================================
            // 10 - Diminuer les stocks
            // =========================================================

            for (
                const item of produitsCommande
            ) {

                await ProduitRepository.decreaseStock(
                    item.produit_id,
                    item.quantite,
                    connection
                );
            }

            // =========================================================
            // 11 - Valider la transaction
            // =========================================================

            await connection.commit();

            // =========================================================
            // 12 - Notification vendeur
            // =========================================================

            await NotificationService.create({
                user_id:
                    boutique.user_id,

                commande_id:
                    commandeId,

                type:
                    "new_order",

                titre:
                    "Nouvelle commande",

                message:
                    `Une nouvelle commande vient d'être passée dans votre boutique. ` +
                    `Montant total : ${totalCommande} FCFA.`
            });

            // =========================================================
            // 13 - Retourner la commande
            // =========================================================

            return CommandeRepository.findById(
                commandeId
            );

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    }

    static async findByUUID(
        uuid: string
    ) {
        const commande =
            await CommandeRepository.findByUUID(
                uuid
            );

        if (!commande) {

            throw new NotFoundError(
                "Commande introuvable."
            );
        }
        const produits =
            await CommandeProduitRepository.findByCommandeId(
                commande.id
            );

        const historique =
            await CommandeStatutRepository.findByCommandeId(
                commande.id
            );

        return {
            uuid: commande.uuid,

            total: commande.total,

            frais_livraison:
                commande.frais_livraison,

            status: commande.status,

            zone_livraison:
                commande.zone_livraison,

            created_at: commande.created_at,
            updated_at: commande.updated_at,

            adresse_livraison:
                commande.adresse_livraison,

            latitude:
                commande.latitude,

            longitude:
                commande.longitude,

            gps_precision:
                commande.gps_precision,

            boutique: {
                uuid: commande.boutique_uuid,
                nom: commande.boutique_nom,
                slug: commande.boutique_slug
            },

            client: {
                uuid: commande.client_uuid,
                nom: commande.client_nom ?? "Client supprimé",
                prenom: commande.client_prenom ?? "",
                telephone: commande.client_telephone ?? "-",
                email: commande.client_email ?? "-"
            },

            livreur: commande.livreur_uuid
                ? {
                    uuid: commande.livreur_uuid,
                    nom: commande.livreur_nom,
                    prenom: commande.livreur_prenom,
                    telephone: commande.livreur_telephone,
                    vehicule: commande.livreur_vehicule,
                    status: commande.livreur_status,
                    disponibilite:
                        commande.livreur_disponibilite
                }
                : null,

            produits,
            historique
        };
    }


    static async findByUser(
        user_id: number,
        role: string,
        page: number = 1,
        limit: number = 20,
        search: string = "",
        status?: string
    ) {
        const offset = (page - 1) * limit;
        if (
            role === "admin" ||
            role === "super_admin"
        ) {
            const commandes =
                await CommandeRepository.findAll();

            const statistics =
                await CommandeRepository.countStatuses();

            return {
                data: commandes,

                pagination: {
                    page,
                    limit,
                    total: statistics.total,
                    totalPages: Math.ceil(
                        statistics.total / limit
                    )
                },

                statistics
            };
        }

        if (role === "vendeur") {

            const commandes =
                await CommandeRepository.findByUserId(
                    user_id,
                    limit,
                    offset,
                    search,
                    status
                );

            const statistics =
                await CommandeRepository.countStatusesByUser(
                    user_id
                );


            return {
                data: commandes,

                pagination: {
                    page,
                    limit,
                    total: statistics.total,
                    totalPages: Math.ceil(
                        statistics.total / limit
                    )
                },

                statistics
            };
        }

        if (role === "client") {

            const commandes =
                await CommandeRepository.findByClientId(
                    user_id,
                    limit,
                    offset,
                    search,
                    status
                );

            const statistics =
                await CommandeRepository.countStatusesByClient(
                    user_id
                );

            return {
                data: commandes,

                pagination: {
                    page,
                    limit,

                    total:
                        statistics.total,

                    totalPages:
                        Math.ceil(
                            statistics.total / limit
                        )
                },

                statistics
            };
        }
        throw new ForbiddenError(
            "Accès refusé."
        );
    }

    static async assignLivreur(
        uuid: string,
        livreur_uuid: string,
        user_id: number,
        role: string
    ) {



        const commande =
            await CommandeRepository.findByUUID(uuid);

        console.log(
            "Commande trouvée :",
            commande
        );

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        // Les commandes terminées ou annulées
        // ne peuvent plus recevoir de livreur
        if (commande.status !== "preparing") {
            throw new ForbiddenError(
                "Un livreur ne peut être affecté qu'à une commande en préparation."
            );
        }

        // Vérifier la boutique
        const boutique =
            await BoutiqueRepository.findById(
                commande.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        // Vérifier les droits
        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à cette commande."
            );
        }

        // Chercher le nouveau livreur
        const livreur =
            await LivreurRepository.findByUUID(
                livreur_uuid
            );

        if (!livreur) {
            throw new NotFoundError(
                "Livreur introuvable."
            );
        }

        // Le livreur doit appartenir à la même boutique
        if (
            livreur.boutique_id !==
            commande.boutique_id
        ) {
            throw new ForbiddenError(
                "Ce livreur n'appartient pas à cette boutique."
            );
        }

        // Le livreur doit être actif
        if (
            livreur.status !== "active"
        ) {
            throw new ForbiddenError(
                "Ce livreur n'est pas actif."
            );
        }

        // Si on essaie de réaffecter
        // le même livreur
        if (
            commande.livreur_id === livreur.id
        ) {
            throw new ForbiddenError(
                "Ce livreur est déjà affecté à cette commande."
            );
        }

        // Le nouveau livreur doit être disponible
        if (
            livreur.disponibilite !== "available"
        ) {
            throw new ForbiddenError(
                "Ce livreur n'est pas disponible."
            );
        }

        const connection =
            await db.getConnection();

        let qrToken: string;

        try {

            await connection.beginTransaction();

            // Si un ancien livreur existe,
            // il redevient disponible
            if (commande.livreur_id) {

                const ancienLivreur =
                    await LivreurRepository.findById(
                        commande.livreur_id
                    );

                if (
                    ancienLivreur &&
                    ancienLivreur.status === "active"
                ) {

                    await LivreurRepository.updateDisponibilite(
                        ancienLivreur.id,
                        "available",
                        connection
                    );
                }
            }

            // Affecter le nouveau livreur à la commande
            await CommandeRepository.assignLivreur(
                commande.id,
                livreur.id,
                connection
            );


            // Vérifier s'il existe déjà une livraison
            let livraison =
                await LivraisonRepository.findByCommandeId(
                    commande.id,
                    connection
                );

            // Créer ou réaffecter la livraison
            // Créer ou réaffecter la livraison
            if (livraison) {

                /*
                 * Une livraison existe déjà pour cette commande.
                 *
                 * Même si elle est "cancelled", on la réutilise
                 * au lieu d'en créer une nouvelle.
                 *
                 * Cela respecte la contrainte unique :
                 * uk_livraisons_commande
                 */

                await LivraisonRepository.updateLivreur(
                    livraison.id,
                    livreur.id,
                    connection
                );

                await LivraisonRepository.updateStatus(
                    livraison.id,
                    "assigned",
                    undefined,
                    connection
                );

                livraison =
                    await LivraisonRepository.findById(
                        livraison.id,
                        connection
                    );

            } else {

                /*
                 * Première affectation :
                 * aucune livraison n'existe encore.
                 */

                const livraisonId =
                    await LivraisonRepository.create(
                        {
                            uuid: generateUUID(),
                            commande_id: commande.id,
                            livreur_id: livreur.id
                        },
                        connection
                    );

                livraison =
                    await LivraisonRepository.findById(
                        livraisonId,
                        connection
                    );
            }

            if (!livraison) {
                throw new NotFoundError(
                    "Impossible de récupérer la livraison créée."
                );
            }

            // Générer le QR et l'OTP de sécurité.
            // Les valeurs en clair sont retournées uniquement
            // par le service et les hash sont enregistrés en base.
            const securite =
                await LivraisonSecuriteService.generatePickupQr(
                    livraison.id,
                    connection
                );

            qrToken = securite.qrToken;

            // Le nouveau livreur devient indisponible
            await LivreurRepository.updateDisponibilite(
                livreur.id,
                "unavailable",
                connection
            );

            await connection.commit();

            /*
             * Notification au client.
             */
            await NotificationService.create({
                user_id: commande.client_id,
                commande_id: commande.id,
                type: "order_status",
                titre: "Livreur affecté",
                message:
                    `Un livreur a été affecté à votre commande #${commande.id}.`
            });

            /*
             * Notification au livreur.
             */
            /*
             * Notification au livreur.
             */
            console.log("=== NOTIFICATION LIVREUR ===");
            console.log({
                livreur_id: livreur.id,
                livreur_user_id: livreur.user_id,
                commande_id: commande.id,
            });

            if (livreur.user_id !== null) {
                const notificationId =
                    await NotificationService.create({
                        user_id: livreur.user_id,
                        commande_id: commande.id,
                        type: "delivery_assigned",
                        titre: "Nouvelle livraison",
                        message:
                            `Une nouvelle livraison vous a été assignée pour la commande #${commande.id}.`
                    });

                console.log(
                    "NOTIFICATION LIVREUR CRÉÉE :",
                    notificationId
                );
            }

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }

        return {
            message:
                "Livreur affecté à la commande avec succès.",

            livreur: {
                uuid: livreur.uuid,
                nom: livreur.nom,
                prenom: livreur.prenom,
                telephone: livreur.telephone,
                vehicule: livreur.vehicule
            },

            qrToken
        };
    }

    static async unassignLivreur(
        uuid: string,
        user_id: number,
        role: string
    ) {

        const commande =
            await CommandeRepository.findByUUID(uuid);

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        if (commande.status !== "preparing") {
            throw new ForbiddenError(
                "Un livreur ne peut être affecté qu'à une commande en préparation."
            );
        }

        const boutique =
            await BoutiqueRepository.findById(
                commande.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        // Vérifier les droits
        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à cette commande."
            );
        }

        if (!commande.livreur_id) {
            throw new ForbiddenError(
                "Aucun livreur n'est affecté à cette commande."
            );
        }

        const livraison =
            await LivraisonRepository.findByCommandeId(
                commande.id
            );

        if (
            livraison &&
            (
                livraison.status === "picked_up" ||
                livraison.status === "in_transit" ||
                livraison.status === "delivered"
            )
        ) {
            throw new ForbiddenError(
                "Le livreur ne peut plus être retiré après le début de la livraison."
            );
        }

        const livreur =
            await LivreurRepository.findById(
                commande.livreur_id
            );

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            // Retirer le livreur de la commande
            await CommandeRepository.unassignLivreur(
                commande.id,
                connection
            );

            // Annuler la livraison associée
            if (livraison) {

                await LivraisonRepository.updateStatus(
                    livraison.id,
                    "cancelled",
                    "Livreur retiré de la commande.",
                    connection
                );
            }

            // Rendre le livreur disponible
            if (
                livreur &&
                livreur.status === "active"
            ) {

                await LivreurRepository.updateDisponibilite(
                    livreur.id,
                    "available",
                    connection
                );
            }

            await connection.commit();

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }

        return {
            message:
                "Livreur retiré de la commande avec succès."
        };
    }

    static async updateStatus(
        uuid: string,
        user_id: number,
        role: string,
        status: CommandeStatus,
        commentaire?: string
    ) {

        const commande =
            await CommandeRepository.findByUUID(uuid);

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        const boutique =
            await BoutiqueRepository.findById(
                commande.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        // Vérifier les droits
        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à cette commande."
            );
        }
        // Les statuts liés à la livraison ne sont pas modifiables
        // par le vendeur depuis cet endpoint.
        if (
            status === "shipped" ||
            status === "delivered"
        ) {
            throw new ForbiddenError(
                "Ce statut est géré par le processus de livraison."
            );
        }

        // Empêcher une transition vers le même statut
        if (commande.status === status) {
            throw new ForbiddenError(
                "La commande possède déjà ce statut."
            );
        }

        // Transitions autorisées
        const transitions: Record<
            CommandeStatus,
            CommandeStatus[]
        > = {
            pending: [
                "confirmed",
                "cancelled"
            ],

            confirmed: [
                "preparing",
                "cancelled"
            ],

            preparing: [
                "shipped",
                "cancelled"
            ],

            shipped: [],

            delivered: [],

            cancelled: []
        };

        if (
            !transitions[commande.status].includes(
                status
            )
        ) {
            throw new ForbiddenError(
                `Transition impossible : ${commande.status} → ${status}.`
            );
        }

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            /*
             * 1. Mettre à jour le statut
             */
            await CommandeRepository.updateStatus(
                commande.id,
                status,
                connection
            );

            /*
             * 2. Ajouter l'historique
             */
            await CommandeStatutRepository.create(
                commande.id,
                status,
                commentaire?.trim() || undefined,
                connection
            );

            /*
             * 3. Si la commande est annulée,
             * restaurer le stock.
             */
            if (status === "cancelled") {

                const produits =
                    await CommandeProduitRepository.findByCommandeId(
                        commande.id
                    );

                for (const produit of produits) {

                    await ProduitRepository.increaseStock(
                        produit.produit_id,
                        produit.quantite,
                        connection
                    );
                }

                /*
                 * Libérer le livreur s'il existe.
                 */
                if (commande.livreur_id) {

                    const livreur =
                        await LivreurRepository.findById(
                            commande.livreur_id
                        );

                    if (
                        livreur &&
                        livreur.status === "active"
                    ) {

                        await LivreurRepository.updateDisponibilite(
                            livreur.id,
                            "available",
                            connection
                        );
                    }

                    /*
                     * Retirer le livreur de la commande.
                     */
                    await CommandeRepository.unassignLivreur(
                        commande.id,
                        connection
                    );

                    /*
                     * Annuler également la livraison
                     * associée si elle existe.
                     */
                    const livraison =
                        await LivraisonRepository.findByCommandeId(
                            commande.id,
                            connection
                        );

                    if (
                        livraison &&
                        livraison.status !== "delivered" &&
                        livraison.status !== "cancelled"
                    ) {

                        await LivraisonRepository.updateStatus(
                            livraison.id,
                            "cancelled",
                            "Commande annulée.",
                            connection
                        );
                    }
                }
            }

            await connection.commit();

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }

        /*
         * Notification au client.
         */
        const statusMessages: Record<
            CommandeStatus,
            {
                titre: string;
                message: string;
            }
        > = {

            pending: {
                titre: "Commande en attente",
                message:
                    `Votre commande #${commande.id} est en attente.`
            },

            confirmed: {
                titre: "Commande confirmée",
                message:
                    `Votre commande #${commande.id} a été confirmée.`
            },

            preparing: {
                titre: "Commande en préparation",
                message:
                    `Votre commande #${commande.id} est en préparation.`
            },

            shipped: {
                titre: "Commande expédiée",
                message:
                    `Votre commande #${commande.id} a été expédiée.`
            },

            delivered: {
                titre: "Commande livrée",
                message:
                    `Votre commande #${commande.id} a été livrée.`
            },

            cancelled: {
                titre: "Commande annulée",
                message:
                    `Votre commande #${commande.id} a été annulée.`
            }
        };

        const notification =
            statusMessages[status];

        await NotificationService.create({
            user_id: commande.client_id,

            commande_id: commande.id,

            type:
                status === "cancelled"
                    ? "order_cancelled"
                    : "order_status",

            titre:
                notification.titre,

            message:
                commentaire?.trim()
                    ? `${notification.message} Motif : ${commentaire.trim()}`
                    : notification.message
        });

        return {
            message:
                "Statut de la commande mis à jour avec succès."
        };
    }

    static async cancelByClient(
        uuid: string,
        client_id: number,
        commentaire?: string
    ) {

        const commande =
            await CommandeRepository.findByUUID(
                uuid
            );

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        // Vérifier que la commande appartient au client
        if (commande.client_id !== client_id) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à cette commande."
            );
        }

        // Le client peut uniquement annuler une commande pending
        if (commande.status !== "pending") {
            throw new ForbiddenError(
                "Cette commande ne peut plus être annulée."
            );
        }

        // Vérifier la boutique
        const boutique =
            await BoutiqueRepository.findById(
                commande.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        // Récupérer les produits avant la transaction
        const produits =
            await CommandeProduitRepository.findByCommandeId(
                commande.id
            );

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            // 1 - Restaurer les stocks
            for (const produit of produits) {

                await ProduitRepository.increaseStock(
                    produit.produit_id,
                    produit.quantite,
                    connection
                );
            }

            // 2 - Mettre la commande en cancelled
            await CommandeRepository.updateStatus(
                commande.id,
                "cancelled",
                connection
            );

            // 3 - Ajouter l'historique
            await CommandeStatutRepository.create(
                commande.id,
                "cancelled",
                commentaire?.trim() ||
                "Commande annulée par le client.",
                connection
            );

            // Libérer le livreur s'il y en a un
            if (commande.livreur_id) {

                const livreur =
                    await LivreurRepository.findById(
                        commande.livreur_id
                    );

                if (
                    livreur &&
                    livreur.status === "active"
                ) {

                    await LivreurRepository.updateDisponibilite(
                        livreur.id,
                        "available",
                        connection
                    );
                }

                await CommandeRepository.unassignLivreur(
                    commande.id,
                    connection
                );
            }

            // 4 - Valider la transaction
            await connection.commit();

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }

        // 5 - Notification vendeur
        await NotificationService.create({
            user_id: boutique.user_id,
            commande_id: commande.id,
            type: "order_cancelled",
            titre: "Commande annulée",
            message:
                commentaire?.trim()
                    ? `Le client a annulé sa commande. Motif : ${commentaire.trim()}`
                    : "Le client a annulé sa commande."
        });

        return {
            message:
                "Commande annulée avec succès."
        };
    }

    static async delete(
        uuid: string,
        user_id: number,
        role: string
    ) {
        const commande =
            await CommandeRepository.findByUUID(
                uuid
            );

        if (!commande) {

            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        const boutique =
            await BoutiqueRepository.findById(
                commande.boutique_id
            );

        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique?.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès."
            );
        }
        await CommandeRepository.delete(
            commande.id
        );

        return {
            message:
                "Commande supprimée avec succès."
        };
    }

    static async findByUUIDForUser(
        uuid: string,
        user_id: number,
        role: string
    ) {
        const commande =
            await CommandeRepository.findByUUID(uuid);

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        // Admin peut tout voir
        if (
            role === "admin" ||
            role === "super_admin"
        ) {
            return await this.findByUUID(uuid);
        }

        // Client : uniquement ses commandes
        if (role === "client") {
            if (
                commande.client_id !== user_id
            ) {
                throw new ForbiddenError(
                    "Vous n'avez pas accès à cette commande."
                );
            }

            return await this.findByUUID(uuid);
        }

        // Vendeur : uniquement les commandes de sa boutique
        if (role === "vendeur") {
            const boutique =
                await BoutiqueRepository.findById(
                    commande.boutique_id
                );

            if (
                !boutique ||
                boutique.user_id !== user_id
            ) {
                throw new ForbiddenError(
                    "Vous n'avez pas accès à cette commande."
                );
            }

            return await this.findByUUID(uuid);
        }

        // Livreur : uniquement les commandes qui lui sont affectées
        if (role === "livreur") {
            const livreur =
                await LivreurRepository.findByUserId(
                    user_id
                );

            if (
                !livreur ||
                commande.livreur_id !== livreur.id
            ) {
                throw new ForbiddenError(
                    "Vous n'avez pas accès à cette commande."
                );
            }

            return await this.findByUUID(uuid);
        }

        throw new ForbiddenError(
            "Accès refusé."
        );
    }
    static async getHistorique(
        uuid: string
    ) {
        const commande =
            await CommandeRepository.findByUUID(uuid);

        if (!commande) {
            throw new NotFoundError(
                "Commande introuvable."
            );
        }

        const historique =
            await CommandeStatutRepository.findByCommandeId(
                commande.id
            );
        return historique;
    }
}