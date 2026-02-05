import { Stethoscope } from "lucide-react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl
        bg-gray-50 px-4 py-5 text-center
        dark:bg-white/[0.03]
      `}
    >
      {/* Icono */}
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <Stethoscope size={20} />
      </div>

      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Sistema de Fisioterapia
      </h3>

      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Gestión integral de pacientes, consultas y sesiones terapéuticas en un
        solo lugar.
      </p>

      <div className="flex items-center justify-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          🩺 Pacientes
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          📋 Consultas
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          📆 Sesiones
        </span>
      </div>
    </div>
  );
}
