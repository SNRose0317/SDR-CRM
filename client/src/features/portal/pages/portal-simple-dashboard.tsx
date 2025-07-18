import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Heart, User, ClipboardList, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePatientProfile } from "../hooks/usePortalApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PortalSimpleDashboard() {
  const { data: profile, isLoading, error } = usePatientProfile();

  // Check if user has HHQ and its status
  const { data: hhqStatus } = useQuery({
    queryKey: ['portal', 'hhq', 'status'],
    queryFn: async () => {
      const token = localStorage.getItem('portalToken');
      if (!token) throw new Error('No token');
      
      const response = await fetch('/api/portal/hhq/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch HHQ status');
      return response.json();
    },
    enabled: !!profile?.id && !!localStorage.getItem('portalToken'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load your information" />;

  // Lead dashboard - focus on HHQ completion
  if (profile?.userType === 'lead') {
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
                Welcome, {profile?.firstName}!
              </h1>
              <p className="text-blue-100 mt-2">
                Let's get started with your health journey
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps - Primary Focus */}
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <ClipboardList className="h-6 w-6" />
              Your Next Step
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {hhqStatus?.completed ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {hhqStatus?.completed ? 'Health History Complete!' : 'Complete Your Health History'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {hhqStatus?.completed 
                      ? 'Your health history questionnaire has been completed. Our team will review it and get back to you shortly.'
                      : 'To provide you with the best care, we need to understand your current health situation. This quick questionnaire will help us personalize your treatment plan.'
                    }
                  </p>
                  
                  {hhqStatus?.completed ? (
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        Completed {new Date(hhqStatus.completedAt).toLocaleDateString()}
                      </Badge>
                      {hhqStatus.appointmentScheduled && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Appointment Scheduled
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Link href="/portal/hhq">
                      <Button size="lg" className="w-full sm:w-auto">
                        Start Health History Questionnaire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Account Created</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${hhqStatus?.completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm">Health History Questionnaire</span>
                </div>
                {hhqStatus?.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Health Coach Assignment</span>
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Initial Consultation</span>
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Questions about the Health History?</p>
                  <p className="text-sm text-gray-600">
                    The questionnaire takes about 5-10 minutes and covers your current health status, goals, and medical history.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Technical Support</p>
                  <p className="text-sm text-gray-600">
                    Having trouble with the portal? Contact our support team at support@healthcrm.com
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contact dashboard (existing patient)
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
              <Badge className="bg-blue-100 text-blue-800">
                {profile?.status || 'Active Patient'}
              </Badge>
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
    </div>
  );
}