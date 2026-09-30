import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Express Lab — exercícios de Express.js",
  description: "540 exercícios de completar lacunas para dominar Express.js, com histórico e acompanhamento de aprendizado.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
