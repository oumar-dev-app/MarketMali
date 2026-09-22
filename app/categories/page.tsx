import CategoriesContent from "./CategoriesContent";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    parent?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <CategoriesContent
      parentSlug={params.parent ?? ""}
    />
  );
}
