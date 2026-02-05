// src/pages/patients/PatientCreate.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";

import { createPatient } from "../../services/patients";

type FormState = {
  identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  celular: string;
  sector: string;
  antecedentes: string;
  alergias: string;
  actividad: string;
  canal: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const trimOneSpace = (s: string) => s.replace(/\s+/g, " ").trim();
const isOnlyLettersSpaces = (s: string) =>
  /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/.test(s);

function toNullIfEmpty(v: string) {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
}

// Clases TailAdmin (las mismas que usa tu InputField para estado "normal")
const baseInputClass =
  "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function PatientCreate() {
  const nav = useNavigate();

  const [form, setForm] = useState<FormState>({
    identificacion: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    celular: "",
    sector: "",
    antecedentes: "",
    alergias: "",
    actividad: "",
    canal: "",
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [loading, setLoading] = useState(false);
  const [errGeneral, setErrGeneral] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const markTouched = (k: keyof FormState) => setTouched((t) => ({ ...t, [k]: true }));

  const errors: FormErrors = useMemo(() => {
    const e: FormErrors = {};

    // Cédula (opcional, pero si se llena: 10 dígitos)
    if (form.identificacion.trim() !== "") {
      const ced = onlyDigits(form.identificacion);
      if (ced.length !== 10) e.identificacion = "La cédula debe tener 10 dígitos.";
    }

    // Nombres / Apellidos (requeridos y solo letras/espacios)
    const nombres = trimOneSpace(form.nombres);
    if (!nombres) e.nombres = "Ingrese nombres.";
    else if (!isOnlyLettersSpaces(nombres)) e.nombres = "Solo letras y espacios.";

    const apellidos = trimOneSpace(form.apellidos);
    if (!apellidos) e.apellidos = "Ingrese apellidos.";
    else if (!isOnlyLettersSpaces(apellidos)) e.apellidos = "Solo letras y espacios.";

    // Celular (opcional, pero si se llena: 10 dígitos)
    if (form.celular.trim() !== "") {
      const cel = onlyDigits(form.celular);
      if (cel.length !== 10) e.celular = "El celular debe tener 10 dígitos.";
    }

    // Fecha (opcional). Si viene, valida formato + no futuro.
    if (form.fecha_nacimiento) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_nacimiento)) {
        e.fecha_nacimiento = "Fecha inválida.";
      } else {
        const d = new Date(form.fecha_nacimiento + "T00:00:00");
        if (Number.isNaN(d.getTime())) e.fecha_nacimiento = "Fecha inválida.";
        else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (d > today) e.fecha_nacimiento = "La fecha no puede ser futura.";
        }
      }
    }

    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrGeneral(null);

    // marca todo para mostrar errores
    setTouched({
      identificacion: true,
      nombres: true,
      apellidos: true,
      fecha_nacimiento: true,
      celular: true,
      sector: true,
      antecedentes: true,
      alergias: true,
      actividad: true,
      canal: true,
    });

    if (hasErrors) return;

    setLoading(true);
    try {
      const payload = {
        identificacion: form.identificacion.trim()
          ? onlyDigits(form.identificacion)
          : null,
        nombres: trimOneSpace(form.nombres),
        apellidos: trimOneSpace(form.apellidos),
        fecha_nacimiento: toNullIfEmpty(form.fecha_nacimiento),
        celular: form.celular.trim() ? onlyDigits(form.celular) : null,
        sector: toNullIfEmpty(form.sector),
        antecedentes: toNullIfEmpty(form.antecedentes),
        alergias: toNullIfEmpty(form.alergias),
        actividad: toNullIfEmpty(form.actividad),
        canal: toNullIfEmpty(form.canal),
      };

      const res = await createPatient(payload as any);
      const id = res?.patient?.id;

      nav(id ? `/patients/${id}` : "/patients", { replace: true });
    } catch (error: any) {
      setErrGeneral(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo crear el paciente"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta title="Nuevo paciente | Fisio" description="Crear paciente" />

      <ComponentCard title="Nuevo paciente">
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          {/* Cédula (usa input nativo por inputMode/maxLength/onBlur) */}
          <div>
            <Label>Cédula</Label>
            <input
              className={baseInputClass}
              value={form.identificacion}
              inputMode="numeric"
              maxLength={10}
              placeholder="10 dígitos"
              onBlur={() => markTouched("identificacion")}
              onChange={(e) =>
                set("identificacion", onlyDigits(e.target.value).slice(0, 10))
              }
            />
            {touched.identificacion && errors.identificacion && (
              <div className="mt-1 text-xs text-red-600">
                {errors.identificacion}
              </div>
            )}
          </div>

          {/* Nombres / Apellidos (usa input nativo por required/onBlur) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Nombres *</Label>
              <input
                className={baseInputClass}
                value={form.nombres}
                onBlur={() => markTouched("nombres")}
                onChange={(e) => set("nombres", e.target.value)}
                required
              />
              {touched.nombres && errors.nombres && (
                <div className="mt-1 text-xs text-red-600">{errors.nombres}</div>
              )}
            </div>

            <div>
              <Label>Apellidos *</Label>
              <input
                className={baseInputClass}
                value={form.apellidos}
                onBlur={() => markTouched("apellidos")}
                onChange={(e) => set("apellidos", e.target.value)}
                required
              />
              {touched.apellidos && errors.apellidos && (
                <div className="mt-1 text-xs text-red-600">
                  {errors.apellidos}
                </div>
              )}
            </div>
          </div>

          {/* DatePicker / Celular */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <DatePicker
                id="fecha_nacimiento"
                label="Fecha de nacimiento"
                placeholder="Seleccione una fecha"
                onChange={(_dates: any, currentDateString: string) => {
                  set("fecha_nacimiento", currentDateString || "");
                  markTouched("fecha_nacimiento");
                }}
              />

              {touched.fecha_nacimiento && errors.fecha_nacimiento && (
                <div className="mt-1 text-xs text-red-600">
                  {errors.fecha_nacimiento}
                </div>
              )}

              {form.fecha_nacimiento && (
                <div className="mt-1 text-xs text-gray-500">
                  Seleccionado: {form.fecha_nacimiento}
                </div>
              )}
            </div>

            <div>
              <Label>Celular</Label>
              <input
                className={baseInputClass}
                value={form.celular}
                inputMode="numeric"
                maxLength={10}
                placeholder="10 dígitos"
                onBlur={() => markTouched("celular")}
                onChange={(e) =>
                  set("celular", onlyDigits(e.target.value).slice(0, 10))
                }
              />
              {touched.celular && errors.celular && (
                <div className="mt-1 text-xs text-red-600">{errors.celular}</div>
              )}
            </div>
          </div>

          {/* Sector / Actividad (puede seguir con tu InputField sin props extra) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Sector</Label>
              <Input
                value={form.sector}
                onChange={(e) => set("sector", e.target.value)}
              />
            </div>
            <div>
              <Label>Actividad / Ocupación</Label>
              <Input
                value={form.actividad}
                onChange={(e) => set("actividad", e.target.value)}
              />
            </div>
          </div>

          {/* Canal */}
          <div>
            <Label>Canal</Label>
            <Input
              value={form.canal}
              onChange={(e) => set("canal", e.target.value)}
            />
          </div>

          {/* Antecedentes */}
          <div>
            <Label>Antecedentes médicos</Label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-dark-900 dark:border-gray-800"
              rows={3}
              value={form.antecedentes}
              onChange={(e) => set("antecedentes", e.target.value)}
            />
          </div>

          {/* Alergias */}
          <div>
            <Label>Alergias</Label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-dark-900 dark:border-gray-800"
              rows={2}
              value={form.alergias}
              onChange={(e) => set("alergias", e.target.value)}
            />
          </div>

          {/* Error general */}
          {errGeneral && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {errGeneral}
            </div>
          )}

          {/* Botón */}
          <Button size="sm" disabled={loading || hasErrors}>
            {loading ? "Guardando..." : "Guardar paciente"}
          </Button>

          {hasErrors && (
            <div className="text-xs text-gray-500">
              Revise los campos en rojo antes de guardar.
            </div>
          )}
        </form>
      </ComponentCard>
    </>
  );
}
