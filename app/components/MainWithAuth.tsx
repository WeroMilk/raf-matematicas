"use client";

import { usePathname } from "next/navigation";

export default function MainWithAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  return (
    <main className={isLogin ? "app-main app-main--no-nav" : "app-main"}>
      <div className={isLogin ? "" : "page-container"}>
        {children}
      </div>
    </main>
  );
}
