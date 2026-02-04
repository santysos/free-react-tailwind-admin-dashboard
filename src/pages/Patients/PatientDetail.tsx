import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { patientHistory } from "../../services/patients";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pid = Number(id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await patientHistory(pid);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pid) load();
  }, [pid]);

  const patient = data?.patient;
  const consultations = data?.consultations || [];

  return (
    <>
      <PageMeta title="Paciente | Fisio" description="Detalle del paciente" />

      <ComponentCard title="Paciente">
        {loading && <div className="text-sm text-gray-500">Cargando...</div>}

        {!loading && !patient && (
          <div className="text-sm text-gray-500">
            No se encontró el paciente.
            <div className="mt-3">
              <Button size="sm" onClick={() => navigate(-1)}>
                Volver
              </Button>
            </div>
          </div>
        )}

        {patient && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">
                {patient.nombres} {patient.apellidos}
              </div>
              <div className="text-sm text-gray-500">
                Cédula: {patient.identificacion || "—"} · Cel:{" "}
                {patient.celular || "—"} · Sector: {patient.sector || "—"}
              </div>
            </div>

            <div className="flex flex-row gap-2">
              <Link to={`/patients/${patient.id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<Pencil size={16} />}
                >
                  <span>Editar paciente</span>
                </Button>
              </Link>
              <Link to={`/consultations/create?patient_id=${patient.id}`}>
                <Button size="sm" startIcon={<Plus size={16} />}>
                  <span>Nueva consulta</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </ComponentCard>

      <div className="mt-6">
        <ComponentCard title="Historial de consultas">
          <div className="space-y-4">
            {consultations.map((c: any) => (
              <div
                key={c.id}
                className="rounded-lg border dark:border-gray-800 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-semibold">
                      {c.fecha} · {c.motivo_consulta || "—"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Diagnóstico: {c.diagnostico || "—"}
                    </div>
                    <div className="mt-3 space-y-2">
  {/* Progreso de sesiones */}
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">
      Sesiones realizadas
    </span>
    <span className="font-medium text-gray-800 dark:text-gray-200">
      {c.sesiones_realizadas} / {c.sesiones_planificadas}
    </span>
  </div>

  {/* Barra de progreso */}
  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
    <div
      className="h-full rounded-full bg-brand-500 transition-all"
      style={{
        width: `${
          c.sesiones_planificadas
            ? (c.sesiones_realizadas / c.sesiones_planificadas) * 100
            : 0
        }%`,
      }}
    />
  </div>

  {/* Estado y montos */}
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
    <span>
      <strong>Pendientes:</strong> {c.sesiones_pendientes}
    </span>

    <span>
      <strong>Pago:</strong>{" "}
      <span
        className={
          c.saldo > 0
            ? "text-warning-600"
            : "text-success-600"
        }
      >
        {c.estado_pago}
      </span>
    </span>

    <span>
      <strong>Total:</strong> {c.valor_total ?? "—"}
    </span>

    <span>
      <strong>Abonado:</strong> {c.total_abonado ?? "—"}
    </span>

    <span>
      <strong>Saldo:</strong>{" "}
      <span
        className={
          Number(c.saldo) > 0
            ? "text-error-600"
            : "text-success-600"
        }
      >
        {c.saldo ?? "—"}
      </span>
    </span>
  </div>
</div>

                  </div>

                  <div className="flex flex-row gap-2">
                    {/* Editar consulta */}
                    <Link to={`/consultations/${c.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        startIcon={<Pencil size={16} />}
                      >
                        <span>Editar consulta</span>
                      </Button>
                    </Link>

                    {/* Nueva sesión */}
                    <Link to={`/sessions/create?consultation_id=${c.id}`}>
                      <Button size="sm" startIcon={<Plus size={16} />}>
                        <span>Nueva sesión</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">
                    Últimas 5 sesiones
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b dark:border-gray-800">
                          <th className="py-2">Fecha</th>
                          <th>EVA</th>
                          <th>Abono</th>
                          <th>Método</th>
                          <th>Obs.</th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {(c.ultimas_sesiones || []).map((s: any) => (
                          <tr
                            key={s.id}
                            className="border-b dark:border-gray-800"
                          >
                            <td className="py-2">{s.fecha}</td>
                            <td>{s.eva ?? "—"}</td>
                            <td>{s.abono ?? "—"}</td>
                            <td>{s.metodo_pago ?? "—"}</td>
                            <td className="truncate max-w-[320px]">
                              {s.observaciones ?? "—"}
                            </td>
                            <td className="py-2">
                              <Link to={`/sessions/${s.id}/edit`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<Pencil size={14} />}
                                >
                                  <span className="sr-only">Editar sesión</span>
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}

                        {(!c.ultimas_sesiones ||
                          c.ultimas_sesiones.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-3 text-gray-500">
                              Sin sesiones registradas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            {!consultations.length && (
              <div className="text-sm text-gray-500">
                Este paciente aún no tiene consultas.
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
