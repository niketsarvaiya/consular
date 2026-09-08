import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Bold contemporary grotesk for headlines (Modern Wanderlust)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://visasetgo.com"),
  title: { default: "VisaSetGo – Visa Processing for Indian Passport Holders", template: "%s | VisaSetGo" },
  description: "Professional visa application assistance for Indian passport holders. Tourist and business visas, guided step-by-step.",
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
  openGraph: {
    title: "VisaSetGo – Visas made simple",
    description: "Professional visa application assistance for Indian passport holders.",
    url: "/",
    siteName: "VisaSetGo",
    images: [{ url: "/logo-full.png", width: 1200, height: 600, alt: "VisaSetGo" }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-ivory font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
