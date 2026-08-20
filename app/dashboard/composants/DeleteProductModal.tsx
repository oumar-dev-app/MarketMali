"use client";

interface Props {
  open: boolean;
  loading: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}



export default function DeleteProductModal({
  open,
  loading,
  productName,
  onClose,
  onConfirm,
}: Props) {

  if (!open) {
    return null;
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        <h2 className="text-xl font-bold mb-4">
          Supprimer le produit
        </h2>

        <p className="text-gray-600 mb-6">
          Voulez-vous vraiment supprimer
          <strong> {productName}</strong> ?
          <br />
          Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded border"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            {
              loading
                ? "Suppression..."
                : "Supprimer"
            }
          </button>

        </div>

      </div>

    </div>

  );

}