"use client";

import {
  FiX,
  FiPackage,
  FiUser,
  FiPhone,
  FiMapPin,
  FiTruck,
  FiClock,
  FiShoppingBag,
  FiNavigation,
  FiCheckCircle,
} from "react-icons/fi";

interface Notification {
  uuid: string;
  titre: string;
  message: string;
  created_at: string;
}

interface LivraisonDetail {
  uuid: string;
  commande_id: number;
  livreur_id: number;
  status: string;
  created_at: string;
  updated_at?: string | null;
  assigned_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
}

interface CommandeDetail {
  uuid: string;
  total: number;
  frais_livraison: number;
  status: string;
  created_at: string;
  updated_at: string;

  adresse_livraison: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_precision: number | null;

  boutique: {
    uuid: string;
    nom: string;
    slug: string;
  };

  client: {
    uuid: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };

  produits: {
    id: number;
    commande_id: number;
    produit_id: number;
    quantite: number;
    prix: number;
    uuid: string;
    nom: string;
    slug: string;
    image: string | null;
    sous_total: number;
  }[];

  historique: {
    id?: number;
    status: string;
    commentaire?: string | null;
    created_at: string;
  }[];
}

interface Props {
  notification: Notification;
  commande: CommandeDetail | null;
  livraison: LivraisonDetail | null;
  loadingCommande: boolean;
  onClose: () => void;
}

export default function LivreurNotificationModal({
  notification,
  commande,
  livraison,
  loadingCommande,
  onClose,
}: Props) {
  function formatMoney(value: number) {
    return Number(value).toLocaleString("fr-FR");
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function getDeliveryStatusLabel(status?: string) {
    const labels: Record<string, string> = {
      assigned: "Assignée",
      picked_up: "Colis récupéré",
      in_transit: "En cours de livraison",
      delivery_pending_confirmation:
        "En attente de confirmation",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return labels[status ?? ""] ?? status ?? "Inconnue";
  }

  function getDeliveryStatusClass(status?: string) {
    const classes: Record<string, string> = {
      assigned:
        "bg-blue-50 text-blue-700 border-blue-200",

      picked_up:
        "bg-purple-50 text-purple-700 border-purple-200",

      in_transit:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      delivery_pending_confirmation:
        "bg-amber-50 text-amber-700 border-amber-200",

      delivered:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      cancelled:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      classes[status ?? ""] ??
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  }

  function getOrderStatusLabel(status?: string) {
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return labels[status ?? ""] ?? status ?? "Inconnu";
  }

  function getOrderStatusClass(status?: string) {
    const classes: Record<string, string> = {
      pending:
        "bg-amber-50 text-amber-700 border-amber-200",

      confirmed:
        "bg-blue-50 text-blue-700 border-blue-200",

      preparing:
        "bg-purple-50 text-purple-700 border-purple-200",

      shipped:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      delivered:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      cancelled:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      classes[status ?? ""] ??
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-black/50
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-2
        sm:p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-2xl
          max-h-[95vh]
          sm:max-h-[90vh]
          bg-white
          rounded-2xl
          sm:rounded-3xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            px-4
            sm:px-6
            py-4
            border-b
            border-gray-100
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="
                shrink-0
                w-11
                h-11
                rounded-2xl
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
              "
            >
              <FiTruck size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {notification.titre || "Nouvelle livraison"}
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                Détails de votre livraison
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            <FiX size={19} />
          </button>
        </div>

        {/* =====================================================
            CONTENU
        ====================================================== */}

        <div className="flex-1 overflow-y-auto">
          {loadingCommande ? (
            <div className="py-16 text-center px-6">
              <div
                className="
                  w-10
                  h-10
                  border-2
                  border-gray-200
                  border-t-gray-800
                  rounded-full
                  animate-spin
                  mx-auto
                "
              />

              <p className="text-sm text-gray-500 mt-4">
                Chargement des détails de la livraison...
              </p>
            </div>
          ) : !commande ? (
            <div className="py-16 px-6 text-center">
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-red-50
                  text-red-500
                  flex
                  items-center
                  justify-center
                  mx-auto
                "
              >
                <FiPackage size={25} />
              </div>

              <h3 className="text-sm font-semibold text-gray-800 mt-4">
                Commande introuvable
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Impossible de récupérer les détails de cette commande.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-5">

              {/* =================================================
                  NOTIFICATION
              ================================================== */}

              <div
                className="
                  rounded-2xl
                  bg-blue-50
                  border
                  border-blue-100
                  p-4
                "
              >
                <div className="flex gap-3">
                  <FiTruck
                    size={19}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      {notification.titre}
                    </p>

                    <p className="text-xs text-blue-700 mt-1 leading-5">
                      {notification.message}
                    </p>

                    <p className="text-[10px] text-blue-500 mt-2">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  STATUT LIVRAISON
              ================================================== */}

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FiTruck size={17} />
                    État de la livraison
                  </h3>

                  <span
                    className={`
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-full
                      border
                      text-[11px]
                      font-semibold
                      ${getDeliveryStatusClass(
                        livraison?.status
                      )}
                    `}
                  >
                    {getDeliveryStatusLabel(
                      livraison?.status
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Commande
                    </p>

                    <p className="text-sm font-bold text-gray-900 mt-1">
                      #{commande.uuid.slice(0, 8)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Statut commande
                    </p>

                    <span
                      className={`
                        inline-flex
                        mt-1
                        px-2.5
                        py-1
                        rounded-full
                        border
                        text-[10px]
                        font-semibold
                        ${getOrderStatusClass(
                          commande.status
                        )}
                      `}
                    >
                      {getOrderStatusLabel(
                        commande.status
                      )}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  BOUTIQUE
              ================================================== */}

              <section>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <FiShoppingBag size={17} />
                  Boutique
                </h3>

                <div
                  className="
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                  "
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {commande.boutique.nom}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Commande à récupérer auprès de cette boutique.
                  </p>
                </div>
              </section>

              {/* =================================================
                  CLIENT
              ================================================== */}

              <section>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <FiUser size={17} />
                  Client
                </h3>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {commande.client.prenom}{" "}
                        {commande.client.nom}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Client de la commande
                      </p>
                    </div>

                    <a
                      href={`tel:${commande.client.telephone}`}
                      className="
                        shrink-0
                        w-10
                        h-10
                        rounded-xl
                        bg-emerald-50
                        text-emerald-600
                        flex
                        items-center
                        justify-center
                        hover:bg-emerald-100
                        transition
                      "
                      aria-label="Appeler le client"
                    >
                      <FiPhone size={18} />
                    </a>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {commande.client.telephone}
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  DESTINATION
              ================================================== */}

              <section>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <FiMapPin size={17} />
                  Destination
                </h3>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-800 leading-6">
                    {commande.adresse_livraison ||
                      "Adresse non renseignée"}
                  </p>

                  {commande.latitude !== null &&
                    commande.longitude !== null && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">
                            Position GPS
                          </p>

                          <p className="text-xs text-gray-600 mt-1">
                            {commande.latitude},{" "}
                            {commande.longitude}
                          </p>

                          {commande.gps_precision !==
                            null && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              Précision : ±
                              {commande.gps_precision} m
                            </p>
                          )}
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${commande.latitude},${commande.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            shrink-0
                            flex
                            items-center
                            gap-2
                            px-3
                            py-2
                            rounded-xl
                            bg-gray-900
                            text-white
                            text-xs
                            font-semibold
                            hover:bg-gray-800
                            transition
                          "
                        >
                          <FiNavigation size={14} />
                          Itinéraire
                        </a>
                      </div>
                    )}
                </div>
              </section>

              {/* =================================================
                  PRODUITS
              ================================================== */}

              <section>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <FiPackage size={17} />
                  Colis
                </h3>

                <div className="space-y-2">
                  {commande.produits.map((produit) => (
                    <div
                      key={produit.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border
                        border-gray-100
                        p-3
                      "
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {produit.image ? (
                          <img
                            src={produit.image}
                            alt={produit.nom}
                            className="
                              w-11
                              h-11
                              rounded-xl
                              object-cover
                              bg-gray-100
                              shrink-0
                            "
                          />
                        ) : (
                          <div
                            className="
                              w-11
                              h-11
                              rounded-xl
                              bg-gray-100
                              flex
                              items-center
                              justify-center
                              shrink-0
                            "
                          >
                            <FiPackage
                              size={18}
                              className="text-gray-400"
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {produit.nom}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Quantité : {produit.quantite}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatMoney(
                          produit.sous_total
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* =================================================
                  TOTAL
              ================================================== */}

              <section
                className="
                  rounded-2xl
                  bg-gray-900
                  text-white
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    Sous-total / commande
                  </span>

                  <span className="text-sm font-semibold">
                    {formatMoney(
                      commande.total -
                        commande.frais_livraison
                    )}{" "}
                    FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-300">
                    Frais de livraison
                  </span>

                  <span className="text-sm font-semibold">
                    {formatMoney(
                      commande.frais_livraison
                    )}{" "}
                    FCFA
                  </span>
                </div>

                <div className="border-t border-white/10 my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Total commande
                  </span>

                  <span className="text-lg font-bold">
                    {formatMoney(commande.total)} FCFA
                  </span>
                </div>
              </section>

              {/* =================================================
                  INFORMATIONS LIVRAISON
              ================================================== */}

              {livraison && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <FiClock size={17} />
                    Suivi de la livraison
                  </h3>

                  <div className="space-y-2">
                    {livraison.assigned_at && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <FiCheckCircle
                          size={15}
                          className="text-blue-500"
                        />
                        Livraison assignée —{" "}
                        {formatDate(
                          livraison.assigned_at
                        )}
                      </div>
                    )}

                    {livraison.picked_up_at && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <FiCheckCircle
                          size={15}
                          className="text-purple-500"
                        />
                        Colis récupéré —{" "}
                        {formatDate(
                          livraison.picked_up_at
                        )}
                      </div>
                    )}

                    {livraison.delivered_at && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <FiCheckCircle
                          size={15}
                          className="text-emerald-500"
                        />
                        Livraison terminée —{" "}
                        {formatDate(
                          livraison.delivered_at
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div
          className="
            px-4
            sm:px-6
            py-3
            border-t
            border-gray-100
            bg-gray-50
            flex
            justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              px-4
              py-2
              rounded-xl
              bg-white
              border
              border-gray-200
              text-xs
              font-semibold
              text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}