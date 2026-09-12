import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { StoreHydration } from "@/components/shell/store-hydration";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-svh w-full overflow-hidden">
      <StoreHydration />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/background/image.png)" }}
      />
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
