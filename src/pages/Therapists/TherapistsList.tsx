import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

import { deleteTherapist, listTherapists } from "../../services/therapists";

type Therapist = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

export default function TherapistsList() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await listTherapists({ q });

      // Laravel paginate: { data: [], ... }
      const items = Array.isArray(data?.data) ? data.data : [];
      setRows(items);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar terapistas");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    const ok = confirm("¿Eliminar este terapista?");
    if (!ok) return;

    try {
      await deleteTherapist(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "No se pudo eliminar");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageMeta title="Terapistas | Fisio" description="Listado de terapistas" />

      <ComponentCard title="Terapistas">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar por nombre o email..."
              value={q}
              onChange={(e) => setQ((e.target as HTMLInputElement).value)}
            />
            <Button size="sm" onClick={load} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          <Link to="/therapists/new">
            <Button size="sm">+ Nuevo terapista</Button>
          </Link>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b dark:border-gray-800">
                <th className="py-3">Nombre</th>
                <th>Email</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b dark:border-gray-800">
                  <td className="py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500">ID #{t.id}</div>
                  </td>

                  <td className="text-gray-700 dark:text-gray-300">{t.email}</td>

                  <td className="text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        to={`/therapists/${t.id}/edit`}
                        className="text-brand-500 hover:underline"
                      >
                        Editar
                      </Link>

                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-red-600 hover:underline"
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    No hay terapistas.
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
