import Sidebar from "./composants/Sidebar";
import Header from "./composants/Header";
import { Toaster } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="flex min-h-screen">

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <Sidebar />

          {/* =================================================
              CONTENU PRINCIPAL
          ================================================== */}

          <div className="flex min-w-0 flex-1 flex-col">

            {/* Header */}

            <Header />

            {/* Contenu */}

            <main
              className="
                flex-1
                min-w-0
                px-3
                py-4
                sm:px-5
                sm:py-5
                lg:px-6
                lg:py-6
                xl:px-8
              "
            >
              <div className="mx-auto w-full max-w-[1800px]">
                {children}
              </div>
            </main>

          </div>

        </div>

        {/* =================================================
            TOASTER
        ================================================== */}

        <Toaster
          richColors
          position="top-right"
          closeButton
        />
      </div>
    </ProtectedRoute>
  );
}