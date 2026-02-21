"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LogoSonoraSec from "@/app/components/LogoSonoraSec";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "Campo requerido",
  invalid: "Contraseña incorrecta",
  server: "Error al iniciar sesión. Intenta de nuevo.",
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMsg = searchParams.get("msg");
  const [error, setError] = useState("");

  useEffect(() => {
    if (errorCode && errorCode !== "empty") {
      setError(errorMsg ? decodeURIComponent(errorMsg) : ERROR_MESSAGES[errorCode] ?? "Error");
    }
  }, [errorCode, errorMsg]);

  return (
    <div
      className="flex min-h-dvh w-full max-w-full flex-col items-center justify-start gap-6"
      style={{
        paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
        paddingRight: "max(1.5rem, env(safe-area-inset-right))",
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-[200px] flex justify-center mb-4">
        <LogoSonoraSec maxWidth={200} priority />
      </div>
      <div className="w-full max-w-xs flex flex-col items-center text-center mt-2">
        <h1 className="text-lg font-bold text-foreground">RAF Matemáticas</h1>
        <p className="mt-1 text-sm text-foreground/70">Ingresa la contraseña de tu E.S.T.</p>
        <form
          action="/api/login"
          method="POST"
          className="mt-6 w-full flex flex-col gap-4"
          onSubmit={() => setLoading(true)}
        >
          <label className="sr-only" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            autoFocus
            required
            readOnly={loading}
            className="card-ios w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="link-ios w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
      <p className="mt-auto pt-6 text-xs text-foreground/50">Mtra. Marta Camargo</p>
    </div>
  );
}
