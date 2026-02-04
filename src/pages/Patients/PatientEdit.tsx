import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { getPatient, updatePatient } from "../../services/patients";

type PatientForm = {
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

function normalizeDateOnly(v: any) {
  if (!v) return "";
  return String(v).slice(0, 10);
}

function toNullIfEmpty(v: string) {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
}

export default function PatientEdit() {
  const nav = useNavigate();
  const { id } = useParams();

  const patientId = id ? Number(id) : NaN;

  const [form, setForm] = useState<PatientForm>({
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

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [err, setErr] = useState("");

  const set = (k: keyof PatientForm, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    async function load() {
      if (!Number.isFinite(patientId)) {
        setErr("ID de paciente inválido.");
        setLoadingData(false);
        return;
      }

      try {
        setErr("");

        // ✅ Laravel devuelve { ok, patient }
        const res = await getPatient(patientId);
        const p = res?.patient;

        if (!p) {
          throw new Error("Respuesta inválida: no viene patient.");
        }

        setForm({
          identificacion: p.identificacion ?? "",
          nombres: p.nombres ?? "",
          apellidos: p.apellidos ?? "",
          fecha_nacimiento: normalizeDateOnly(p.fecha_nacimiento),
          celular: p.celular ?? "",
          sector: p.sector ?? "",
          antecedentes: p.antecedentes ?? "",
          alergias: p.alergias ?? "",
          actividad: p.actividad ?? "",
          canal: p.canal ?? "",
        });
      } catch (e: any) {
        setErr(e?.message || "No se pudo cargar el paciente");
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [patientId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await updatePatient(patientId, {
        identificacion: toNullIfEmpty(form.identificacion),
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        fecha_nacimiento: toNullIfEmpty(form.fecha_nacimiento),
        celular: toNullIfEmpty(form.celular),
        sector: toNullIfEmpty(form.sector),
        antecedentes: toNullIfEmpty(form.antecedentes),
        alergias: toNullIfEmpty(form.alergias),
        actividad: toNullIfEmpty(form.actividad),
        canal: toNullIfEmpty(form.canal),
      });

      nav(`/patients/${patientId}`, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "No se pudo actualizar el paciente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta title="Editar paciente | Fisio" description="Editar paciente" />

      <ComponentCard title="Editar paciente">
        {loadingData ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cargando...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
            {err && <div className="text-sm text-red-600">{err}</div>}

            <div>
              <Label>Cédula</Label>
              <Input
                value={form.identificacion}
                onChange={(e) => set("identificacion", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Nombres *</Label>
                <Input
                  value={form.nombres}
                  onChange={(e) => set("nombres", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Apellidos *</Label>
                <Input
                  value={form.apellidos}
                  onChange={(e) => set("apellidos", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={(e) => set("fecha_nacimiento", e.target.value)}
                />
              </div>
              <div>
                <Label>Celular</Label>
                <Input
                  value={form.celular}
                  onChange={(e) => set("celular", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  placeholder="Ej: Oficinista, Deportista"
                />
              </div>
            </div>

            <div>
              <Label>Canal</Label>
              <Input
                value={form.canal}
                onChange={(e) => set("canal", e.target.value)}
                placeholder="Ej: Referido, Instagram, WhatsApp"
              />
            </div>

            <div>
              <Label>Antecedentes</Label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
                value={form.antecedentes}
                onChange={(e) => set("antecedentes", e.target.value)}
              />
            </div>

            <div>
              <Label>Alergias</Label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
                value={form.alergias}
                onChange={(e) => set("alergias", e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => nav(-1)}
                disabled={loading}
                className="rounded-lg border px-4 py-3 text-sm transition border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-60"
              >
                Cancelar
              </button>

              <Button size="sm" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </ComponentCard>
    </>
  );
}
