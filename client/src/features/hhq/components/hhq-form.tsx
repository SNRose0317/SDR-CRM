import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Slider } from "@/shared/components/ui/slider";
import { CheckCircle, Circle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SignatureStep } from "./signature-step";
import { PaymentStep } from "./payment-step";
import { AppointmentBooking } from "./appointment-booking";
import type { HealthQuestionnaire, Lead } from "@shared/schema";

const formSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  libidoLevel: z.number().min(1).max(10),
  overallHealth: z.number().min(1).max(10),
});

type FormData = z.infer<typeof formSchema>;

interface HHQFormProps {
  lead?: Lead;
  leadId?: number;
  onComplete?: () => void;
  isPortalFlow?: boolean;
}

export function HHQForm({ lead, leadId, onComplete, isPortalFlow = false }: HHQFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hhqData, setHhqData] = useState<HealthQuestionnaire | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const actualLeadId = leadId || lead?.id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      energyLevel: 5,
      libidoLevel: 5,
      overallHealth: 5,
    },
  });

  // Check if HHQ already exists for this lead
  const { data: existingHhq } = useQuery({
    queryKey: [`/api/hhq/lead/${actualLeadId}`],
    enabled: !!actualLeadId,
  });

  // Create HHQ mutation
  const createHhqMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isPortalFlow) {
        const token = localStorage.getItem('portalToken');
        if (!token) throw new Error('No authentication token');
        
        const response = await fetch('/api/hhq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            leadId: actualLeadId,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create HHQ');
        }
        
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/hhq", {
          ...data,
          leadId: actualLeadId,
        });
        return response.json();
      }
    },
    onSuccess: (data) => {
      setHhqData(data);
      setCurrentStep(2);
      toast({
        title: "Questionnaire Submitted",
        description: "Your health questionnaire has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createHhqMutation.mutate(data);
  };

  const steps = [
    { number: 1, title: "Health Questionnaire", completed: currentStep > 1 },
    { number: 2, title: "Signature", completed: currentStep > 2 || hhqData?.isSigned },
    { number: 3, title: "Payment", completed: currentStep > 3 || hhqData?.isPaid },
    { number: 4, title: "Book Appointment", completed: hhqData?.appointmentBooked },
  ];

  // Set step and data when existing HHQ loads
  useEffect(() => {
    if (existingHhq) {
      const hhq = existingHhq as HealthQuestionnaire;
      setHhqData(hhq);
      
      // Set the appropriate step based on completion status
      if (!hhq.isSigned) {
        setCurrentStep(2);
      } else if (!hhq.isPaid) {
        setCurrentStep(3);
      } else if (!hhq.appointmentBooked) {
        setCurrentStep(4);
      }
    }
  }, [existingHhq]);

  // If HHQ exists and is complete, show completion message
  if (existingHhq) {
    const hhq = existingHhq as HealthQuestionnaire;
    if (hhq.appointmentBooked) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Health History Questionnaire Complete</CardTitle>
            <CardDescription>
              Your questionnaire has been completed and appointment booked.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>
              <span className="text-sm mt-1">{step.title}</span>
            </div>
            {step.number < steps.length && (
              <div
                className={`h-1 w-20 mx-2 ${
                  step.completed ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && !existingHhq && (
        <Card>
          <CardHeader>
            <CardTitle>Health History Questionnaire</CardTitle>
            <CardDescription>
              Please rate your current health status on a scale of 1-10
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How is your energy level?</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 (Very Low)</span>
                            <span className="font-bold text-lg">{field.value}</span>
                            <span>10 (Excellent)</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Rate your overall energy levels throughout the day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="libidoLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How is your libido?</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 (Very Low)</span>
                            <span className="font-bold text-lg">{field.value}</span>
                            <span>10 (Excellent)</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Rate your overall libido and sexual health
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overallHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How is your overall health?</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 (Poor)</span>
                            <span className="font-bold text-lg">{field.value}</span>
                            <span>10 (Excellent)</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Rate your general health and wellbeing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createHhqMutation.isPending}>
                  {createHhqMutation.isPending ? "Submitting..." : "Submit Questionnaire"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && hhqData && (
        <SignatureStep 
          hhqId={hhqData.id} 
          isSigned={hhqData.isSigned}
          onComplete={() => {
            // Invalidate and refetch the HHQ data to get updated signature status
            queryClient.invalidateQueries({ queryKey: [`/api/hhq/lead/${actualLeadId}`] });
            setCurrentStep(3);
            setHhqData({ ...hhqData, isSigned: true });
          }} 
        />
      )}

      {currentStep === 3 && hhqData && !hhqData.isPaid && (
        <PaymentStep 
          hhqId={hhqData.id} 
          onComplete={() => {
            setCurrentStep(4);
            setHhqData({ ...hhqData, isPaid: true });
          }} 
        />
      )}

      {currentStep === 4 && hhqData && !hhqData.appointmentBooked && (
        <AppointmentBooking 
          hhqId={hhqData.id} 
          leadId={actualLeadId}
          onComplete={() => {
            toast({
              title: "Complete!",
              description: "Your health questionnaire process is complete.",
            });
            onComplete?.();
          }} 
        />
      )}
    </div>
  );
}