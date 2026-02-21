import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth-data";
import { createSessionCookie, getSessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

// Mismo orden que lib/auth-data.ts verifyPassword
function normalizePassword(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function getPasswordFromRequest(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return request.formData().then((form) => {
      const p = form.get("password");
      return typeof p === "string" ? normalizePassword(p) : "";
    });
  }
  return request.json().then((body: { password?: string }) =>
    typeof body?.password === "string" ? normalizePassword(body.password) : ""
  );
}

export async function POST(request: Request) {
  try {
    const password = await getPasswordFromRequest(request);
    if (!password) {
      return NextResponse.redirect(new URL("/login?error=empty", request.url), 302);
    }
    const session = verifyPassword(password);
    if (!session) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url), 302);
    }
    const value = await createSessionCookie(session);
    const url =
      session.tipo === "escuela" && session.cct
        ? new URL(`/escuela/${session.cct}`, request.url)
        : new URL("/", request.url);
    const res = NextResponse.redirect(url, 303);
    res.cookies.set(getSessionCookieName(), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("Login error:", e);
    return NextResponse.redirect(
      new URL(`/login?error=server&msg=${encodeURIComponent(process.env.NODE_ENV === "development" ? message : "error")}`, request.url),
      302
    );
  }
}
