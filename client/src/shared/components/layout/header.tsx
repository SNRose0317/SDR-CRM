import { useLocation } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Menu, Search, Bell, Settings } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/contacts": "Contacts",
  "/tasks": "Tasks",
  "/appointments": "Appointments",
  "/users": "Users",
  "/settings": "Settings"
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const pageName = pageNames[location] || "Dashboard";

  return (
    <header className="surface border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{pageName}</h1>
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
