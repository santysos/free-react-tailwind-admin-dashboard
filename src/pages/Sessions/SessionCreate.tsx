import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

const paymentOptions = [
  { value: "Transferencia", label: "Transferencia" },
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
  { value: "De Una", label: "De Una" },
  { value: "Payphone", label: "Payphone" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type TherapistOpt = { value: string; label: string };

export default function SessionCreate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const consultationId = params.get("consultation_id");

  const [fecha, setFecha] = useState(todayISO());
  const [eva, setEva] = useState<string>("");
  const [observaciones, setObservaciones] = useState("");

  const [abono, setAbono] = useState<string>("");
  const [metodoPago, setMetodoPago] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");

  // ✅ Usuario actual
  const [therapistName, setTherapistName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Admin puede elegir terapista
  const [therapists, setTherapists] = useState<TherapistOpt[]>([]);
  const [therapistId, setTherapistId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    setFecha(todayISO());
    if (!consultationId) setErr("Falta consultation_id en la URL.");
    else setErr("");
  }, [consultationId]);

  // ✅ Cargar usuario actual
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);
      const user = data?.user ?? data?.data ?? data;

      const name = user?.name ?? user?.nombre ?? "";
      setTherapistName(name);

      // roles puede venir como: ["admin"] o [{name:"admin"}]
      const rolesRaw = user?.roles ?? [];
      const roles: string[] = Array.isArray(rolesRaw)
        ? rolesRaw
            .map((r: any) => (typeof r === "string" ? r : r?.name))
            .filter(Boolean)
        : [];

      const admin = roles.includes("admin");
      setIsAdmin(admin);

      // opcional: si quieres que por defecto el admin quede “sin seleccionar”
      // setTherapistId("");
    })();
  }, []);

  // ✅ Si es admin, cargar lista de terapistas
  useEffect(() => {
    if (!isAdmin) return;

    const token = getToken();
    if (!token) return;

    (async () => {
      const res = await fetch(`${API_BASE}/api/users/therapists`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      const list = Array.isArray(data)
        ? data
        : (data?.data ?? data?.users ?? []);
      const opts: TherapistOpt[] = Array.isArray(list)
        ? list.map((u: any) => ({
            value: String(u.id),
            label: u.name ? String(u.name) : `Usuario #${u.id}`,
          }))
        : [];

      setTherapists(opts);

      // si quieres auto-seleccionar el primero:
      // if (!therapistId && opts.length) setTherapistId(opts[0].value);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  function parseNumber(v: string) {
    const cleaned = String(v ?? "")
      .replace(",", ".")
      .trim();
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!consultationId)
      return setErr("No se puede registrar la sesión sin consulta.");

    const token = getToken();
    if (!token) return setErr("Sesión expirada. Inicie sesión nuevamente.");

    const evaNum = parseNumber(eva);
    if (evaNum !== null && (evaNum < 0 || evaNum > 10)) {
      return setErr("EVA debe estar entre 0 y 10.");
    }

    const abonoNum = parseNumber(abono);
    if (abonoNum !== null && abonoNum < 0) {
      return setErr("El abono no puede ser negativo.");
    }

    if (abonoNum !== null && abonoNum > 0 && !metodoPago) {
      return setErr("Seleccione un método de pago.");
    }

    // ✅ Si es admin, exige terapista seleccionado (recomendado)
    if (isAdmin && !therapistId) {
      return setErr("Seleccione el terapista que realizó la sesión.");
    }

    const payload: any = {
      consultation_id: Number(consultationId),
      fecha,
      observaciones: observaciones.trim() ? observaciones.trim() : null,
      metodo_pago: metodoPago ? metodoPago : null,
      referencia_pago: referenciaPago.trim() ? referenciaPago.trim() : null,
    };

    if (evaNum !== null) payload.eva = evaNum;
    if (abonoNum !== null) payload.abono = abonoNum;

    // ✅ Solo admin envía therapist_id
    if (isAdmin && therapistId) payload.therapist_id = Number(therapistId);

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/treatment-sessions`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
          (data?.errors
            ? JSON.stringify(data.errors)
            : "Error al registrar sesión");
        throw new Error(msg);
      }

      navigate(-1);
    } catch (e: any) {
      setErr(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta title="Nueva sesión | Fisio" description="Registrar sesión" />

      <ComponentCard title="Registrar sesión">
        <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
          {/* Encabezado */}
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 space-y-1">
            <div>
              <strong>Consulta:</strong>{" "}
              {consultationId ? `#${consultationId}` : "No definida"}
            </div>

            {!isAdmin ? (
              <div>
                <strong>Terapista:</strong> {therapistName || "—"}
              </div>
            ) : (
              <div className="pt-2">
                <Label>Terapista (Admin)</Label>
                <Select
                  // ✅ tu Select es “semi-controlado”, por eso usamos key + defaultValue
                  key={therapistId}
                  options={therapists}
                  placeholder={
                    therapists.length
                      ? "Seleccione terapista"
                      : "Cargando terapistas..."
                  }
                  defaultValue={therapistId}
                  onChange={(value) => setTherapistId(value)}
                  className="dark:bg-dark-900"
                />
              </div>
            )}
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}

          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha((e.target as HTMLInputElement).value)}
            />
          </div>

          <div>
            <Label>EVA (0 – 10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={eva}
              onChange={(e) => setEva((e.target as HTMLInputElement).value)}
              placeholder="Ej: 5"
            />
          </div>

          <div>
            <Label>Observaciones</Label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Evolución del paciente, molestias, avances…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Abono</Label>
              <input
                type="text"
                value={abono}
                onChange={(e) => setAbono(e.target.value)}
                placeholder="Ej: 20.00"
                inputMode="decimal"
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div>
              <Label>Método de pago</Label>
              <Select
                key={metodoPago}
                options={paymentOptions}
                placeholder="Seleccione"
                defaultValue={metodoPago}
                onChange={(value) => setMetodoPago(value)}
                className="dark:bg-dark-900"
              />
            </div>
          </div>

          <div>
            <Label>Referencia de pago</Label>
            <Input
              value={referenciaPago}
              onChange={(e) =>
                setReferenciaPago((e.target as HTMLInputElement).value)
              }
              placeholder="N° comprobante / referencia"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="rounded-lg border px-4 py-3 text-sm transition border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-60"
            >
              Volver
            </button>

            <Button size="sm" disabled={loading}>
              {loading ? "Guardando..." : "Guardar sesión"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
