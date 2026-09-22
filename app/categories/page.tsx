import { Suspense } from "react";
import CategoriesContent from "./CategoriesContent";

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesContent />
    </Suspense>
  );
}