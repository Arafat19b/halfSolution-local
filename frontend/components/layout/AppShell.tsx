"use client";

import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePrefs } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const { prefs } = usePrefs();

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", prefs.reduceMotion);
  }, [prefs.reduceMotion]);

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <Sidebar />
      <div className="md:pl-[72px] lg:pl-64">
        <Header />
        <main id="contenu" className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </>
  );
}
