import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CheckSquare,
  Calendar,
  Settings,
  User,
  X,
  Heart,
  Zap,
  Shield,
  Phone,
  FileText,
  HeartHandshake
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permissions?: string | string[];
  requireAll?: boolean;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, claims } = useAuth();

  // Define navigation with permissions
  const navigation: NavItem[] = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: LayoutDashboard 
    },
    { 
      // Dynamic label based on role
      name: claims.userRole === 'sdr' ? "Leads" : 
            claims.userRole === 'health_coach' ? "Patients" : 
            "Persons", 
      href: "/leads", 
      icon: UserPlus,
      permissions: ["persons.view_own", "persons.view_team", "persons.view_all"]
    },
    { 
      name: "Contacts", 
      href: "/contacts", 
      icon: Users,
      permissions: ["persons.view_own", "persons.view_team", "persons.view_all"]
    },
    { 
      name: "Tasks", 
      href: "/tasks", 
      icon: CheckSquare,
      permissions: ["tasks.view_own", "tasks.view_team", "tasks.view_all"]
    },
    { 
      name: "Appointments", 
      href: "/appointments", 
      icon: Calendar,
      permissions: ["appointments.view_own", "appointments.view_team", "appointments.view_all"]
    },
    {
      name: "Dialer",
      href: "/dialer",
      icon: Phone,
      permissions: "dialer.use"
    },
    {
      name: "Health Records",
      href: "/health-records",
      icon: HeartHandshake,
      permissions: ["health_records.view", "health_records.edit"]
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      permissions: ["reports.view_own", "reports.view_team", "reports.view_all"]
    },
    { 
      name: "Users", 
      href: "/users", 
      icon: User,
      permissions: "users.view"
    },
    { 
      name: "Workflows", 
      href: "/workflows", 
      icon: Zap,
      permissions: ["workflows.view", "workflows.manage"]
    },
    { 
      name: "Rules", 
      href: "/rules", 
      icon: Shield,
      permissions: ["rules.view", "rules.manage"]
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings,
      permissions: ["settings.view", "settings.manage"]
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = location === item.href;
    
    const linkContent = (
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

    // Wrap in PermissionGate if permissions are defined
    if (item.permissions) {
      return (
        <PermissionGate
          key={item.name}
          permissions={item.permissions}
          requireAll={item.requireAll}
        >
          {linkContent}
        </PermissionGate>
      );
    }

    return linkContent;
  };

  // Get display name for the app based on user role
  const getAppName = () => {
    switch (claims.userRole) {
      case 'health_coach':
        return "PatientCare";
      case 'sdr':
        return "SalesCRM";
      case 'admin':
        return "AdminCRM";
      default:
        return "HealthCRM";
    }
  };

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
            <span className="text-xl font-bold">{getAppName()}</span>
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
            {navigation.map(renderNavItem)}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              {user?.email?.[0]?.toUpperCase() || <User className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div>
              <div className="font-medium truncate">
                {user?.email || 'Guest User'}
              </div>
              <div className="text-sm text-muted-foreground">
                {claims.userRoleDisplay || claims.userRole || 'No Role'}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Access */}
        <PermissionGate permissions="roles.manage">
          <div className="p-4 border-t border-border">
            <Link href="/admin/roles">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Manage Roles
              </Button>
            </Link>
          </div>
        </PermissionGate>
      </div>
    </>
  );
}