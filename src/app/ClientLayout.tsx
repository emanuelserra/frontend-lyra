"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Route dove NON vuoi la sidebar
  const noSidebarRoutes = ["/", "/login"];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
