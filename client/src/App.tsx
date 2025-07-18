import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import MainLayout from "@/shared/components/layout/main-layout";
import Dashboard from "@/features/dashboard/pages/dashboard";
import Leads from "@/features/leads/pages/leads";
import Contacts from "@/features/contacts/pages/contacts";
import Tasks from "@/features/tasks/pages/tasks";
import Appointments from "@/features/appointments/pages/appointments";
import Users from "@/features/users/pages/users";
import Settings from "@/features/settings/pages/settings";
import Workflows from "@/pages/workflows";
import Rules from "@/features/rules/pages/rules";

import NotFound from "@/shared/pages/not-found";

// Portal imports
import PortalLogin from "@/features/portal/components/auth/portal-login";
import PortalLayout from "@/features/portal/components/layout/portal-layout";
import PortalDashboard from "@/features/portal/pages/portal-dashboard";
import PortalAppointments from "@/features/portal/pages/portal-appointments";
import PortalMessages from "@/features/portal/pages/portal-messages";
import PortalProfile from "@/features/portal/pages/portal-profile";
import PortalHHQ from "@/features/portal/pages/portal-hhq";
import { usePortalAuth } from "@/features/portal/hooks/usePortalAuth";

function PortalRouter() {
  const { isAuthenticated, isLoading } = usePortalAuth();
  const [location, navigate] = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    navigate('/portal/login');
    return null;
  }

  return (
    <PortalLayout>
      <Switch>
        <Route path="/portal/dashboard" component={PortalDashboard} />
        <Route path="/portal/hhq" component={PortalHHQ} />
        <Route path="/portal/appointments" component={PortalAppointments} />
        <Route path="/portal/messages" component={PortalMessages} />
        <Route path="/portal/profile" component={PortalProfile} />
        <Route path="/portal/records" component={() => <div>Records coming soon</div>} />
        <Route path="/portal/" component={PortalDashboard} />
        <Route path="/portal" component={PortalDashboard} />
      </Switch>
    </PortalLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Portal login route - always show login if not authenticated */}
      <Route path="/portal/login" component={PortalLogin} />
      
      {/* Portal authenticated routes */}
      <Route path="/portal/dashboard" component={PortalRouter} />
      <Route path="/portal/hhq" component={PortalRouter} />
      <Route path="/portal/appointments" component={PortalRouter} />
      <Route path="/portal/messages" component={PortalRouter} />
      <Route path="/portal/profile" component={PortalRouter} />
      <Route path="/portal/records" component={PortalRouter} />
      <Route path="/portal/" component={PortalRouter} />
      <Route path="/portal" component={PortalRouter} />
      
      {/* Main app routes */}
      <Route path="*" component={MainAppRouter} />
    </Switch>
  );
}

function MainAppRouter() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/leads" component={Leads} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/users" component={Users} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/rules" component={Rules} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
