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

interface Vente {
  mois: string;
  ventes: string | number;
}

interface Props {
  ventes: Vente[];
}

export default function VentesChart({
  ventes = [],
}: Props) {
  const data = ventes.map((vente) => ({
    mois: vente.mois,
    ventes: Number(vente.ventes),
  }));

  return (
    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:mt-6 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          Évolution des ventes
        </h2>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Chiffre d'affaires par mois.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 sm:h-80">
          <p className="text-sm text-gray-500">
            Aucune donnée de vente disponible.
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
                right: 10,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
              />

              <XAxis
                dataKey="mois"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                width={50}
              />

              <Tooltip
                formatter={(value) =>
                  `${Number(value).toLocaleString("fr-FR")} FCFA`
                }
              />

              <Bar
                dataKey="ventes"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}