import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1800px] flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
