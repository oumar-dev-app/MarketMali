"use client";

import { useEffect, useState } from "react";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Avis {
  uuid: string;
  note: number;
  commentaire: string | null;
  created_at: string;
}

interface AvisResponse {
  success: boolean;
  data: {
    produit_id: number;
    moyenne: number;
    total: number;
    repartition: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    avis: Avis[];
  };
}

interface ProductReviewsProps {
  produitUuid: string;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function Stars({
  note,
  size = 18,
}: {
  note: number;
  size?: number;
}) {
  return (<div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= Math.round(note)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }
      />
    ))} </div>
  );
}

export default function ProductReviews({
  produitUuid,
}: ProductReviewsProps) {
  const [data, setData] = useState<AvisResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);
        setError(false);

        const response = await apiGet<AvisResponse>(
          `/avis/produit/${encodeURIComponent(produitUuid)}`
        );

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        console.error(
          "[ProductReviews] Erreur lors du chargement des avis:",
          err
        );

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };


  }, [produitUuid]);

  return (<section className="mt-12 border-t border-gray-200 pt-10">
    {/* EN-TÊTE */} <div className="mb-8"> <div className="flex items-start gap-3"> <div
      className="
           flex
           h-11
           w-11
           shrink-0
           items-center
           justify-center
           rounded-xl
           bg-green-50
           text-green-700
         "
    > <MessageCircle size={21} /> </div>


      <div>
        <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
          Avis clients
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Découvrez les avis des clients ayant acheté ce produit.
        </p>
      </div>
    </div>
    </div>

    {/* CHARGEMENT */}
    {loading && (
      <div
        className="
        flex
        min-h-40
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-200
        bg-white
      "
      >
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            size={19}
            className="animate-spin text-green-600"
          />
          Chargement des avis...
        </div>
      </div>
    )}

    {/* ERREUR */}
    {!loading && error && (
      <div
        className="
        rounded-2xl
        border
        border-red-100
        bg-red-50
        p-5
        text-sm
        text-red-700
      "
      >
        Impossible de charger les avis pour le moment.
      </div>
    )}

    {/* CONTENU */}
    {!loading && !error && data && (
      <>
        {/* NOTE + RÉPARTITION */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* NOTE MOYENNE */}
          <div
            className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
          "
          >
            <p className="text-sm font-medium text-gray-500">
              Note moyenne
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-gray-900">
                {Number(data.moyenne).toLocaleString("fr-FR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>

              <span className="mb-1 text-sm text-gray-400">
                / 5
              </span>
            </div>

            <div className="mt-3">
              <Stars note={Number(data.moyenne)} size={19} />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {data.total} avis
            </p>
          </div>

          {/* RÉPARTITION */}
          <div
            className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
          "
          >
            <p className="mb-5 text-sm font-bold text-gray-900">
              Répartition des notes
            </p>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((note) => {
                const count =
                  data.repartition[
                  note as keyof typeof data.repartition
                  ];

                const percentage =
                  data.total > 0
                    ? (count / data.total) * 100
                    : 0;

                return (
                  <div
                    key={note}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-14 shrink-0 items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-700">
                        {note}
                      </span>

                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    </div>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-xs text-gray-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LISTE DES AVIS */}
        <div className="mt-8">
          {data.avis.length === 0 ? (
            <div
              className="
              rounded-2xl
              border
              border-dashed
              border-gray-300
              bg-white
              px-6
              py-10
              text-center
            "
            >
              <MessageCircle
                size={32}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-3 text-sm font-bold text-gray-900">
                Aucun avis pour le moment
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Soyez le premier client à donner votre avis
                sur ce produit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.avis.map((avis) => (
                <article
                  key={avis.uuid}
                  className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  sm:p-6
                "
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Stars note={avis.note} size={17} />

                      <p className="mt-2 text-xs text-gray-400">
                        Client vérifié ·{" "}
                        {formatDate(avis.created_at)}
                      </p>
                    </div>
                  </div>

                  {avis.commentaire && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {avis.commentaire}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </>
    )}
  </section>


  );
}
