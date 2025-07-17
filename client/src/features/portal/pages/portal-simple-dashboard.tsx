import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Heart, User, Calendar, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import { usePatientProfile } from "../hooks/usePortalApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";
import { Link } from "wouter";

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

export default function PortalSimpleDashboard() {
  const { data: profile, isLoading, error } = usePatientProfile();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load your information" />;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.firstName}!
            </h1>
            <p className="text-blue-100 mt-2">
              Your healthcare journey continues here
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Healthcare Stage:</span>
              <Badge className={StageColorMap[profile?.stage] || 'bg-gray-100 text-gray-800'}>
                {profile?.stage}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Health Coach:</span>
              <span className="text-sm">
                {profile?.healthCoach 
                  ? `${profile.healthCoach.firstName} ${profile.healthCoach.lastName}`
                  : 'Not assigned yet'
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since:</span>
              <span className="text-sm">
                {new Date(profile?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/portal/appointments">
              <Button variant="outline" className="w-full h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">View Appointments</div>
                    <div className="text-sm text-gray-500">Schedule and manage</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/portal/messages">
              <Button variant="outline" className="w-full h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Messages</div>
                    <div className="text-sm text-gray-500">Contact your health coach</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/portal/records">
              <Button variant="outline" className="w-full h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Health Records</div>
                    <div className="text-sm text-gray-500">View your medical data</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/portal/profile">
              <Button variant="outline" className="w-full h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">My Profile</div>
                    <div className="text-sm text-gray-500">Update your information</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Continue Your Care Plan</p>
                <p className="text-sm text-gray-600">
                  Follow up with your health coach on your current stage: {profile?.stage}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Stay Connected</p>
                <p className="text-sm text-gray-600">
                  Check messages regularly for updates from your healthcare team
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Track Your Progress</p>
                <p className="text-sm text-gray-600">
                  Monitor your health journey through our comprehensive care stages
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}