import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { User, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import { usePatientProfile } from "../hooks/usePortalApi";
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

export default function PortalProfile() {
  const { data: profile, isLoading, error } = usePatientProfile();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load profile information" />;

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <p className="text-gray-900">{profile?.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Since
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-gray-900">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Health Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stage
              </label>
              <Badge className={StageColorMap[profile?.stage] || 'bg-gray-100 text-gray-800'}>
                {profile?.stage}
              </Badge>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Coach
              </label>
              <p className="text-gray-900">
                {profile?.healthCoach 
                  ? `${profile.healthCoach.firstName} ${profile.healthCoach.lastName}`
                  : 'Not assigned'
                }
              </p>
              {profile?.healthCoach && (
                <p className="text-sm text-gray-500">{profile.healthCoach.email}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-gray-900 text-sm">
                {profile?.notes || 'No notes available'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Healthcare Journey Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Your current stage: <span className="font-semibold">{profile?.stage}</span>
            </div>
            
            <div className="space-y-3">
              {[
                'Intake',
                'Initial Labs',
                'Initial Lab Review',
                'Initial Provider Exam',
                'Initial Medication Order',
                '1st Follow-up Labs',
                'First Follow-Up Lab Review',
                'First Follow-Up Provider Exam',
                'First Medication Refill',
                'Second Follow-Up Labs',
                'Second Follow-Up Lab Review',
                'Second Follow-up Provider Exam',
                'Second Medication Refill',
                'Third Medication Refill',
                'Restart Annual Process'
              ].map((stage, index) => {
                const isCurrent = stage === profile?.stage;
                const isCompleted = [
                  'Intake',
                  'Initial Labs',
                  'Initial Lab Review',
                  'Initial Provider Exam',
                  'Initial Medication Order',
                  '1st Follow-up Labs',
                  'First Follow-Up Lab Review',
                  'First Follow-Up Provider Exam',
                  'First Medication Refill',
                  'Second Follow-Up Labs',
                  'Second Follow-Up Lab Review',
                  'Second Follow-up Provider Exam',
                  'Second Medication Refill',
                  'Third Medication Refill',
                  'Restart Annual Process'
                ].indexOf(stage) < [
                  'Intake',
                  'Initial Labs',
                  'Initial Lab Review',
                  'Initial Provider Exam',
                  'Initial Medication Order',
                  '1st Follow-up Labs',
                  'First Follow-Up Lab Review',
                  'First Follow-Up Provider Exam',
                  'First Medication Refill',
                  'Second Follow-Up Labs',
                  'Second Follow-Up Lab Review',
                  'Second Follow-up Provider Exam',
                  'Second Medication Refill',
                  'Third Medication Refill',
                  'Restart Annual Process'
                ].indexOf(profile?.stage);
                
                return (
                  <div key={stage} className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full ${
                        isCurrent 
                          ? 'bg-blue-500' 
                          : isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                    <span 
                      className={`text-sm ${
                        isCurrent 
                          ? 'font-semibold text-blue-700' 
                          : isCompleted 
                            ? 'text-green-700' 
                            : 'text-gray-500'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-gray-900">
                {new Date(profile?.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">
                {new Date(profile?.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}