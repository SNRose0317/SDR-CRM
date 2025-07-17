import { Link, useLocation } from 'wouter';
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  FileText, 
  User, 
  LogOut,
  Bell,
  Heart
} from 'lucide-react';
import { usePortalAuth } from "../../hooks/usePortalAuth";
import { usePatientNotifications } from "../../hooks/usePortalApi";
import { Badge } from "@/shared/components/ui/badge";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = usePortalAuth();
  const { data: notifications } = usePatientNotifications();

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: Home },
    { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
    { name: 'Messages', href: '/portal/messages', icon: MessageCircle },
    { name: 'Health Records', href: '/portal/records', icon: FileText },
    { name: 'Profile', href: '/portal/profile', icon: User },
  ];

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    window.location.href = '/portal/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Patient Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  HealthCRM
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-1',
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {item.name === 'Messages' && unreadNotifications > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {navigation.find(item => item.href === location)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome to your patient portal
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}