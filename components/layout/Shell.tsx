import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12 px-4 mx-auto">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
