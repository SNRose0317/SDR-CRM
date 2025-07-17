import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/shared/components/data-display/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { UserPlus, Users, CheckSquare, Calendar, Activity } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
  });

  const { data: leadStats } = useQuery({
    queryKey: ["/api/leads/stats"],
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface rounded-xl p-6 border border-border animate-pulse">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={UserPlus}
          color="primary"
        />
        <StatsCard
          title="Active Contacts"
          value={stats?.totalContacts || 0}
          icon={Users}
          color="success"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          icon={CheckSquare}
          color="warning"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={Calendar}
          color="destructive"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(activityLogs) && activityLogs.slice(0, 5).map((log: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-muted-foreground">{log.details}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {(!Array.isArray(activityLogs) || activityLogs.length === 0) && (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(leadStats) && leadStats.map((stat: any) => (
                <div key={stat.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.status}</span>
                    <Badge variant="secondary">{stat.count} leads</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((stat.count / (stats?.totalLeads || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!Array.isArray(leadStats) || leadStats.length === 0) && (
                <p className="text-muted-foreground">No lead data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
