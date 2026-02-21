import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Nav from "./components/Nav";
import PageTransition from "./components/PageTransition";
import MainWithAuth from "./components/MainWithAuth";
import SuppressNoisyLogs from "./components/SuppressNoisyLogs";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "RAF Matemáticas | E.S.T.",
  description: "Resultados del examen diagnóstico RAF Matemáticas para maestros de Secundarias Técnicas, Hermosillo, Sonora.",
  applicationName: "RAF Matemáticas | E.S.T.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#8e8e93",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("raf_session")?.value ?? null);

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" href="/Logtipo_EscudoColor.png" as="image" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <SuppressNoisyLogs />
        <div className="app-shell">
          <MainWithAuth>
            <PageTransition>{children}</PageTransition>
          </MainWithAuth>
          <Nav session={session} />
        </div>
      </body>
    </html>
  );
}
