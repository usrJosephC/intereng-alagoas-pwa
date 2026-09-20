import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import localFont from "next/font/local";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SiteHeader } from "@/components/nav/site-header";
import { SiteFooter } from "@/components/nav/site-footer";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Fonte de destaque oficial do evento (estilo espartano/gladiador), usada com
// moderação em títulos hero e no wordmark — ver src/fonts/OFL.txt para a licença.
const caesarDressing = localFont({
  src: "../fonts/CaesarDressing-Regular.ttf",
  variable: "--font-caesar",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterEng Alagoas",
    template: "%s | InterEng Alagoas",
  },
  description:
    "Sorteio de grupos, tabela de jogos e comunidade do InterEng Alagoas — o campeonato inter-atléticas de engenharia do estado de Alagoas.",
  applicationName: "InterEng Alagoas",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InterEng Alagoas",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#040b2b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${oswald.variable} ${caesarDressing.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <SiteFooter />
        <MobileTabBar />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
