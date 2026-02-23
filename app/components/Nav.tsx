"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

type Session = { tipo: "super" | "escuela"; cct?: string } | null;

const allLinks = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/escuelas",
    label: "Escuelas",
    icon: (
      <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M2 21h20" />
        <path d="M12 17v4" />
        <path d="M5 21V9l7-4 7 4v12" />
        <path d="M9 21v-4h6v4" />
      </svg>
    ),
  },
  {
    href: "/por-nivel",
    label: "Por nivel",
    icon: (
      <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Nav({ session }: { session?: Session }) {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const links = session?.tipo === "escuela" ? allLinks.filter((l) => l.href !== "/escuelas") : allLinks;

  return (
    <nav className="app-nav">
      <div className="app-nav-glow" aria-hidden />
      <div className="app-nav-inner">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-tab ${isActive ? "nav-tab--active" : "nav-tab--inactive"}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-tab__icon">{icon}</span>
              <span className="nav-tab__label">{label}</span>
            </Link>
          );
        })}
        <div className="app-nav__logout nav-tab nav-tab--inactive flex min-h-[44px] flex-col items-center justify-center">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
