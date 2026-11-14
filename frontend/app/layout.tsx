import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: { default: "HalfSolution", template: "%s · HalfSolution" },
  description: "Découvrez ce que l'IA peut déjà faire pour votre idée de SaaS, et ce qu'il reste à construire.",
};

export const viewport: Viewport = { themeColor: "#F5F3ED", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
