"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";


interface Vente {
    mois: string;
    ventes: string;
}


interface SalesChartProps {
    ventes: Vente[];
}


export default function SalesChart({
    ventes
}: SalesChartProps) {


    const data = ventes.map((item) => ({
        mois: item.mois,
        ventes: Number(item.ventes)
    }));


    return (

        <div className="bg-white rounded-xl shadow p-5 mt-6">

            <h2 className="text-xl font-bold mb-5">
                Évolution des ventes
            </h2>


            <div className="h-80">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart data={data}>

                        <CartesianGrid />

                        <XAxis
                            dataKey="mois"
                        />

                        <YAxis
                            tickFormatter={(value) =>
                                `${(value / 1000000).toFixed(1)}M`
                            }
                        />

                        <Tooltip
                            formatter={(value) =>
                                `${Number(value).toLocaleString("fr-FR")} FCFA`
                            }
                        />

                        <Bar
                            dataKey="ventes"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>


        </div>

    );
}