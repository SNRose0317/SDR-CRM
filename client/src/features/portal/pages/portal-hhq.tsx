import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";
import { HHQForm } from "@/features/hhq/components/hhq-form";
import { usePatientProfile } from "../hooks/usePortalApi";

export default function PortalHHQPage() {
  const [, setLocation] = useLocation();
  const { data: profile } = usePatientProfile();
  
  // Check HHQ status
  const { data: hhqStatus, isLoading, refetch } = useQuery({
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
    enabled: !!profile?.id,
  });

  const handleHHQComplete = () => {
    refetch();
    setLocation('/portal/dashboard');
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (!profile) {
    return <ErrorMessage message="Please log in to access this page" />;
  }

  // If already completed, show completion message
  if (hhqStatus?.completed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/portal/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-2 border-green-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Health History Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">
                Great job! You've successfully completed your Health History Questionnaire.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Our medical team will review your responses</li>
                  <li>• You'll be assigned a dedicated health coach</li>
                  <li>• Your health coach will contact you to schedule your initial consultation</li>
                  <li>• We'll create a personalized treatment plan based on your needs</li>
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <Link href="/portal/dashboard">
                  <Button>
                    Return to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show HHQ form
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/portal/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health History Questionnaire</CardTitle>
          <p className="text-sm text-gray-600">
            Please complete this questionnaire to help us provide you with the best possible care.
          </p>
        </CardHeader>
        <CardContent>
          <HHQForm 
            leadId={profile.id}
            onComplete={handleHHQComplete}
            isPortalFlow={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}