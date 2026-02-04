import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboard";
import { GroupIcon, BoxIconLine, TableIcon, AlertIcon } from "../../icons";

export default function FisioMetrics() {
  const [cards, setCards] = useState<{
    patients_total: number;
    sessions_today: number;
    consultations_month: number;
    income_month: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getDashboardSummary();
      setCards(data.cards);
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <Metric
        title="Pacientes"
        value={cards ? String(cards.patients_total) : "—"}
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
      />
      <Metric
        title="Sesiones hoy"
        value={cards ? String(cards.sessions_today) : "—"}
        icon={<BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />}
      />
      <Metric
        title="Consultas del mes"
        value={cards ? String(cards.consultations_month) : "—"}
        icon={<TableIcon className="text-gray-800 size-6 dark:text-white/90" />}
      />
      <Metric
        title="Ingresos del mes"
        value={cards ? `$${cards.income_month}` : "—"}
        icon={<AlertIcon className="text-gray-800 size-6 dark:text-white/90" />}
      />
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
}
