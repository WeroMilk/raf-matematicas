"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn-ios touch-target mb-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white"
      title="Cerrar sesión"
    >
      Salir
    </button>
  );
}
