import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

const LOGIN = "/login";

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSessionFromCookie(cookieHeader);

  // Sin sesión: solo permitir /login
  if (!session) {
    if (request.nextUrl.pathname === LOGIN) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = LOGIN;
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Usuario escuela: no puede ver otras escuelas
  if (session.tipo === "escuela" && session.cct) {
    const path = request.nextUrl.pathname;
    const match = path.match(/^\/escuela\/([^/]+)/);
    if (match && match[1] !== session.cct) {
      return NextResponse.redirect(new URL(`/escuela/${session.cct}`, request.url));
    }
    // Redirigir inicio y "por escuela" a su escuela
    if (path === "/" || path === "/escuelas") {
      return NextResponse.redirect(new URL(`/escuela/${session.cct}`, request.url));
    }
  }

  // Ya logueado y yendo a /login → ir a inicio
  if (request.nextUrl.pathname === LOGIN) {
    if (session.tipo === "escuela" && session.cct) {
      return NextResponse.redirect(new URL(`/escuela/${session.cct}`, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|manifest|api).*)"],
};
