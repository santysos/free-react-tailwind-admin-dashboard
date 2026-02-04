import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token") || "";
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calcularEdad(fechaNacimiento?: string | null) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  if (Number.isNaN(nac.getTime())) return null;

  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function pickPatient(data: any) {
  return data?.patient ?? data?.data?.patient ?? data?.data ?? data;
}

export default function ConsultationCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const patientId = useMemo(() => {
    const raw = params.get("patient_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Encabezado paciente
  const [patient, setPatient] = useState<any>(null);
  const [ultimaConsulta, setUltimaConsulta] = useState<string>("");

  // Campos base
  const [fecha, setFecha] = useState(todayISO());
  const [motivo, setMotivo] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [sesionesPlan, setSesionesPlan] = useState<number>(10);

  // Zonas (multi)
  const [zonas, setZonas] = useState<string[]>([]);

  // Protocolo (técnicas + otros)
  const [tecnicas, setTecnicas] = useState<string[]>([]);
  const [otrosTexto, setOtrosTexto] = useState("");

  // Ejercicios
  const [realizoEjercicios, setRealizoEjercicios] = useState(true);
  const [tiposEj, setTiposEj] = useState<string[]>([]);

  // Pagos / valores
  const [valorSesion, setValorSesion] = useState<string>("");
  const [valorPaquete, setValorPaquete] = useState<string>("");

  // ✅ Al abrir "crear consulta": fecha hoy + cargar paciente + última consulta
  useEffect(() => {
    setFecha(todayISO());

    if (!patientId) return;

    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        // 1) Paciente
        const resP = await fetch(`${API_BASE}/api/patients/${patientId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const dataP = await resP.json().catch(() => null);
        if (resP.ok) setPatient(pickPatient(dataP));

        // 2) Última consulta (ruta típica)
        const resC = await fetch(
          `${API_BASE}/api/consultations?patient_id=${patientId}&limit=1&order=desc`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const dataC = await resC.json().catch(() => null);

        const list =
          dataC?.consultations ??
          dataC?.items ??
          dataC?.data ??
          (Array.isArray(dataC) ? dataC : []);

        const last = Array.isArray(list) && list.length ? list[0] : null;
        const f = last?.fecha ?? last?.date ?? last?.created_at ?? "";

        setUltimaConsulta(typeof f === "string" ? f.slice(0, 10) : "");
      } catch {
        // no bloquea el formulario
      }
    })();
  }, [patientId]);

  const ZONAS_OPTS = [
    "cuello",
    "hombro",
    "codo",
    "muñeca",
    "mano",
    "espalda alta",
    "espalda baja",
    "cadera",
    "rodilla",
    "tobillo",
    "pie",
  ];

  const TECNICAS_OPTS = ["CQC", "US", "MS", "TENS", "Calor", "Frío", "Masaje"];

  const EJ_OPTS = [
    "PS",
    "AC",
    "DR",
    "Fuerza",
    "Estiramientos",
    "Propiocepción",
  ];

  const toggleInArray = (arr: string[], value: string) => {
    if (arr.includes(value)) return arr.filter((x) => x !== value);
    return [...arr, value];
  };

  const parseMoney = (v: string) => {
    const cleaned = v.replace(",", ".").trim();
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError(
        "Falta patient_id en la URL. Ej: /consultations/create?patient_id=1",
      );
      return;
    }

    if (!motivo.trim()) {
      setError("Ingrese el motivo de consulta.");
      return;
    }

    if (!diagnostico.trim()) {
      setError("Ingrese el diagnóstico.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("No hay token. Inicie sesión primero.");
      return;
    }

    const vSesion = parseMoney(valorSesion);
    const vPaquete = parseMoney(valorPaquete);

    const payload = {
      patient_id: patientId,
      fecha,
      motivo_consulta: motivo.trim(),
      diagnostico: diagnostico.trim(),
      sesiones_planificadas: Number(sesionesPlan) || 0,

      zonas_json: { seleccion: zonas },

      protocolo_json: {
        tecnicas,
        otros: otrosTexto
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },

      ejercicios_json: {
        realizo: realizoEjercicios,
        tipos: tiposEj,
      },

      ...(vSesion !== null ? { valor_sesion: vSesion } : {}),
      ...(vPaquete !== null ? { valor_paquete: vPaquete } : {}),
    };

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/consultations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ||
          (data?.errors
            ? JSON.stringify(data.errors)
            : "Error al crear consulta");
        throw new Error(msg);
      }

      // según tu backend
      // const newId = data?.consultation?.id;

      navigate(`/patients/${patientId}`, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const patientNombre = patient
    ? `${patient.nombres ?? ""} ${patient.apellidos ?? ""}`.trim()
    : "";
  const edad =
    patient?.edad ??
    (patient?.fecha_nacimiento ? calcularEdad(patient.fecha_nacimiento) : null);

  return (
    <>
      <PageMeta title="Nueva consulta | Fisio" description="Crear consulta" />

      <ComponentCard title="Nueva Consulta">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Encabezado paciente */}
          <div className="mb-4 border-l-4 border-brand-500 pl-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {patientNombre || `Paciente #${patientId}`}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {edad !== null ? `${edad} años` : "—"} ·{" "}
              {ultimaConsulta
                ? `Última consulta: ${ultimaConsulta}`
                : "Sin consultas previas"}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Fecha */}
          <div>
            <DatePicker
              key={fecha} // ✅ remount si cambia fecha
              id="fecha"
              label="Fecha"
              placeholder="Seleccione una fecha"
              defaultDate={fecha} // ✅ hoy por defecto y visible
              onChange={(_dates: any, currentDateString: string) => {
                setFecha(currentDateString || todayISO());
              }}
            />

            <div className="mt-1 text-xs text-gray-500">
              Seleccionado: {fecha}
            </div>
          </div>

          {/* Motivo / Diagnóstico */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <Label>Motivo de consulta *</Label>
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Esguince de tobillo derecho"
              />
            </div>

            <div>
              <Label>Diagnóstico / Objetivo *</Label>
              <Input
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ej: Mejorar estabilidad, disminuir dolor"
              />
            </div>
          </div>

          {/* Sesiones planificadas */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <Label>Sesiones planificadas</Label>
              <Input
                type="number"
                min="0"
                value={String(sesionesPlan)}
                onChange={(e) => setSesionesPlan(Number(e.target.value))}
                placeholder="15"
              />
            </div>

            <div>
              <Label>Valor por sesión (opcional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                inputMode="numeric"
                value={valorSesion}
                onChange={(e) => setValorSesion(e.target.value)}
                placeholder="Ej: 20"
              />
            </div>

            <div>
              <Label>Valor paquete (opcional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                inputMode="numeric"
                value={valorPaquete}
                onChange={(e) => setValorPaquete(e.target.value)}
                placeholder="Ej: 250"
              />
            </div>
          </div>

          {/* Zonas */}
          <div>
            <Label>Zonas afectadas</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {ZONAS_OPTS.map((z) => {
                const active = zonas.includes(z);
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZonas((prev) => toggleInArray(prev, z))}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-white/5 dark:text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Protocolo */}
          <div>
            <Label>Protocolo (técnicas)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {TECNICAS_OPTS.map((t) => {
                const active = tecnicas.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setTecnicas((prev) => toggleInArray(prev, t))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-white/5 dark:text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <Label>Otros (separados por coma)</Label>
              <Input
                value={otrosTexto}
                onChange={(e) => setOtrosTexto(e.target.value)}
                placeholder="Ej: Vendaje, Punción seca"
              />
            </div>
          </div>

          {/* Ejercicios */}
          <div>
            <Label>Ejercicios</Label>

            <div className="mt-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={realizoEjercicios}
                onChange={(e) => setRealizoEjercicios(e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Se realizó ejercicios en consulta
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {EJ_OPTS.map((t) => {
                const active = tiposEj.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTiposEj((prev) => toggleInArray(prev, t))}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-white/5 dark:text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="rounded-lg border px-4 py-3 text-sm transition border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-60"
            >
              Volver
            </button>

            <Button size="sm" disabled={loading}>
              {loading ? "Guardando..." : "Guardar consulta"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
