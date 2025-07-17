import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import MainLayout from "@/shared/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Contacts from "@/pages/contacts";
import Tasks from "@/pages/tasks";
import Appointments from "@/pages/appointments";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/leads" component={Leads} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/users" component={Users} />
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
