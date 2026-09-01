"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  Loader2,
  QrCode,
  X,
} from "lucide-react";

interface LivreurQrScannerProps {
  livraisonUuid: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function LivreurQrScanner({
  livraisonUuid,
  onSuccess,
  onClose,
}: LivreurQrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const [starting, setStarting] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn(
        "Impossible d'arrêter le scanner QR :",
        error
      );
    }

    scanner.clear();

    scannerRef.current = null;
  }

  async function verifyQr(qrToken: string) {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    setVerifying(true);
    setError("");

    try {
      await stopScanner();

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Session d'authentification introuvable. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(
        `/api/livraisons/${livraisonUuid}/verify-pickup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            qrToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
          "Le QR code est invalide."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du QR :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de vérifier le QR code."
      );

      processingRef.current = false;
      setVerifying(false);

      /*
       * On redémarre le scanner après une erreur.
       */
      setTimeout(() => {
        startScanner();
      }, 1200);
    }
  }

  async function startScanner() {
    setError("");
    setStarting(true);

    try {
      /*
       * S'assurer qu'un ancien scanner
       * est complètement arrêté.
       */
      await stopScanner();

      const scanner =
        new Html5Qrcode("livreur-qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await verifyQr(decodedText);
        },
        () => {
          /*
           * Les erreurs de lecture sont normales
           * pendant le scan. On ne les affiche pas.
           */
        }
      );

      setStarting(false);
    } catch (error) {
      console.error(
        "Erreur caméra QR :",
        error
      );

      setStarting(false);

      setError(
        "Impossible d'accéder à la caméra. Vérifiez que l'autorisation caméra est activée."
      );
    }
  }

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <QrCode size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Scanner le colis
              </h2>

              <p className="text-xs text-gray-500">
                Scannez le QR présenté par le vendeur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner */}
        <div className="relative bg-black">

          <div
            id="livreur-qr-reader"
            className="min-h-[330px] w-full overflow-hidden"
          />

          {starting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
              <Loader2
                size={36}
                className="animate-spin"
              />

              <p className="mt-3 text-sm font-medium">
                Activation de la caméra...
              </p>
            </div>
          )}

          {verifying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white">
              <Loader2
                size={42}
                className="animate-spin"
              />

              <p className="mt-4 font-semibold">
                Vérification du QR...
              </p>

              <p className="mt-1 text-xs text-gray-300">
                Veuillez patienter
              </p>
            </div>
          )}

          {success && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-600/95 text-white">
              <CheckCircle2 size={64} />

              <p className="mt-4 text-xl font-bold">
                QR validé
              </p>

              <p className="mt-1 text-sm text-green-100">
                Colis récupéré avec succès
              </p>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="p-5">

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  processingRef.current = false;
                  startScanner();
                }}
                className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-4 text-center">
              <Camera
                size={22}
                className="mx-auto text-gray-500"
              />

              <p className="mt-2 text-sm font-medium text-gray-700">
                Placez le QR code dans le cadre
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Le scan est automatique.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
