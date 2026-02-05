// src/components/auth/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authMe } from "../../services/auth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setOk(false);
          return;
        }
        await authMe(); // si no está logueado → 401
        setOk(true);
      } catch {
        setOk(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    // Loader simple (puedes poner tu skeleton TailAdmin)
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Verificando sesión...
      </div>
    );
  }

  if (!ok) return <Navigate to="/signin" replace />;

  return children;
}
