import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial display serif for headlines
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: { default: "VisaSetGo – Visa Processing for Indian Passport Holders", template: "%s | VisaSetGo" },
  description: "Professional visa application assistance for Indian passport holders. Tourist and business visas, guided step-by-step.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-ivory font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
