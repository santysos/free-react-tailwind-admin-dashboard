import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
        {/* Lado izquierdo: formularios (login / registro) */}
        {children}

        {/* Lado derecho: branding */}
        <div className="hidden h-full w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
          <div className="relative z-1 flex items-center justify-center">
            {/* Fondo decorativo */}
            <GridShape />

            <div className="flex max-w-xs flex-col items-center text-center">
              <Link to="/" className="mb-4 block">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/logo-motrix-bl.png"
                  alt="Sistema de Fisioterapia"
                />
              </Link>

              <p className="text-sm text-gray-300 dark:text-white/70">
                Sistema integral de fisioterapia para la gestión de pacientes,
                consultas y sesiones terapéuticas en un solo lugar.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle de tema */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
