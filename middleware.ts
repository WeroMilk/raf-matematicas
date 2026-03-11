import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getZonaFromCct } from "@/lib/zonas";

const LOGIN = "/login";

export async function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get("raf_session")?.value ?? request.headers.get("cookie");
  let session = null;
  try {
    session = await getSession(cookieValue);
  } catch {
    session = null;
  }

  if (!session) {
    if (request.nextUrl.pathname === LOGIN) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = LOGIN;
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (session.tipo === "zona" && session.zona != null) {
    const path = request.nextUrl.pathname;
    const match = path.match(/^\/escuela\/([^/]+)/);
    if (match) {
      const cct = match[1];
      const zonaEscuela = getZonaFromCct(cct);
      if (zonaEscuela !== session.zona) {
        const redirectUrl = new URL("/escuelas", request.url);
        redirectUrl.searchParams.set("zona", String(session.zona));
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Usuario escuela: solo puede ver su escuela. Redirigir a /escuela/CCT si intenta otra ruta.
  if (session.tipo === "escuela" && session.cct) {
    const path = request.nextUrl.pathname;
    const escuelaMatch = path.match(/^\/escuela\/([^/]+)(\/|$)/);
    if (path === "/" || path === "/escuelas" || path === "/por-nivel") {
      const redirectUrl = new URL(`/escuela/${encodeURIComponent(session.cct)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (escuelaMatch) {
      const cctInPath = decodeURIComponent(escuelaMatch[1]);
      if (cctInPath !== session.cct) {
        const redirectUrl = new URL(`/escuela/${encodeURIComponent(session.cct)}`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (!path.startsWith("/escuela/")) {
      const redirectUrl = new URL(`/escuela/${encodeURIComponent(session.cct)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (request.nextUrl.pathname === LOGIN) {
    if (session.tipo === "zona" && session.zona != null) {
      return NextResponse.redirect(new URL(`/?zona=${session.zona}`, request.url));
    }
    if (session.tipo === "escuela" && session.cct) {
      return NextResponse.redirect(new URL(`/escuela/${encodeURIComponent(session.cct)}`, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|manifest|api|Logtipo_EscudoColor|data/).*)"],
};
