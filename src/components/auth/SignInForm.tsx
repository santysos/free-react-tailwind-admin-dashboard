import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {  EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function SignInForm() {
  const nav = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember: isChecked,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Credenciales incorrectas");
      }

      const token = data?.token || data?.access_token || data?.plainTextToken;

      if (!token) {
        throw new Error(
          "Inicio de sesión exitoso, pero el servidor no devolvió el token."
        );
      }

      localStorage.setItem("token", token);

      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
     

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingrese su correo electrónico y contraseña para continuar.
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}

     

          {/* FORMULARIO */}
          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Correo electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  type="email"
                />
              </div>

              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Mantener sesión iniciada
                  </span>
                </div>

                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>

              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
