import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";

import Label from "../form/Label";
import { Pencil, MapPin, BadgeCheck, User } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function authMe() {
  const token = getToken();
  const resp = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function roleLabelFromMe(me: any) {
  const roles: string[] = me?.user?.roles || me?.roles || [];
  const r = Array.isArray(roles) ? roles : [];
  if (r.includes("admin")) return "Administrador";
  if (r.includes("therapist") || r.includes("fisioterapeuta"))
    return "Fisioterapeuta";
  if (r.includes("reception") || r.includes("recepcion")) return "Recepción";
  return r[0] ? String(r[0]) : "Usuario";
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await authMe();
        setMe(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const user = useMemo(() => {
    const u = me?.user || me || {};
    const name =
      u?.name ||
      [u?.nombres, u?.apellidos].filter(Boolean).join(" ") ||
      u?.email ||
      "Usuario";

    const avatarUrl =
      u?.avatarUrl || u?.avatar_url || u?.avatar || "/images/user/owner.jpg";

    const locationLabel =
      u?.locationLabel ||
      u?.location ||
      [u?.city, u?.country].filter(Boolean).join(", ") ||
      "—";

    return {
      name,
      roleLabel: roleLabelFromMe(me),
      locationLabel,
      avatarUrl,
    };
  }, [me]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Aquí luego conectas tu PATCH/PUT del perfil
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={user.avatarUrl}
                alt="user"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {loading ? "Cargando..." : user.name}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <BadgeCheck size={16} />
                  {user.roleLabel}
                </p>

                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />

                <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin size={16} />
                  {user.locationLabel}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <Pencil size={18} />
            Editar
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar perfil
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualice su información para mantener el perfil al día.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[360px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label className="flex items-center gap-2">
                    <User size={16} /> Nombre
                  </Label>
                  <input
                    type="text"
                    value={user.name}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <BadgeCheck size={16} /> Rol
                  </Label>
                  <input
                    type="text"
                    value={user.roleLabel}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin size={16} /> Ubicación
                  </Label>
                  <input
                    type="text"
                    value={user.locationLabel}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border px-4 py-3 text-sm transition border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-60"
              >
                Cerrar
              </button>

              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-60"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
