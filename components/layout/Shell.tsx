import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container max-w-4xl py-12 px-4 mx-auto">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
