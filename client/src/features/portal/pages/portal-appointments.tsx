import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { usePatientAppointments } from "../hooks/usePortalApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";

const StatusColorMap: Record<string, string> = {
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Confirmed': 'bg-green-100 text-green-800',
  'Completed': 'bg-gray-100 text-gray-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'No Show': 'bg-yellow-100 text-yellow-800',
};

export default function PortalAppointments() {
  const { data: appointments, isLoading, error } = usePatientAppointments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load appointments" />;

  const upcomingAppointments = appointments?.filter(
    (apt: any) => new Date(apt.scheduledAt) > new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    (apt: any) => new Date(apt.scheduledAt) <= new Date()
  ) || [];

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No upcoming appointments</p>
              <p className="text-sm">Contact your health coach to schedule an appointment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: any) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                        <Badge className={StatusColorMap[appointment.status] || 'bg-gray-100 text-gray-800'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(appointment.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(appointment.scheduledAt).toLocaleTimeString()}</span>
                          <span className="text-gray-400">•</span>
                          <span>{appointment.duration || 30} minutes</span>
                        </div>
                        {appointment.provider && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {appointment.provider.firstName} {appointment.provider.lastName}
                            </span>
                          </div>
                        )}
                        {appointment.meetingLink && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Join Virtual Meeting
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {appointment.description && (
                        <p className="mt-2 text-sm text-gray-700">{appointment.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Past Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No past appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.slice(0, 10).map((appointment: any) => (
                <div key={appointment.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                        <Badge className={StatusColorMap[appointment.status] || 'bg-gray-100 text-gray-800'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(appointment.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(appointment.scheduledAt).toLocaleTimeString()}</span>
                        </div>
                        {appointment.provider && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {appointment.provider.firstName} {appointment.provider.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {appointment.description && (
                        <p className="mt-2 text-sm text-gray-700">{appointment.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}