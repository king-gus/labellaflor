import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

const display = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const text = Montserrat({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Bella Flor Boutique | Caraguatatuba",
  description:
    "Boutique de roupas em Caraguatatuba. Chic, casual e moderna. Conjuntos, vestidos e envios para todo o Brasil.",
  metadataBase: new URL("https://www.labellaflorboutique.com.br"),
  openGraph: {
    title: "La Bella Flor Boutique",
    description: "chic · casual · moderna — Caraguatatuba",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-type="place"
      data-buttons="arrow"
      className={`${display.variable} ${text.variable} h-full antialiased`}
    >
      <head>
        <meta name="page-type" content="place" />
        <meta name="page-kind" content="place" />
        <meta name="site-kind" content="other" />
        <meta name="theme-color" content="#006078" />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
