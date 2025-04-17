import {SiteHeader} from "./SiteHeader";
import {SiteFooter} from "./SiteFooter";
import {BottomNav} from "@/components/layout/BottomNav";

export function Shell({children}: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader/>
            <main className="flex-1 container py-12 px-4 mx-auto">{children}</main>
            <SiteFooter/>
            <BottomNav/>

        </div>
    );
}
