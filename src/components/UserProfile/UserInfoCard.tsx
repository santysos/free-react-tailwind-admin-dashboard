import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";

import Label from "../form/Label";
import { Pencil, Mail, Phone, IdCard, User } from "lucide-react";

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

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    (async () => setMe(await authMe()))();
  }, []);

  const u = useMemo(() => me?.user || me || {}, [me]);

  const fullName =
    u?.name || [u?.nombres, u?.apellidos].filter(Boolean).join(" ") || "—";

  const firstName = u?.nombres || u?.first_name || u?.firstName || "";
  const lastName = u?.apellidos || u?.last_name || u?.lastName || "";

  const email = u?.email || "—";
  const phone = u?.phone || u?.telefono || u?.celular || "—";
  const identificacion = u?.identificacion || u?.cedula || "—";

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Aquí luego conectas tu PATCH/PUT
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Información personal
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Nombre
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {fullName}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Cédula / ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {identificacion}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {phone}
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
              Editar información personal
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Puede ajustar sus datos. (Conecte aquí su endpoint de guardado).
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[360px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    <User size={16} /> Nombres
                  </Label>
                  <input
                    type="text"
                    value={firstName || ""}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <User size={16} /> Apellidos
                  </Label>
                  <input
                    type="text"
                    value={lastName || ""}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="flex items-center gap-2">
                    <Mail size={16} /> Email
                  </Label>
                  <input
                    type="text"
                    value={email}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Phone size={16} /> Teléfono
                  </Label>
                  <input
                    type="text"
                    value={phone}
                    readOnly
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <IdCard size={16} /> Cédula / ID
                  </Label>
                  <input
                    type="text"
                    value={identificacion}
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
    className="rounded-lg border px-4 py-2.5 text-sm font-medium transition
               border-gray-200 bg-white text-gray-700 hover:bg-gray-50
               dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
  >
    Cerrar
  </button>

  <button
    type="submit"
    className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white
               shadow-theme-xs hover:bg-brand-600 disabled:opacity-60"
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
