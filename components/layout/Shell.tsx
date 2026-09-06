import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { getSeasonProgress } from "@/features/season/getSeasonProgress";

export async function Shell({ children }: { children: React.ReactNode }) {
  // Résolu ici plutôt que dans l'en-tête : un appel serveur mutualisé et mis
  // en cache, au lieu d'un fetch navigateur répété sur chaque page.
  const progress = await getSeasonProgress();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader progress={progress} />
      <main className="mx-auto w-full max-w-[1800px] flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
