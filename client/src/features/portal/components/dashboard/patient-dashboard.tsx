import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, MessageCircle, FileText, Clock, Activity } from 'lucide-react';
import { usePatientProfile, usePatientAppointments, usePatientMessages, usePatientActivities } from "../../hooks/usePortalApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";

const StageColorMap: Record<string, string> = {
  'Intake': 'bg-blue-100 text-blue-800',
  'Initial Labs': 'bg-yellow-100 text-yellow-800',
  'Initial Lab Review': 'bg-purple-100 text-purple-800',
  'Initial Provider Exam': 'bg-green-100 text-green-800',
  'Initial Medication Order': 'bg-indigo-100 text-indigo-800',
  '1st Follow-up Labs': 'bg-orange-100 text-orange-800',
  'First Follow-Up Lab Review': 'bg-pink-100 text-pink-800',
  'First Follow-Up Provider Exam': 'bg-teal-100 text-teal-800',
  'First Medication Refill': 'bg-cyan-100 text-cyan-800',
  'Second Follow-Up Labs': 'bg-red-100 text-red-800',
  'Second Follow-Up Lab Review': 'bg-gray-100 text-gray-800',
  'Second Follow-up Provider Exam': 'bg-lime-100 text-lime-800',
  'Second Medication Refill': 'bg-emerald-100 text-emerald-800',
  'Third Medication Refill': 'bg-violet-100 text-violet-800',
  'Restart Annual Process': 'bg-rose-100 text-rose-800',
};

export default function PatientDashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError } = usePatientProfile();
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments();
  const { data: messages, isLoading: messagesLoading } = usePatientMessages();
  const { data: activities, isLoading: activitiesLoading } = usePatientActivities();

  if (profileLoading) return <LoadingSpinner />;
  if (profileError) return <ErrorMessage message="Failed to load profile information" />;

  const nextAppointment = appointments?.find(
    (apt: any) => new Date(apt.scheduledAt) > new Date()
  );

  const unreadMessages = messages?.filter((msg: any) => !msg.isRead && !msg.sentByPatient).length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.firstName}!
        </h1>
        <p className="text-blue-100">
          Here's your latest health information and updates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{profile?.stage}</div>
            <Badge className={StageColorMap[profile?.stage] || 'bg-gray-100 text-gray-800'}>
              Healthcare Journey
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div>
                <div className="text-2xl font-bold">
                  {new Date(nextAppointment.scheduledAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(nextAppointment.scheduledAt).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No upcoming appointments
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Coach</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {profile?.healthCoach 
                ? `${profile.healthCoach.firstName} ${profile.healthCoach.lastName}`
                : 'Not assigned'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Your care coordinator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activitiesLoading ? (
              <LoadingSpinner />
            ) : activities && activities.length > 0 ? (
              activities.slice(0, 5).map((activity: any, index: number) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activityDescription}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Complete Health Assessment</p>
                <p className="text-xs text-muted-foreground">
                  Review and update your health information
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Schedule Follow-up</p>
                <p className="text-xs text-muted-foreground">
                  Book your next appointment with your health coach
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Review Lab Results</p>
                <p className="text-xs text-muted-foreground">
                  Check your latest lab results and recommendations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}