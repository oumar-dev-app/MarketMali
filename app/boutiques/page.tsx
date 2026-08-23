import Link from "next/link";
import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  MapPin,
  Store,
  ArrowRight,
  Search,
} from "lucide-react";

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  status: string;
}

interface BoutiquesResponse {
  success: boolean;
  message: string;
  data: Boutique[];
}

export default async function BoutiquesPage() {
  const response =
    await apiGet<BoutiquesResponse>(
      "/boutiques"
    );

  const boutiques = response.data ?? [];

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Décorations */}

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-80
            w-80
            rounded-full
            bg-[#14a800]/5
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            -left-32
            h-80
            w-80
            rounded-full
            bg-[#fcd116]/5
          "
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">

            {/* LABEL */}

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#14a800]/10 px-3 py-1.5 text-xs font-bold text-[#087f00]">
              <Store size={14} />
              MarketMali
            </div>

            {/* TITRE */}

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
              Découvrez nos boutiques
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
              Explorez les boutiques disponibles sur
              MarketMali et découvrez leurs produits,
              leurs offres et leurs services.
            </p>

            {/* STATISTIQUE */}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                <Store size={19} />
              </div>

              <div>
                <p className="text-xl font-extrabold text-gray-950">
                  {boutiques.length}
                </p>

                <p className="text-xs text-gray-500">
                  boutique
                  {boutiques.length > 1
                    ? "s"
                    : ""}{" "}
                  disponible
                  {boutiques.length > 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* EN-TÊTE */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#14a800]">
              Boutiques
            </p>

            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
              Toutes les boutiques
            </h2>
          </div>

          <span className="text-sm text-gray-400">
            {boutiques.length} résultat
            {boutiques.length > 1
              ? "s"
              : ""}
          </span>
        </div>

        {/* =================================================
            AUCUNE BOUTIQUE
        ================================================== */}

        {boutiques.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <Store
                size={28}
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-950">
              Aucune boutique disponible
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Aucune boutique active n'est
              actuellement disponible sur
              MarketMali.
            </p>
          </div>
        ) : (
          /* =================================================
             LISTE DES BOUTIQUES
          ================================================== */

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {boutiques.map((boutique) => (
              <Link
                key={boutique.uuid}
                href={`/boutiques/${boutique.slug}`}
                className="
                  group
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#14a800]/20
                  hover:shadow-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#14a800]/30
                  focus:ring-offset-2
                "
              >
                {/* =================================================
                    LOGO
                ================================================== */}

                <div className="relative aspect-4/3 overflow-hidden bg-gray-50">

                  {boutique.logo ? (
                    <img
                      src={boutique.logo}
                      alt={`Logo ${boutique.nom}`}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#14a800]/60 shadow-sm">
                        <Store
                          size={30}
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  )}

                  {/* STATUT */}

                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#087f00] shadow-sm backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#14a800]" />
                      Active
                    </span>
                  </div>

                  {/* BANDE MALI */}

                  <div className="absolute bottom-0 left-0 flex h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex-1 bg-[#14a800]" />
                    <div className="flex-1 bg-[#fcd116]" />
                    <div className="flex-1 bg-[#ce1126]" />
                  </div>
                </div>

                {/* =================================================
                    CONTENU
                ================================================== */}

                <div className="flex flex-1 flex-col p-5">

                  {/* NOM */}

                  <h3 className="line-clamp-1 text-lg font-extrabold text-gray-950 transition-colors duration-200 group-hover:text-[#14a800]">
                    {boutique.nom}
                  </h3>

                  {/* DESCRIPTION */}

                  {boutique.description ? (
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                      {boutique.description}
                    </p>
                  ) : (
                    <p className="mt-2 min-h-10 text-sm text-transparent">
                      -
                    </p>
                  )}

                  {/* LOCALISATION */}

                  {boutique.ville && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14a800]/10 text-[#14a800]">
                        <MapPin size={14} />
                      </div>

                      <span className="truncate">
                        {boutique.ville}
                      </span>
                    </div>
                  )}

                  {/* ACTION */}

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">

                    <span className="text-xs font-bold text-gray-400">
                      Voir la boutique
                    </span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800] transition-all duration-300 group-hover:bg-[#14a800] group-hover:text-white group-hover:shadow-md">
                      <ArrowRight
                        size={17}
                        strokeWidth={2.2}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </section>
    </main>
  );
}

