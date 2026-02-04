import PageMeta from "../../components/common/PageMeta";
import FisioMetrics from "../../components/dashboard/FisioMetrics";
import RecentSessions from "../../components/dashboard/RecentSessions";
import DashboardCharts from "../../components/dashboard/DashboardCharts";

export default function Home() {
  return (
    <>
      <PageMeta title="Dashboard | Fisio" description="Panel principal del sistema de fisioterapia" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* 4 cards */}
        <div className="col-span-12">
          <FisioMetrics />
        </div>
{/* Bloque grande de charts */}
        <div className="col-span-12">
          <DashboardCharts />
        </div>
        {/* sesiones recientes + donut/mini (si quieres, ya está dentro de charts) */}
        <div className="col-span-12 xl:col-span-6">
          <RecentSessions />
        </div>

        {/* espacio a la derecha si quieres poner “alertas” */}
        <div className="col-span-12 xl:col-span-6">
          {/* Puedes poner luego: alertas, recordatorios, próximos turnos */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Próximamente: alertas / recordatorios
            </div>
          </div>
        </div>

        
      </div>
    </>
  );
}
