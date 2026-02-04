import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../../services/dashboard";

type Row = {
  id: number;
  fecha: string | null;
  eva: number | null;
  abono: string | number | null;
  metodo_pago: string | null;
  patient_id: number | null;
  patient_name: string;
  consultation_id: number | null;
};

export default function RecentSessions() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardSummary();
        setRows(data.latest_sessions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sesiones recientes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Últimas 10 sesiones registradas
          </p>
        </div>

        <Link
          to="/patients"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Ver pacientes
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="py-2 text-left">Fecha</th>
              <th className="text-left">Paciente</th>
              <th className="text-center">EVA</th>
              <th className="text-right">Abono</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && (
              <tr>
                <td colSpan={4} className="py-4 text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-gray-500">
                  No hay sesiones registradas aún.
                </td>
              </tr>
            )}

            {rows.map((s) => (
              <tr key={s.id}>
                <td className="py-3">{s.fecha ?? "—"}</td>
                <td className="py-3">
                  {s.patient_id ? (
                    <Link
                      to={`/patients/${s.patient_id}`}
                      className="font-medium text-gray-800 hover:text-brand-600 dark:text-white/90"
                    >
                      {s.patient_name}
                    </Link>
                  ) : (
                    s.patient_name
                  )}
                </td>
                <td className="py-3 text-center">{s.eva ?? "—"}</td>
                <td className="py-3 text-right">
                  {s.abono !== null && s.abono !== undefined ? `$${s.abono}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
