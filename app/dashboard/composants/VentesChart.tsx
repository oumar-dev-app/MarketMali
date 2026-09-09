"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Wallet } from "lucide-react";

interface Vente {
  mois: string;
  ventes: string | number;
}

interface Props {
  ventes: Vente[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: string | number;
    payload?: {
      mois: string;
      ventes: number;
    };
  }>;
}

function formatFCFA(value: number) {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

function formatCompactFCFA(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    })} M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 0,
    })} k`;
  }

  return value.toLocaleString("fr-FR");
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const vente = payload[0]?.payload;

  if (!vente) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-500">
        {vente.mois}
      </p>

      <p className="text-sm font-bold text-gray-900">
        {formatFCFA(vente.ventes)}
      </p>
    </div>
  );
}

export default function VentesChart({
  ventes = [],
}: Props) {
  const data = ventes.map((vente) => ({
    mois: vente.mois,
    ventes: Number(vente.ventes) || 0,
  }));

  const chiffreAffaires = data.reduce(
    (total, vente) => total + vente.ventes,
    0
  );

  const moyenneMensuelle =
    data.length > 0
      ? chiffreAffaires / data.length
      : 0;

  const meilleurMois =
    data.length > 0
      ? data.reduce((meilleur, vente) =>
          vente.ventes > meilleur.ventes
            ? vente
            : meilleur
        )
      : null;

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm sm:mt-6">
      {/* HEADER */}
      <div className="relative border-b border-gray-100 px-5 py-5 sm:px-6 sm:py-6">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-blue-50 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
              <Wallet className="h-3.5 w-3.5" />
              Analyse financière
            </div>

            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Évolution des ventes
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              Suivez l'évolution de votre chiffre d'affaires
              mois par mois.
            </p>
          </div>

          {data.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Période
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {data.length} mois
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INDICATEURS */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 divide-y divide-gray-100 border-b border-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-gray-500">
              Chiffre d'affaires
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              {formatFCFA(chiffreAffaires)}
            </p>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-gray-500">
              Moyenne mensuelle
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              {formatFCFA(Math.round(moyenneMensuelle))}
            </p>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-gray-500">
              Meilleur mois
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              {meilleurMois
                ? formatFCFA(meilleurMois.ventes)
                : "0 FCFA"}
            </p>

            {meilleurMois && (
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {meilleurMois.mois}
              </p>
            )}
          </div>
        </div>
      )}

      {/* GRAPHIQUE */}
      <div className="p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center sm:h-80">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>

            <p className="text-sm font-semibold text-gray-700">
              Aucune donnée de vente
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              Les statistiques de chiffre d'affaires
              apparaîtront ici dès que votre boutique
              enregistrera des ventes.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full sm:h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 5,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="mois"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#6b7280",
                  }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tick={{
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                  tickFormatter={(value) =>
                    formatCompactFCFA(Number(value))
                  }
                />

                <Tooltip
                  cursor={{
                    fill: "#f8fafc",
                  }}
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey="ventes"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={42}
                  fill="#2563eb"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

