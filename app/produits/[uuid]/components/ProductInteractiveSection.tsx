"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  Package,
  Store,
  Truck,
} from "lucide-react";

import AddToCartButton from "@/components/AddToCartButton";
import type { ProduitDetail } from "@/lib/api/produits";
import type { ProduitVariante } from "@/lib/types/produit";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


interface Props {
  produit: ProduitDetail;
}

export default function ProductInteractiveSection({
  produit,
}: Props) {
  const [selectedVarianteId, setSelectedVarianteId] =
    useState<number | null>(
      produit.variantes.length > 0
        ? produit.variantes[0].id
        : null
    );

  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [socialStatusLoading, setSocialStatusLoading] =
    useState(false);

  const selectedVariante = useMemo<ProduitVariante | null>(
    () => {
      if (selectedVarianteId === null) {
        return null;
      }

      return (
        produit.variantes.find(
          (variante) =>
            variante.id === selectedVarianteId
        ) ?? null
      );
    },
    [
      produit.variantes,
      selectedVarianteId,
    ]
  );

  useEffect(() => {
    if (
      authLoading ||
      !token ||
      !user ||
      user.role !== "client"
    ) {
      return;
    }

    let cancelled = false;

    async function loadSocialStatuses() {
      setSocialStatusLoading(true);

      try {
        const favoriteResponse =
          await fetch(
            `/api/favoris/${encodeURIComponent(produit.uuid)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (favoriteResponse.ok) {
          const favoriteData =
            await favoriteResponse.json();

          if (!cancelled) {
            setIsFavorite(
              Boolean(
                favoriteData?.data?.favorite
              )
            );
          }
        }

        if (produit.boutique?.uuid) {
          const followResponse =
            await fetch(
              `/api/boutiques/${encodeURIComponent(
                produit.boutique.uuid
              )}/abonnement`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          if (followResponse.ok) {
            const followData =
              await followResponse.json();

            if (!cancelled) {
              setIsFollowing(
                Boolean(
                  followData?.data?.following
                )
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des statuts sociaux :",
          error
        );
      } finally {
        if (!cancelled) {
          setSocialStatusLoading(false);
        }
      }
    }

    loadSocialStatuses();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    token,
    user,
    produit.uuid,
    produit.boutique?.uuid,
  ]);

async function handleFavorite() {
  if (!user || user.role !== "client" || !token) {
    router.push("/login");
    return;
  }

  setFavoriteLoading(true);

  try {
    if (isFavorite) {
      const response = await fetch(
        `/api/favoris/${encodeURIComponent(produit.uuid)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de retirer le produit des favoris."
        );
      }

      setIsFavorite(false);

      toast.success("Favori retiré", {
        description: `« ${produit.nom} » a été retiré de vos favoris.`,
      });
    } else {
      const response = await fetch(
        "/api/favoris",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            produit_uuid: produit.uuid,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible d'ajouter le produit aux favoris."
        );
      }

      setIsFavorite(true);

      toast.success("Favori ajouté", {
        description: `« ${produit.nom} » a été ajouté à vos favoris.`,
      });
    }
  } catch (error) {
    console.error(
      "Erreur favori :",
      error
    );

    toast.error("Erreur", {
      description:
        isFavorite
          ? "Impossible de retirer ce produit des favoris."
          : "Impossible d'ajouter ce produit aux favoris.",
    });
  } finally {
    setFavoriteLoading(false);
  }
}

 async function handleFollowBoutique() {
  if (!produit.boutique?.uuid) {
    return;
  }

  if (
    !user ||
    user.role !== "client" ||
    !token
  ) {
    router.push("/login");
    return;
  }

  setFollowLoading(true);

  const wasFollowing = isFollowing;

  try {
    const method =
      wasFollowing ? "DELETE" : "POST";

    const response = await fetch(
      `/api/boutiques/${encodeURIComponent(
        produit.boutique.uuid
      )}/abonnement`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        wasFollowing
          ? "Impossible de ne plus suivre cette boutique."
          : "Impossible de suivre cette boutique."
      );
    }

    setIsFollowing(!wasFollowing);

    if (wasFollowing) {
      toast.success("Abonnement retiré", {
        description: `Vous ne suivez plus « ${produit.boutique.nom} ».`,
      });
    } else {
      toast.success("Boutique suivie", {
        description: `Vous suivez maintenant « ${produit.boutique.nom} ».`,
      });
    }
  } catch (error) {
    console.error(
      "Erreur abonnement boutique :",
      error
    );

    toast.error("Erreur", {
      description: wasFollowing
        ? "Impossible de ne plus suivre cette boutique."
        : "Impossible de suivre cette boutique.",
    });
  } finally {
    setFollowLoading(false);
  }
}

  /*
   * Photos de la variante sélectionnée uniquement.
   *
   * L'image principale du produit reste l'image par défaut.
   * Lorsqu'une variante est sélectionnée, ses photos deviennent
   * les photos de la galerie.
   */
  const varianteImages = useMemo(() => {
    return (
      selectedVariante?.images
        ?.slice()
        .sort(
          (a, b) =>
            a.ordre - b.ordre
        )
        .map(
          (image) =>
            image.image_url
        )
        .filter(Boolean) ?? []
    );
  }, [selectedVariante]);

  /*
   * Au chargement, on affiche toujours l'image principale
   * du produit.
   */
  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      produit.image ?? null
    );

  /*
   * Une variante sans photo reste sélectionnable.
   */
  const stockDisponible =
    selectedVariante?.stock ??
    produit.stock;

  const produitPourPanier = {
    ...produit,
    variante: selectedVariante
      ? {
        id: selectedVariante.id,
        uuid: selectedVariante.uuid,
        nom: selectedVariante.nom,
        stock: selectedVariante.stock,
        image:
          selectedVariante.images?.[0]
            ?.image_url ??
          null,
      }
      : null,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

      {/* GALERIE */}
      <div>
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              min-h-105
              items-center
              justify-center
              sm:min-h-125
            "
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={
                  selectedVariante
                    ? `${produit.nom} - ${selectedVariante.nom}`
                    : produit.nom
                }
                className="
                  h-full
                  max-h-125
                  w-full
                  object-contain
                  p-6
                  sm:p-10
                "
              />
            ) : (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-gray-400
                "
              >
                <Package
                  size={58}
                  strokeWidth={1.4}
                />

                <span className="mt-3 text-sm">
                  Aucune image disponible
                </span>
              </div>
            )}
          </div>

          {/* BADGE STOCK */}
          <div className="absolute left-5 top-5">
            {stockDisponible > 0 ? (
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-50
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-green-700
                  ring-1
                  ring-green-200
                "
              >
                <CheckCircle2 size={14} />
                Disponible
              </span>
            ) : (
              <span
                className="
                  rounded-full
                  bg-red-50
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-red-700
                  ring-1
                  ring-red-200
                "
              >
                Rupture de stock
              </span>
            )}
          </div>
        </div>

        {/* MINIATURES DE LA VARIANTE */}
        {varianteImages.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {varianteImages.map(
              (image, index) => {
                const active =
                  selectedImage === image;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(image)
                    }
                    className={`
              relative
              h-20
              w-20
              shrink-0
              overflow-hidden
              rounded-xl
              border
              bg-white
              transition
              ${active
                        ? "border-green-600 ring-2 ring-green-100"
                        : "border-gray-200 hover:border-gray-300"
                      }
            `}
                    aria-label={`Voir la photo ${index + 1} de ${selectedVariante?.nom ?? "la variante"}`}
                  >
                    <img
                      src={image}
                      alt={`${produit.nom} - ${selectedVariante?.nom ?? "variante"} - photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* INFORMATIONS INTERACTIVES */}
      <div className="flex flex-col">

        {/* FAVORI */}
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={
              favoriteLoading ||
              socialStatusLoading
            }
            aria-label={
              isFavorite
                ? "Retirer des favoris"
                : "Ajouter aux favoris"
            }
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
              ${isFavorite
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              }
            `}
          >
            {favoriteLoading ||
              socialStatusLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Heart
                size={18}
                fill={
                  isFavorite
                    ? "currentColor"
                    : "none"
                }
              />
            )}

            {isFavorite
              ? "Retirer des favoris"
              : "Ajouter aux favoris"}
          </button>
        </div>

        {/* VARIANTES */}
        {produit.variantes.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">
                Variante
              </h2>

              {selectedVariante && (
                <span className="text-sm font-semibold text-gray-600">
                  {selectedVariante.nom}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {produit.variantes.map(
                (variante) => {
                  const selected =
                    variante.id ===
                    selectedVarianteId;

                  const disponible =
                    variante.stock > 0;

                  return (
                    <button
                      key={variante.id}
                      type="button"
                      onClick={() => {
                        setSelectedVarianteId(variante.id);
                        setSelectedImage(produit.image ?? null);
                      }}
                      className={`
                        relative
                        rounded-xl
                        border
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition
                        ${selected
                          ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-100"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }
                        ${!disponible
                          ? "opacity-60"
                          : ""
                        }
                      `}
                    >
                      {variante.nom}

                      {!disponible && (
                        <span className="ml-1 text-xs font-medium text-red-600">
                          épuisé
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Sélectionnez une variante pour voir
              ses photos et son stock.
            </p>
          </div>
        )}

        {/* PRIX */}
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-500">
            Prix
          </p>

          {produit.promotion_uuid ? (
            <div className="mt-2">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="
                    text-3xl
                    font-extrabold
                    tracking-tight
                    text-green-700
                    sm:text-4xl
                  "
                >
                  {(
                    produit.promotion_type ===
                      "percentage" &&
                      produit.promotion_reduction_pourcentage !==
                      null
                      ? Number(produit.prix) -
                      (Number(produit.prix) *
                        Number(
                          produit.promotion_reduction_pourcentage
                        )) /
                      100
                      : produit.promotion_type ===
                        "special_price" &&
                        produit.promotion_prix_promotionnel !==
                        null
                        ? Number(
                          produit.promotion_prix_promotionnel
                        )
                        : Number(produit.prix)
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>

                <span
                  className="
                    rounded-full
                    bg-red-50
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-red-700
                    ring-1
                    ring-red-200
                  "
                >
                  {produit.promotion_type ===
                    "percentage" &&
                    produit.promotion_reduction_pourcentage !==
                    null
                    ? `-${Number(
                      produit.promotion_reduction_pourcentage
                    )}%`
                    : "PROMOTION"}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400 line-through">
                  {Number(
                    produit.prix
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>

                {produit.promotion_type ===
                  "percentage" &&
                  produit.promotion_reduction_pourcentage !==
                  null && (
                    <span className="text-xs font-semibold text-red-600">
                      Économisez{" "}
                      {(
                        (Number(produit.prix) *
                          Number(
                            produit.promotion_reduction_pourcentage
                          )) /
                        100
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </span>
                  )}
              </div>
            </div>
          ) : (
            <p
              className="
                mt-1
                text-3xl
                font-extrabold
                tracking-tight
                text-green-700
                sm:text-4xl
              "
            >
              {Number(
                produit.prix
              ).toLocaleString("fr-FR")}{" "}
              FCFA
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mt-7">
          <h2 className="text-base font-bold text-gray-900">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
            {produit.description ||
              "Aucune description disponible pour ce produit."}
          </p>
        </div>

        {/* INFORMATIONS */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">

          {/* STOCK */}
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-50
                  text-green-700
                "
              >
                <Package size={19} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Stock disponible
                </p>

                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {stockDisponible > 0
                    ? `${stockDisponible} unité${stockDisponible > 1
                      ? "s"
                      : ""
                    }`
                    : "Rupture de stock"}
                </p>
              </div>
            </div>
          </div>

          {/* BOUTIQUE */}
          {produit.boutique && (
            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
              "
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-yellow-50
                      text-yellow-700
                    "
                  >
                    <Store size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Boutique
                    </p>

                    <p className="mt-0.5 truncate text-sm font-bold text-gray-900">
                      {produit.boutique.nom}
                    </p>
                  </div>
                </div>

                {user?.role === "client" ||
                  !user ? (
                  <button
                    type="button"
                    onClick={handleFollowBoutique}
                    disabled={
                      followLoading ||
                      socialStatusLoading
                    }
                    className={`
                      inline-flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      px-3
                      py-2
                      text-xs
                      font-bold
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${isFollowing
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      }
                    `}
                  >
                    {followLoading ||
                      socialStatusLoading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Heart
                        size={15}
                        fill={
                          isFollowing
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )}

                    {isFollowing
                      ? "Suivie"
                      : "Suivre"}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* AJOUT PANIER */}
        <div className="mt-8">
          {stockDisponible > 0 ? (
            <AddToCartButton
              produit={produitPourPanier}
            />
          ) : (
            <button
              disabled
              className="
        w-full
        cursor-not-allowed
        rounded-2xl
        bg-gray-200
        px-6
        py-4
        text-sm
        font-bold
        text-gray-500
      "
            >
              Produit indisponible
            </button>
          )}
        </div>

        {/* LIVRAISON */}
        <div
          className="
    mt-5
    rounded-2xl
    border
    border-green-100
    bg-green-50/70
    p-4
  "
        >
          <div className="flex items-start gap-3">

            <div
              className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-green-100
        text-green-700
      "
            >
              <Truck size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                Livraison disponible
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Les frais de livraison sont calculés selon
                votre zone au moment de la commande.
              </p>
            </div>

          </div>
        </div>

        {/* GARANTIES */}
        <div className="mt-7 grid gap-3 border-t border-gray-200 pt-6 sm:grid-cols-3">

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2
              size={16}
              className="shrink-0 text-green-600"
            />
            Commande sécurisée
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Truck
              size={16}
              className="shrink-0 text-green-600"
            />
            Livraison locale
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin
              size={16}
              className="shrink-0 text-green-600"
            />
            Suivi GPS
          </div>

        </div>
      </div>
    </div>
  );
}
