"use client";

import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prepareImageForUpload } from "@/lib/utils/imageUpload";
import {
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronRight,
    FolderOpen,
    Image as ImageIcon,
    Layers3,
    Loader2,
    Plus,
    Save,
    Search,
    Store,
    Trash2,
    Upload,
    X,
} from "lucide-react";

import { toast } from "sonner";

interface Categorie {
    id: number;
    nom: string;
    slug?: string | null;
    parent_id?: number | null;
    description?: string | null;
    image?: string | null;
    status?: string | null;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

type Mode = "existing" | "new";

type CategoriesResponse =
    | Categorie[]
    | {
        categories?: Categorie[];
    };

export default function CreateCategoriePage() {
    const router = useRouter();

    const [mode, setMode] = useState<Mode>("existing");

    const [globalCategories, setGlobalCategories] = useState<
        Categorie[]
    >([]);
    const [boutiqueCategories, setBoutiqueCategories] = useState<
        Categorie[]
    >([]);

    const [loadingCategories, setLoadingCategories] =
        useState(true);
    const [loading, setLoading] = useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState<Categorie | null>(null);

    const [search, setSearch] = useState("");

    const [nom, setNom] = useState("");
    const [parentId, setParentId] = useState<number | null>(null);
    const [description, setDescription] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        null
    );

    const [removeCategory, setRemoveCategory] =
        useState<Categorie | null>(null);
    const [removing, setRemoving] = useState(false);

    const [expandedParents, setExpandedParents] = useState<
        Set<number>
    >(new Set());

    const boutiqueCategoryIds = useMemo(
        () =>
            new Set(
                boutiqueCategories.map(
                    (category) => category.id
                )
            ),
        [boutiqueCategories]
    );

    const availableCategories = useMemo(
        () =>
            globalCategories.filter(
                (category) =>
                    !boutiqueCategoryIds.has(category.id)
            ),
        [globalCategories, boutiqueCategoryIds]
    );

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return availableCategories;
        }

        return availableCategories.filter((category) => {
            const name = category.nom.toLowerCase();

            const description =
                category.description?.toLowerCase() ?? "";

            const slug =
                category.slug?.toLowerCase() ?? "";

            return (
                name.includes(query) ||
                description.includes(query) ||
                slug.includes(query)
            );
        });
    }, [availableCategories, search]);

    const categoryMap = useMemo(() => {
        const map = new Map<number, Categorie>();

        globalCategories.forEach((category) => {
            map.set(category.id, category);
        });

        return map;
    }, [globalCategories]);

    const getCategoryPath = (category: Categorie) => {
        const path: string[] = [];
        let current: Categorie | undefined = category;

        const visited = new Set<number>();

        while (current && !visited.has(current.id)) {
            visited.add(current.id);
            path.unshift(current.nom);

            if (!current.parent_id) {
                break;
            }

            current = categoryMap.get(current.parent_id);
        }

        return path;
    };

    const getParentName = (category: Categorie) => {
        if (!category.parent_id) {
            return null;
        }

        return categoryMap.get(category.parent_id)?.nom ?? null;
    };

    const rootCategories = useMemo(
        () =>
            globalCategories.filter(
                (category) => !category.parent_id
            ),
        [globalCategories]
    );

    const childrenByParent = useMemo(() => {
        const map = new Map<number, Categorie[]>();

        globalCategories.forEach((category) => {
            if (!category.parent_id) {
                return;
            }

            const children =
                map.get(category.parent_id) ?? [];

            children.push(category);

            map.set(category.parent_id, children);
        });

        return map;
    }, [globalCategories]);

    const toggleParent = (id: number) => {
        setExpandedParents((current) => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Session expirée. Veuillez vous reconnecter."
                );
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [globalResponse, boutiqueResponse] =
                await Promise.all([
                    fetch(
                        "/api/dashboard/categories?scope=global",
                        {
                            headers,
                            cache: "no-store",
                        }
                    ),
                    fetch(
                        "/api/dashboard/categories",
                        {
                            headers,
                            cache: "no-store",
                        }
                    ),
                ]);

            const globalResult =
                (await globalResponse.json()) as ApiResponse<
                    CategoriesResponse
                >;

            const boutiqueResult =
                (await boutiqueResponse.json()) as ApiResponse<
                    CategoriesResponse
                >;

            if (
                !globalResponse.ok ||
                !globalResult.success
            ) {
                throw new Error(
                    globalResult.message ||
                    "Impossible de charger le catalogue des catégories."
                );
            }

            if (
                !boutiqueResponse.ok ||
                !boutiqueResult.success
            ) {
                throw new Error(
                    boutiqueResult.message ||
                    "Impossible de charger les catégories de votre boutique."
                );
            }

            const normalizeCategories = (
                data?: CategoriesResponse
            ): Categorie[] => {
                if (!data) {
                    return [];
                }

                if (Array.isArray(data)) {
                    return data;
                }

                return data.categories ?? [];
            };

            setGlobalCategories(
                normalizeCategories(globalResult.data)
            );

            setBoutiqueCategories(
                normalizeCategories(boutiqueResult.data)
            );
        } catch (error) {
            console.error(
                "Erreur chargement catégories:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de charger les catégories."
            );
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0] ?? null;

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error(
                "Veuillez sélectionner une image valide."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(
                "L'image ne doit pas dépasser 5 Mo."
            );

            event.target.value = "";
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(file);
        setImagePreview(
            URL.createObjectURL(file)
        );
    };

    const removeSelectedImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(null);
        setImagePreview(null);
    };

const uploadImage = async (
    token: string
): Promise<string> => {
    if (!imageFile) {
        return "";
    }

    const preparedFile =
        await prepareImageForUpload(imageFile);

    const formData = new FormData();

    formData.append(
        "file",
        preparedFile
    );

    formData.append(
        "type",
        "categorie"
    );

    const response = await fetch(
        "/api/upload",
        {
            method: "POST",
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const result =
        (await response.json()) as ApiResponse<{
            url?: string;
        }>;

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
                "Impossible de télécharger l'image."
        );
    }

    return result.data?.url ?? "";
};

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (mode === "existing") {
            if (!selectedCategory) {
                toast.error(
                    "Veuillez sélectionner une catégorie."
                );
                return;
            }

            if (
                boutiqueCategoryIds.has(
                    selectedCategory.id
                )
            ) {
                toast.error(
                    "Cette catégorie est déjà présente dans votre boutique."
                );

                return;
            }
        }

        if (mode === "new") {
            const cleanNom =
                nom.trim();

            if (!cleanNom) {
                toast.error(
                    "Le nom de la catégorie est obligatoire."
                );

                return;
            }
        }

        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Session expirée. Veuillez vous reconnecter."
                );

                return;
            }

            if (mode === "existing") {
                if (!selectedCategory) {
                    toast.error(
                        "Veuillez sélectionner une catégorie."
                    );

                    return;
                }

                const response =
                    await fetch(
                        "/api/dashboard/categories",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                nom:
                                    selectedCategory.nom,
                            }),
                        }
                    );

                const result =
                    (await response.json()) as ApiResponse;

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Impossible d'ajouter cette catégorie à votre boutique."
                    );
                }

                toast.success(
                    "Catégorie ajoutée à votre boutique."
                );

                setTimeout(() => {
                    router.push(
                        "/dashboard/categories"
                    );

                    router.refresh();
                }, 500);

                return;
            }

            let imageUrl = "";

            if (imageFile) {
                toast.info(
                    "Téléchargement de l'image..."
                );

                imageUrl =
                    await uploadImage(
                        token
                    );
            }

            const response =
                await fetch(
                    "/api/dashboard/categories",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            nom:
                                nom.trim(),
                            parent_id:
                                parentId,
                            description:
                                description.trim(),
                            image:
                                imageUrl ||
                                null,
                        }),
                    }
                );

            const result =
                (await response.json()) as ApiResponse;

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    "Erreur lors de la création de la catégorie."
                );
            }

            toast.success(
                "Catégorie créée et ajoutée à votre boutique."
            );

            setTimeout(() => {
                router.push(
                    "/dashboard/categories"
                );

                router.refresh();
            }, 500);
        } catch (error) {
            console.error(
                "Erreur gestion catégorie:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCategory = async () => {
        if (!removeCategory) {
            return;
        }

        try {
            setRemoving(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Session expirée. Veuillez vous reconnecter."
                );

                return;
            }

            const response =
                await fetch(
                    "/api/dashboard/categories",
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            categorie_id:
                                removeCategory.id,
                        }),
                    }
                );

            const result =
                (await response.json()) as ApiResponse;

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    "Impossible de retirer cette catégorie."
                );
            }

            toast.success(
                "Catégorie retirée de votre boutique."
            );

            setBoutiqueCategories(
                (current) =>
                    current.filter(
                        (category) =>
                            category.id !==
                            removeCategory.id
                    )
            );

            setRemoveCategory(null);
        } catch (error) {
            console.error(
                "Erreur suppression catégorie:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setRemoving(false);
        }
    };

    const isBusy =
        loading ||
        loadingCategories ||
        removing;

    const selectedPath = selectedCategory
        ? getCategoryPath(selectedCategory)
        : [];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f7f9f7]">

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
            >
                {/* Halo vert */}
                <div
                    className="
                        absolute
                        -right-40
                        -top-40
                        h-[420px]
                        w-[420px]
                        rounded-full
                        bg-[#14a800]/[0.045]
                        blur-3xl
                    "
                />

                {/* Halo jaune */}
                <div
                    className="
                        absolute
                        -bottom-48
                        -left-40
                        h-[460px]
                        w-[460px]
                        rounded-full
                        bg-[#fcd116]/[0.055]
                        blur-3xl
                    "
                />

                {/* Halo rouge */}
                <div
                    className="
                        absolute
                        right-[8%]
                        top-[42%]
                        h-52
                        w-52
                        rounded-full
                        bg-[#ce1126]/[0.025]
                        blur-3xl
                    "
                />

                {/* Cercle vert */}
                <div
                    className="
                        absolute
                        left-[7%]
                        top-[18%]
                        h-20
                        w-20
                        rounded-full
                        border
                        border-[#14a800]/10
                    "
                />

                {/* Cercle jaune */}
                <div
                    className="
                        absolute
                        right-[12%]
                        top-[27%]
                        h-14
                        w-14
                        rounded-full
                        border
                        border-[#fcd116]/20
                    "
                />

                {/* Grille très légère */}
                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.025]
                        [background-image:linear-gradient(to_right,#14a800_1px,transparent_1px),linear-gradient(to_bottom,#14a800_1px,transparent_1px)]
                        [background-size:48px_48px]
                    "
                />
            </div>

            {/* ==========================================================
                CONTENU
            ========================================================== */}

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

                {/* ======================================================
                    HEADER
                ====================================================== */}

                <section className="relative mb-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

                    {/* Décorations */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-24
                            h-56
                            w-56
                            rounded-full
                            bg-[#14a800]/[0.055]
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-28
                            -left-20
                            h-52
                            w-52
                            rounded-full
                            bg-[#fcd116]/[0.07]
                        "
                    />

                    <div className="relative p-5 sm:p-6 lg:p-7">

                        {/* Bande Mali */}
                        <div className="mb-5 flex items-center gap-1">
                            <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                            <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                            <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                        </div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0">

                                <Link
                                    href="/dashboard/categories"
                                    className="
                                        mb-4
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-gray-600
                                        shadow-sm
                                        transition
                                        hover:border-[#14a800]/30
                                        hover:bg-[#14a800]/[0.03]
                                        hover:text-[#118f00]
                                    "
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour aux catégories
                                </Link>

                                <div className="flex items-start gap-4">

                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-[#14a800]/10
                                            text-[#14a800]
                                        "
                                    >
                                        <FolderOpen className="h-6 w-6" />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#14a800]">
                                            Gestion des catégories
                                        </p>

                                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                                            Ajouter une catégorie
                                        </h1>

                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-[15px]">
                                            Organisez les produits de votre boutique
                                            avec les catégories du catalogue MarketMali
                                            ou créez votre propre catégorie.
                                        </p>

                                    </div>
                                </div>
                            </div>

                            <div className="relative shrink-0 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:min-w-[240px]">

                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14a800]/10 text-[#14a800]">
                                        <Store className="h-4 w-4" />
                                    </div>

                                    <span className="text-sm font-bold text-gray-900">
                                        MarketMali
                                    </span>
                                </div>

                                <p className="text-xs leading-5 text-gray-500">
                                    Organisation des catégories
                                    de votre boutique.
                                </p>

                            </div>

                        </div>
                    </div>
                </section>

                {/* ======================================================
                    STATISTIQUES
                ====================================================== */}

                <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                                <Layers3 className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Catalogue global
                                </p>

                                <p className="mt-0.5 text-xl font-extrabold text-gray-950">
                                    {globalCategories.length}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fcd116]/15 text-[#9a7b00]">
                                <Store className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Dans votre boutique
                                </p>

                                <p className="mt-0.5 text-xl font-extrabold text-gray-950">
                                    {boutiqueCategories.length}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce1126]/10 text-[#ce1126]">
                                <Plus className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Encore disponibles
                                </p>

                                <p className="mt-0.5 text-xl font-extrabold text-gray-950">
                                    {availableCategories.length}
                                </p>
                            </div>

                        </div>
                    </div>

                </section>

                {/* ======================================================
                    FORMULAIRE
                ====================================================== */}

                <form onSubmit={handleSubmit}>

                    {/* ==================================================
                        CHOIX DU MODE
                    ================================================== */}

                    <section className="mb-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-5">
                            <h2 className="text-lg font-extrabold text-gray-950">
                                Comment souhaitez-vous procéder ?
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Choisissez une catégorie existante ou
                                créez-en une nouvelle.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">

                            {/* EXISTANTE */}

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("existing");
                                    setSelectedCategory(null);
                                }}
                                className={`
                                    relative
                                    rounded-2xl
                                    border
                                    p-5
                                    text-left
                                    transition
                                    ${mode === "existing"
                                        ? "border-[#14a800]/30 bg-[#14a800]/[0.035] shadow-sm ring-2 ring-[#14a800]/10"
                                        : "border-gray-200 bg-white hover:border-[#14a800]/20 hover:bg-gray-50"
                                    }
                                `}
                            >

                                {mode === "existing" && (
                                    <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#14a800] text-white">
                                        <Check className="h-3.5 w-3.5" />
                                    </span>
                                )}

                                <div className="flex items-start gap-4">

                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            ${mode === "existing"
                                                ? "bg-[#14a800] text-white"
                                                : "bg-gray-100 text-gray-500"
                                            }
                                        `}
                                    >
                                        <FolderOpen className="h-5 w-5" />
                                    </div>

                                    <div className="pr-8">
                                        <h3 className="text-sm font-bold text-gray-950">
                                            Utiliser une catégorie existante
                                        </h3>

                                        <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                            Ajoutez à votre boutique une catégorie
                                            déjà présente dans le catalogue MarketMali.
                                        </p>
                                    </div>

                                </div>

                            </button>

                            {/* NOUVELLE */}

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("new");
                                    setSelectedCategory(null);
                                }}
                                className={`
                                    relative
                                    rounded-2xl
                                    border
                                    p-5
                                    text-left
                                    transition
                                    ${mode === "new"
                                        ? "border-[#14a800]/30 bg-[#14a800]/[0.035] shadow-sm ring-2 ring-[#14a800]/10"
                                        : "border-gray-200 bg-white hover:border-[#14a800]/20 hover:bg-gray-50"
                                    }
                                `}
                            >

                                {mode === "new" && (
                                    <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#14a800] text-white">
                                        <Check className="h-3.5 w-3.5" />
                                    </span>
                                )}

                                <div className="flex items-start gap-4">

                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            ${mode === "new"
                                                ? "bg-[#14a800] text-white"
                                                : "bg-gray-100 text-gray-500"
                                            }
                                        `}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </div>

                                    <div className="pr-8">
                                        <h3 className="text-sm font-bold text-gray-950">
                                            Créer une nouvelle catégorie
                                        </h3>

                                        <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                            Créez une nouvelle catégorie dans
                                            le catalogue global et ajoutez-la
                                            automatiquement à votre boutique.
                                        </p>
                                    </div>

                                </div>

                            </button>

                        </div>
                    </section>

                    {/* ==================================================
                        CATÉGORIE EXISTANTE
                    ================================================== */}

                    {mode === "existing" && (
                        <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">

                            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                                <div>
                                    <h2 className="text-lg font-extrabold text-gray-950">
                                        Sélectionner une catégorie
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Choisissez une catégorie encore disponible
                                        pour votre boutique.
                                    </p>
                                </div>

                                <div className="relative w-full sm:w-72">

                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Rechercher..."
                                        className="
                                            h-10
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-gray-50
                                            pl-9
                                            pr-3
                                            text-sm
                                            text-gray-900
                                            outline-none
                                            transition
                                            placeholder:text-gray-400
                                            focus:border-[#14a800]/40
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-[#14a800]/[0.08]
                                        "
                                    />

                                </div>
                            </div>

                            {loadingCategories ? (
                                <div className="flex min-h-[220px] items-center justify-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-500">
                                        <Loader2 className="h-7 w-7 animate-spin text-[#14a800]" />
                                        <span className="text-sm">
                                            Chargement des catégories...
                                        </span>
                                    </div>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                        <FolderOpen className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-4 text-sm font-bold text-gray-900">
                                        Aucune catégorie disponible
                                    </h3>

                                    <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-gray-500">
                                        {search
                                            ? "Aucune catégorie ne correspond à votre recherche."
                                            : "Toutes les catégories disponibles ont déjà été ajoutées à votre boutique."
                                        }
                                    </p>

                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                    {filteredCategories.map(
                                        (category) => {
                                            const isSelected =
                                                selectedCategory?.id ===
                                                category.id;

                                            const parentName =
                                                getParentName(
                                                    category
                                                );

                                            const children =
                                                childrenByParent.get(
                                                    category.id
                                                ) ?? [];

                                            const hasChildren =
                                                children.length > 0;

                                            const isExpanded =
                                                expandedParents.has(
                                                    category.id
                                                );

                                            return (
                                                <div
                                                    key={category.id}
                                                    className={`
                                                        relative
                                                        overflow-hidden
                                                        rounded-2xl
                                                        border
                                                        transition
                                                        ${isSelected
                                                            ? "border-[#14a800]/40 bg-[#14a800]/[0.035] shadow-sm ring-2 ring-[#14a800]/10"
                                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                                        }
                                                    `}
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedCategory(
                                                                category
                                                            )
                                                        }
                                                        className="w-full p-4 text-left"
                                                    >

                                                        <div className="flex items-start gap-3">

                                                            <div
                                                                className={`
                                                                    flex
                                                                    h-10
                                                                    w-10
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    ${isSelected
                                                                        ? "bg-[#14a800] text-white"
                                                                        : "bg-gray-100 text-gray-500"
                                                                    }
                                                                `}
                                                            >
                                                                <FolderOpen className="h-4.5 w-4.5" />
                                                            </div>

                                                            <div className="min-w-0 flex-1">

                                                                <div className="flex items-start justify-between gap-2">

                                                                    <div className="min-w-0">

                                                                        <h3 className="truncate text-sm font-bold text-gray-950">
                                                                            {category.nom}
                                                                        </h3>

                                                                        {parentName && (
                                                                            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                                                                                <ChevronRight className="h-3 w-3" />
                                                                                {parentName}
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                    {isSelected && (
                                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14a800] text-white">
                                                                            <Check className="h-3.5 w-3.5" />
                                                                        </span>
                                                                    )}

                                                                </div>

                                                                {category.description && (
                                                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                                                                        {category.description}
                                                                    </p>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </button>

                                                    {hasChildren && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleParent(
                                                                    category.id
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between border-t border-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                                                        >
                                                            <span>
                                                                {children.length}{" "}
                                                                sous-catégorie
                                                                {children.length > 1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>

                                                            <ChevronDown
                                                                className={`
                                                                    h-3.5
                                                                    w-3.5
                                                                    transition
                                                                    ${isExpanded
                                                                        ? "rotate-180"
                                                                        : ""
                                                                    }
                                                                `}
                                                            />
                                                        </button>
                                                    )}

                                                    {hasChildren &&
                                                        isExpanded && (
                                                            <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3">
                                                                <div className="space-y-2">
                                                                    {children.map(
                                                                        (
                                                                            child
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    child.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setSelectedCategory(
                                                                                        child
                                                                                    )
                                                                                }
                                                                                className="
                                                                                    flex
                                                                                    w-full
                                                                                    items-center
                                                                                    gap-2
                                                                                    rounded-lg
                                                                                    px-2
                                                                                    py-1.5
                                                                                    text-left
                                                                                    text-xs
                                                                                    text-gray-600
                                                                                    transition
                                                                                    hover:bg-white
                                                                                    hover:text-[#14a800]
                                                                                "
                                                                            >
                                                                                <ChevronRight className="h-3 w-3 shrink-0" />
                                                                                <span className="truncate">
                                                                                    {
                                                                                        child.nom
                                                                                    }
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                            {/* Catégorie sélectionnée */}

                            {selectedCategory && (
                                <div className="mt-6 overflow-hidden rounded-2xl border border-[#14a800]/20 bg-[#14a800]/[0.035]">

                                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14a800] text-white">
                                                <Check className="h-4.5 w-4.5" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#14a800]">
                                                    Catégorie sélectionnée
                                                </p>

                                                <p className="mt-0.5 truncate text-sm font-bold text-gray-950">
                                                    {selectedCategory.nom}
                                                </p>

                                                {selectedPath.length > 1 && (
                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                        {selectedPath.join(
                                                            " › "
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(
                                                    null
                                                )
                                            }
                                            className="
                                                inline-flex
                                                shrink-0
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-white
                                                px-3
                                                py-2
                                                text-xs
                                                font-semibold
                                                text-gray-600
                                                transition
                                                hover:border-gray-300
                                                hover:bg-gray-50
                                            "
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Modifier
                                        </button>

                                    </div>
                                </div>
                            )}

                            {/* Catégories déjà présentes */}

                            {boutiqueCategories.length > 0 && (
                                <div className="mt-8 border-t border-gray-100 pt-6">

                                    <div className="mb-4 flex items-center justify-between gap-3">

                                        <div>
                                            <h3 className="text-sm font-bold text-gray-950">
                                                Catégories de votre boutique
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Ces catégories sont déjà associées
                                                à votre boutique.
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-[#14a800]/10 px-2.5 py-1 text-[11px] font-bold text-[#118f00]">
                                            {boutiqueCategories.length}
                                        </span>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        {boutiqueCategories.map(
                                            (category) => (
                                                <div
                                                    key={category.id}
                                                    className="
                                                        group
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-emerald-200
                                                        bg-emerald-50/60
                                                        px-3
                                                        py-2
                                                    "
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#14a800]" />

                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {category.nom}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setRemoveCategory(
                                                                category
                                                            )
                                                        }
                                                        className="
                                                            ml-1
                                                            rounded-lg
                                                            p-1
                                                            text-gray-400
                                                            transition
                                                            hover:bg-red-50
                                                            hover:text-[#ce1126]
                                                        "
                                                        aria-label={`Retirer ${category.nom}`}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )
                                        )}

                                    </div>
                                </div>
                            )}

                        </section>
                    )}

                    {/* ==================================================
                        NOUVELLE CATÉGORIE
                    ================================================== */}

                    {mode === "new" && (
                        <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">

                            <div className="mb-6">
                                <h2 className="text-lg font-extrabold text-gray-950">
                                    Créer une nouvelle catégorie
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Définissez les informations de votre nouvelle
                                    catégorie.
                                </p>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">

                                {/* INFORMATIONS */}

                                <div className="space-y-5">

                                    <div>
                                        <label
                                            htmlFor="category-name"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Nom de la catégorie
                                            <span className="ml-1 text-[#ce1126]">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="category-name"
                                            type="text"
                                            value={nom}
                                            onChange={(event) =>
                                                setNom(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex. Accessoires de mode"
                                            maxLength={100}
                                            className="
                                                h-11
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                px-3.5
                                                text-sm
                                                text-gray-900
                                                outline-none
                                                transition
                                                placeholder:text-gray-400
                                                focus:border-[#14a800]/40
                                                focus:bg-white
                                                focus:ring-4
                                                focus:ring-[#14a800]/[0.08]
                                            "
                                        />

                                        <p className="mt-1.5 text-[11px] text-gray-400">
                                            {nom.length}/100 caractères
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category-parent"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Catégorie parente
                                        </label>

                                        <div className="relative">

                                            <select
                                                id="category-parent"
                                                value={
                                                    parentId ??
                                                    ""
                                                }
                                                onChange={(event) => {
                                                    const value =
                                                        event.target.value;

                                                    setParentId(
                                                        value
                                                            ? Number(
                                                                value
                                                            )
                                                            : null
                                                    );
                                                }}
                                                className="
                                                    h-11
                                                    w-full
                                                    appearance-none
                                                    rounded-xl
                                                    border
                                                    border-gray-200
                                                    bg-gray-50
                                                    px-3.5
                                                    pr-10
                                                    text-sm
                                                    text-gray-900
                                                    outline-none
                                                    transition
                                                    focus:border-[#14a800]/40
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-[#14a800]/[0.08]
                                                "
                                            >
                                                <option value="">
                                                    Aucune catégorie parente
                                                </option>

                                                {rootCategories.map(
                                                    (category) => (
                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.id
                                                            }
                                                        >
                                                            {
                                                                category.nom
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                        </div>

                                        <p className="mt-1.5 text-[11px] text-gray-400">
                                            Facultatif. Permet d'organiser
                                            votre catégorie dans une hiérarchie.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category-description"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="category-description"
                                            value={
                                                description
                                            }
                                            onChange={(event) =>
                                                setDescription(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Décrivez brièvement cette catégorie..."
                                            rows={6}
                                            className="
                                                w-full
                                                resize-none
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                px-3.5
                                                py-3
                                                text-sm
                                                leading-6
                                                text-gray-900
                                                outline-none
                                                transition
                                                placeholder:text-gray-400
                                                focus:border-[#14a800]/40
                                                focus:bg-white
                                                focus:ring-4
                                                focus:ring-[#14a800]/[0.08]
                                            "
                                        />

                                        <p className="mt-1.5 text-[11px] text-gray-400">
                                            Une description claire aide
                                            les clients à comprendre la catégorie.
                                        </p>
                                    </div>

                                </div>

                                {/* IMAGE */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                                        Image de la catégorie
                                    </label>

                                    <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">

                                        {imagePreview ? (
                                            <div className="relative">

                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt="Aperçu de la catégorie"
                                                    className="h-64 w-full object-cover"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={
                                                        removeSelectedImage
                                                    }
                                                    className="
                                                        absolute
                                                        right-3
                                                        top-3
                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-white
                                                        text-[#ce1126]
                                                        shadow-lg
                                                        transition
                                                        hover:bg-red-50
                                                    "
                                                    aria-label="Supprimer l'image"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="category-image"
                                                className="
                                                    flex
                                                    min-h-[256px]
                                                    cursor-pointer
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    px-6
                                                    py-8
                                                    text-center
                                                    transition
                                                    hover:bg-white
                                                "
                                            >

                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14a800]/10 text-[#14a800]">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>

                                                <h3 className="mt-4 text-sm font-bold text-gray-900">
                                                    Ajouter une image
                                                </h3>

                                                <p className="mt-1.5 max-w-xs text-xs leading-5 text-gray-500">
                                                    JPG, PNG, WEBP ou GIF.
                                                    Taille maximale : 5 Mo.
                                                </p>

                                                <span className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#14a800] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#14a800]/20 transition hover:bg-[#118f00]">
                                                    <Upload className="h-4 w-4" />
                                                    Choisir une image
                                                </span>

                                                <input
                                                    id="category-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleImageChange
                                                    }
                                                    className="sr-only"
                                                />

                                            </label>
                                        )}

                                    </div>

                                    {imageFile && (
                                        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">

                                            <div className="flex min-w-0 items-center gap-2">

                                                <ImageIcon className="h-4 w-4 shrink-0 text-[#14a800]" />

                                                <span className="truncate text-xs font-medium text-gray-600">
                                                    {imageFile.name}
                                                </span>

                                            </div>

                                            <span className="ml-3 shrink-0 text-[11px] text-gray-400">
                                                {(
                                                    imageFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                Mo
                                            </span>

                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* INFO */}

                            <div className="mt-6 rounded-2xl border border-[#14a800]/15 bg-[#14a800]/[0.035] p-4">

                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#14a800]/10 text-[#14a800]">
                                        <Check className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Une catégorie globale
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            La catégorie sera créée dans le catalogue
                                            MarketMali puis automatiquement associée
                                            à votre boutique. Elle pourra ensuite
                                            être utilisée pour vos produits.
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </section>
                    )}

                    {/* ==================================================
                        FOOTER ACTIONS
                    ================================================== */}

                    <div className="mt-5 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                        <Link
                            href="/dashboard/categories"
                            className="
                                inline-flex
                                h-11
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-5
                                text-sm
                                font-semibold
                                text-gray-600
                                transition
                                hover:border-gray-300
                                hover:bg-gray-50
                                hover:text-gray-900
                            "
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                isBusy ||
                                (mode === "existing" &&
                                    !selectedCategory) ||
                                (mode === "new" &&
                                    !nom.trim())
                            }
                            className="
                                inline-flex
                                h-11
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#14a800]
                                px-5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                shadow-[#14a800]/20
                                transition
                                hover:bg-[#118f00]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isBusy ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {mode === "existing"
                                        ? "Ajouter à ma boutique"
                                        : "Créer la catégorie"}
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>

            {/* ==========================================================
                MODAL SUPPRESSION
            ========================================================== */}

            {removeCategory && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-gray-950/40
                        p-4
                        backdrop-blur-sm
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setRemoveCategory(null);
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-gray-100 p-5">

                            <div className="flex items-start justify-between gap-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#ce1126]">
                                        <Trash2 className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-extrabold text-gray-950">
                                            Retirer la catégorie ?
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Cette action modifiera les catégories
                                            associées à votre boutique.
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setRemoveCategory(null)
                                    }
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-gray-400
                                        transition
                                        hover:bg-gray-100
                                        hover:text-gray-700
                                    "
                                >
                                    <X className="h-4 w-4" />
                                </button>

                            </div>

                        </div>

                        <div className="p-5">

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

                                <p className="text-xs font-medium text-gray-500">
                                    Catégorie concernée
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                    {removeCategory.nom}
                                </p>

                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-600">
                                La catégorie sera retirée de votre boutique.
                                Les produits utilisant encore cette catégorie
                                empêcheront automatiquement sa suppression.
                            </p>

                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setRemoveCategory(null)
                                }
                                disabled={removing}
                                className="
                                    inline-flex
                                    h-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-gray-600
                                    transition
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleRemoveCategory
                                }
                                disabled={removing}
                                className="
                                    inline-flex
                                    h-10
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#ce1126]
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#b90f22]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {removing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Retirer la catégorie
                                    </>
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}