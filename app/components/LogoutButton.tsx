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
      className="btn-ios touch-target mb-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-600 hover:text-white lg:text-sm"
      title="Cerrar sesión"
    >
      <svg
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
        <polyline points="17 7 21 12 17 17" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Salir</span>
    </button>
  );
}
