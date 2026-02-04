import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function ConsultationEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const consultationId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const EJ_OPTS = ["PS", "AC", "DR", "Fuerza", "Estiramientos", "Propiocepción"];

  const toggleInArray = (arr: string[], value: string) => {
    if (arr.includes(value)) return arr.filter((x) => x !== value);
    return [...arr, value];
  };

  const parseMoney = (v: string) => {
    const cleaned = String(v ?? "").replace(",", ".").trim();
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  // ✅ Cargar consulta (GET)
  useEffect(() => {
    if (!consultationId) {
      setError("ID de consulta inválido.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("No hay token. Inicie sesión primero.");
      return;
    }

    (async () => {
      setError(null);
      setLoadingData(true);

      try {
        const res = await fetch(`${API_BASE}/api/consultations/${consultationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await safeJson(res);

        if (res.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Sesión expirada. Inicie sesión nuevamente.");
        }

        if (!res.ok) {
          const msg = data?.message || "No se pudo cargar la consulta.";
          throw new Error(msg);
        }

        // Ajusta según tu backend (data.consultation o data directo)
        const c = data?.consultation ?? data;

        // patient_id solo para referencia (no editable aquí)
        // setPatientId(c?.patient_id ?? null) // no lo usamos para editar

        setFecha(c?.fecha || todayISO());
        setMotivo(c?.motivo_consulta ?? "");
        setDiagnostico(c?.diagnostico ?? "");
        setSesionesPlan(Number(c?.sesiones_planificadas ?? 0) || 0);

        // zonas_json: { seleccion: [] }
        const zonasSel = c?.zonas_json?.seleccion;
        setZonas(Array.isArray(zonasSel) ? zonasSel : []);

        // protocolo_json: { tecnicas: [], otros: [] }
        const tec = c?.protocolo_json?.tecnicas;
        setTecnicas(Array.isArray(tec) ? tec : []);

        const otrosArr = c?.protocolo_json?.otros;
        setOtrosTexto(Array.isArray(otrosArr) ? otrosArr.join(", ") : "");

        // ejercicios_json: { realizo: boolean, tipos: [] }
        setRealizoEjercicios(Boolean(c?.ejercicios_json?.realizo ?? true));
        const tipos = c?.ejercicios_json?.tipos;
        setTiposEj(Array.isArray(tipos) ? tipos : []);

        // valores
        setValorSesion(
          c?.valor_sesion === null || c?.valor_sesion === undefined
            ? ""
            : String(c.valor_sesion)
        );
        setValorPaquete(
          c?.valor_paquete === null || c?.valor_paquete === undefined
            ? ""
            : String(c.valor_paquete)
        );
      } catch (err: any) {
        setError(err?.message || "Error inesperado");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [consultationId]);

  // ✅ Actualizar (PUT)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consultationId) {
      setError("ID de consulta inválido.");
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

      ...(vSesion !== null ? { valor_sesion: vSesion } : { valor_sesion: null }),
      ...(vPaquete !== null ? { valor_paquete: vPaquete } : { valor_paquete: null }),
    };

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/consultations/${consultationId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Sesión expirada. Inicie sesión nuevamente.");
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (data?.errors ? JSON.stringify(data.errors) : "Error al actualizar consulta");
        throw new Error(msg);
      }

      navigate(-1);
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Editar consulta | Fisio" description="Editar consulta" />

      <ComponentCard title="Editar consulta">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Consulta:</strong> {consultationId ? `#${consultationId}` : "—"}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="text-sm text-gray-500">Cargando consulta…</div>
          ) : (
            <>
              {/* Fecha */}
              <div>
                <DatePicker
                  id="fecha"
                  label="Fecha"
                  placeholder="Seleccione una fecha"
                  onChange={(_dates: any, currentDateString: string) => {
                    setFecha(currentDateString || "");
                  }}
                />

                {fecha && (
                  <div className="mt-1 text-xs text-gray-500">
                    Seleccionado: {fecha}
                  </div>
                )}
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
                    value={valorSesion}
                    onChange={(e) => setValorSesion(e.target.value)}
                    placeholder="Ej: 20.00"
                  />
                </div>

                <div>
                  <Label>Valor paquete (opcional)</Label>
                  <Input
                    value={valorPaquete}
                    onChange={(e) => setValorPaquete(e.target.value)}
                    placeholder="Ej: 250.00"
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
                        onClick={() => setTecnicas((prev) => toggleInArray(prev, t))}
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
                  {loading ? "Guardando..." : "Actualizar consulta"}
                </Button>
              </div>
            </>
          )}
        </form>
      </ComponentCard>
    </>
  );
}
