"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MoreVertical,
    Pencil,
    Ban,
    Check,
    Trash2,
    PackageOpen,
    Store,
    Tag,
} from "lucide-react";

import DeleteProductModal from "./DeleteProductModal";

interface Produit {
    uuid: string;
    nom: string;
    prix: string;
    stock: number;
    image: string | null;
    status: string;

    boutique: {
        nom: string;
    } | null;

    categorie: {
        nom: string;
    } | null;
}

interface Props {
    produits: Produit[];
    onDelete: (uuid: string) => Promise<void>;
    onToggleStatus: (
        uuid: string,
        status: string
    ) => Promise<void>;
}

function formatPrix(prix: string) {
    return `${Number(prix).toLocaleString("fr-FR")} FCFA`;
}

function getStockLabel(stock: number) {
    if (stock <= 0) {
        return "Rupture";
    }

    if (stock <= 5) {
        return "Stock faible";
    }

    return "En stock";
}

function getStockClasses(stock: number) {
    if (stock <= 0) {
        return "bg-red-100 text-red-700";
    }

    if (stock <= 5) {
        return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
}

function getInitiales(nom: string) {
    return nom
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0])
        .join("")
        .toUpperCase();
}

export default function ProductTable({
    produits,
    onDelete,
    onToggleStatus,
}: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<Produit | null>(null);

    if (produits.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <PackageOpen
                        size={26}
                        className="text-gray-500"
                    />
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                    Aucun produit trouvé
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Aucun produit ne correspond à votre recherche.
                </p>
            </div>
        );
    }

    const handleDelete = async () => {
        if (!selectedProduct) {
            return;
        }

        setLoading(true);

        try {
            await onDelete(selectedProduct.uuid);
            setOpen(false);
            setSelectedProduct(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* =========================
                VERSION DESKTOP
            ========================== */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Produit
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Catégorie
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Boutique
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Prix
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Stock
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Statut
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {produits.map((produit) => (
                                <tr
                                    key={produit.uuid}
                                    className="transition hover:bg-gray-50/70"
                                >
                                    {/* Produit */}
                                    <td className="px-5 py-4">
                                        <div className="flex min-w-[220px] items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                                {produit.image ? (
                                                    <img
                                                        src={produit.image}
                                                        alt={produit.nom}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
                                                        {getInitiales(
                                                            produit.nom
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-gray-900">
                                                    {produit.nom}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Produit
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Catégorie */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Tag
                                                size={15}
                                                className="text-gray-400"
                                            />

                                            <span>
                                                {produit.categorie?.nom ??
                                                    "Sans catégorie"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Boutique */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Store
                                                size={15}
                                                className="text-gray-400"
                                            />

                                            <span>
                                                {produit.boutique?.nom ??
                                                    "Sans boutique"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Prix */}
                                    <td className="px-5 py-4 text-right">
                                        <span className="whitespace-nowrap font-semibold text-gray-900">
                                            {formatPrix(produit.prix)}
                                        </span>
                                    </td>

                                    {/* Stock */}
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-semibold text-gray-900">
                                                {produit.stock}
                                            </span>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStockClasses(
                                                    produit.stock
                                                )}`}
                                            >
                                                {getStockLabel(
                                                    produit.stock
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Statut */}
                                    <td className="px-5 py-4 text-center">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                produit.status ===
                                                "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {produit.status === "active"
                                                ? "Actif"
                                                : "Bloqué"}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4 text-center">
                                        <details className="relative inline-block text-left">
                                            <summary
                                                className="
                                                    flex h-9 w-9
                                                    cursor-pointer
                                                    list-none
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    border border-gray-200
                                                    bg-white
                                                    text-gray-500
                                                    transition
                                                    hover:bg-gray-100
                                                    hover:text-gray-900
                                                "
                                            >
                                                <MoreVertical size={18} />
                                            </summary>

                                            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                                <Link
                                                    href={`/dashboard/produits/edit/${produit.uuid}`}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Pencil size={16} />
                                                    Modifier
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onToggleStatus(
                                                            produit.uuid,
                                                            produit.status
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    {produit.status ===
                                                    "active" ? (
                                                        <>
                                                            <Ban
                                                                size={16}
                                                            />
                                                            Bloquer
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check
                                                                size={16}
                                                            />
                                                            Débloquer
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProduct(
                                                            produit
                                                        );
                                                        setOpen(true);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 px-5 py-3">
                    <p className="text-xs text-gray-500">
                        {produits.length} produit
                        {produits.length > 1 ? "s" : ""} affiché
                        {produits.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* =========================
                VERSION MOBILE
            ========================== */}
            <div className="space-y-3 md:hidden">
                {produits.map((produit) => (
                    <div
                        key={produit.uuid}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                {produit.image ? (
                                    <img
                                        src={produit.image}
                                        alt={produit.nom}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
                                        {getInitiales(produit.nom)}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-gray-900">
                                            {produit.nom}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {produit.boutique?.nom ??
                                                "Sans boutique"}
                                        </p>
                                    </div>

                                    <details className="relative shrink-0">
                                        <summary
                                            className="
                                                flex h-9 w-9
                                                cursor-pointer
                                                list-none
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border border-gray-200
                                                text-gray-500
                                                hover:bg-gray-100
                                            "
                                        >
                                            <MoreVertical size={18} />
                                        </summary>

                                        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                            <Link
                                                href={`/dashboard/produits/edit/${produit.uuid}`}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pencil size={16} />
                                                Modifier
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onToggleStatus(
                                                        produit.uuid,
                                                        produit.status
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                {produit.status ===
                                                "active" ? (
                                                    <>
                                                        <Ban size={16} />
                                                        Bloquer
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        Débloquer
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct(
                                                        produit
                                                    );
                                                    setOpen(true);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </button>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">
                                    Prix
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                    {formatPrix(produit.prix)}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">
                                    Stock
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">
                                        {produit.stock}
                                    </span>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStockClasses(
                                            produit.stock
                                        )}`}
                                    >
                                        {getStockLabel(
                                            produit.stock
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Catégorie
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-gray-700">
                                    {produit.categorie?.nom ??
                                        "Sans catégorie"}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    produit.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {produit.status === "active"
                                    ? "Actif"
                                    : "Bloqué"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteProductModal
                open={open}
                loading={loading}
                productName={selectedProduct?.nom ?? ""}
                onClose={() => {
                    if (!loading) {
                        setOpen(false);
                        setSelectedProduct(null);
                    }
                }}
                onConfirm={handleDelete}
            />
        </>
    );
}