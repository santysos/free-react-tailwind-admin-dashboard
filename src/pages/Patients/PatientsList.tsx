import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { listPatients } from "../../services/patients";

function money(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v);
}

function pickLastConsultation(p: any) {
  // Soporta distintos nombres según tu API
  return (
    p?.ultima_consulta ||
    p?.last_consultation ||
    p?.lastConsultation ||
    p?.consultation_last ||
    null
  );
}

export default function PatientsList() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listPatients({ q });
      const items = Array.isArray(data?.data)
        ? data.data
        : data?.patients || [];
      setRows(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageMeta title="Pacientes | Fisio" description="Listado de pacientes" />
      <ComponentCard title="Pacientes">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar por cédula o nombre..."
              value={q}
              onChange={(e) => setQ((e.target as HTMLInputElement).value)}
            />
            <Button size="sm" onClick={load} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          <Link to="/patients/new">
            <Button size="sm">+ Nuevo paciente</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b dark:border-gray-800">
                <th className="py-3">Cédula</th>
                <th>Nombre</th>
                <th>Celular</th>
                <th>Última consulta</th>
                <th>Sesiones (última)</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((p) => {
                const c = pickLastConsultation(p);

                // pagos
                const abonado =
                  c?.total_abonado ?? c?.abonado ?? c?.totalAbonado ?? null;
                const saldo = c?.saldo ?? null;

                // sesiones
                const total =
                  c?.sesiones_planificadas ?? c?.sesionesPlanificadas ?? null;
                const realizadas =
                  c?.sesiones_realizadas ?? c?.sesionesRealizadas ?? null;

                const faltantes =
                  c?.sesiones_pendientes ??
                  c?.sesionesPendientes ??
                  (Number.isFinite(Number(total)) &&
                  Number.isFinite(Number(realizadas))
                    ? Math.max(0, Number(total) - Number(realizadas))
                    : null);

                return (
                  <tr key={p.id} className="border-b dark:border-gray-800">
                    <td className="py-3">{p.identificacion || "—"}</td>

                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {p.nombres} {p.apellidos}
                      </div>
                    </td>

                    <td>{p.celular || "—"}</td>
                    <td>
                      {c ? (
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium
                         border-gray-200 text-gray-700 bg-white
                         dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            >
                              Abono:{" "}
                              <span className="ml-1 font-semibold">
                                {money(abonado)}
                              </span>
                            </span>

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium
                          dark:border-gray-800 ${
                            (saldo ?? 0) <= 0
                              ? "border-success-200 bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                              : "border-warning-200 bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                          }`}
                            >
                              Saldo:{" "}
                              <span className="ml-1 font-semibold">
                                {money(saldo)}
                              </span>
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Última consulta:{" "}
                            <span className="font-medium">
                              {c.fecha ?? "—"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          —
                          <div className="text-xs mt-1">
                            Sin consultas previas
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      {c ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {realizadas ?? "—"}/{total ?? "—"}
                            </div>

                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Faltan:{" "}
                              <span className="font-medium">
                                {faltantes ?? "—"}
                              </span>
                            </span>
                          </div>

                          {/* mini barra visual */}
                          {typeof realizadas === "number" &&
                            typeof total === "number" &&
                            total > 0 && (
                              <div className="h-1.5 w-40 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                  className="h-full bg-brand-500"
                                  style={{
                                    width: `${Math.min(100, (realizadas / total) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <Link
                        to={`/patients/${p.id}`}
                        className="text-brand-500 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No hay pacientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </>
  );
}
