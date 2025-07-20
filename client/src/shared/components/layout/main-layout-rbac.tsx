import { useState } from "react";
import Sidebar from "./sidebar";
import SidebarRBAC from "./sidebar-rbac";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check if we should use RBAC sidebar
  // This could come from an environment variable or a feature flag
  const useRBACAuth = process.env.NEXT_PUBLIC_USE_RBAC_AUTH === 'true';
  
  // Select the appropriate sidebar component
  const SidebarComponent = useRBACAuth ? SidebarRBAC : Sidebar;

  return (
    <div className="flex h-screen bg-background">
      <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}