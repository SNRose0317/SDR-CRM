import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CheckSquare,
  Calendar,
  Settings,
  User,
  X,
  Heart
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: UserPlus },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Users", href: "/users", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HealthCRM</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start space-x-3",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">Admin User</div>
              <div className="text-sm text-muted-foreground">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
