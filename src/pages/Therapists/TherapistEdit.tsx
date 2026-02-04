// src/pages/therapists/TherapistEdit.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

import { getTherapist, updateTherapist } from "../../services/therapists";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function TherapistEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const therapistId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activo, setActivo] = useState(true);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    if (!therapistId) {
      setErr("ID inválido.");
      return;
    }

    (async () => {
      setErr("");
      setLoadingData(true);
      try {
        const data = await getTherapist(therapistId);
        const t = data?.therapist ?? data?.user ?? data?.data ?? data;

        setName(t?.name ?? "");
        setEmail(t?.email ?? "");
        setTelefono(t?.telefono ?? "");
        setActivo(t?.activo ?? true);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || "No se pudo cargar.");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [therapistId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!therapistId) return setErr("ID inválido.");
    if (!name.trim()) return setErr("Ingrese el nombre.");
    if (!email.trim() || !isEmail(email)) return setErr("Ingrese un email válido.");
    if ((password || password2) && password !== password2) return setErr("Las contraseñas no coinciden.");

    try {
      setSaving(true);

      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        telefono: telefono.trim() ? telefono.trim() : null,
        activo,
      };

      if (password.trim()) payload.password = password.trim();

      await updateTherapist(therapistId, payload);

      navigate(-1);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageMeta title="Editar terapista | Fisio" description="Editar terapista" />

      <ComponentCard title="Editar terapista">
        <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>ID:</strong> {therapistId ?? "—"}
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}

          {loadingData ? (
            <div className="text-sm text-gray-500">Cargando…</div>
          ) : (
            <>
              <div>
                <Label>Nombre *</Label>
                <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>Email *</Label>
                <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>Teléfono (opcional)</Label>
                <Input value={telefono} onChange={(e) => setTelefono((e.target as HTMLInputElement).value)} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Usuario activo</span>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cambiar contraseña (opcional)
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <Label>Nueva contraseña</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>

                  <div>
                    <Label>Confirmar contraseña</Label>
                    <Input
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2((e.target as HTMLInputElement).value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                  className="rounded-lg border px-4 py-3 text-sm transition border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-60"
                >
                  Volver
                </button>

                <Button size="sm" disabled={saving}>
                  {saving ? "Guardando..." : "Actualizar"}
                </Button>
              </div>
            </>
          )}
        </form>
      </ComponentCard>
    </>
  );
}
