import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/src/providers/AuthProvider";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  // Not --font-mono: Tailwind v4 defines that name in its own default theme on
  // :root at equal specificity, and wins on source order — which silently left
  // every font-display element rendering in the system mono instead.
  variable: "--font-jetbrains",
});

const grotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "DevPilot",
  description:
    "Track skills, manage projects, generate learning roadmaps, and measure internship readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} ${grotesk.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
