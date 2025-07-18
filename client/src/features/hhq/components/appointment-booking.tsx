import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Calendar } from "@/shared/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, User } from "lucide-react";
import { format } from "date-fns";
import type { User as UserType } from "@shared/schema";

interface AppointmentBookingProps {
  hhqId: number;
  leadId: number;
  onComplete: () => void;
}

export function AppointmentBooking({ hhqId, leadId, onComplete }: AppointmentBookingProps) {
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();

  // Fetch health coaches
  const { data: healthCoaches = [], isLoading: loadingCoaches } = useQuery({
    queryKey: ["/api/hhq/health-coaches"],
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !selectedCoach) {
        throw new Error("Please select a coach, date, and time");
      }

      // Create date time from selected date and time
      const [hours, minutes] = selectedTime.split(":");
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // First create the appointment
      const appointmentResponse = await apiRequest("POST", "/api/appointments", {
        title: "Initial Health Consultation",
        description: "Health History Questionnaire Follow-up",
        scheduledAt: appointmentDate.toISOString(),
        duration: 60, // 1 hour appointment in minutes
        userId: parseInt(selectedCoach),
        leadId: leadId,
        contactId: null, // Will be updated when lead converts to contact
        meetingLink: "https://zoom.us/j/example", // Placeholder meeting link
      });
      
      const appointment = await appointmentResponse.json();

      // Then link it to the HHQ
      const hhqResponse = await apiRequest("POST", `/api/hhq/${hhqId}/book-appointment`, {
        appointmentId: appointment.id,
      });

      return hhqResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/hhq/lead/${leadId}`] });
      toast({
        title: "Appointment Booked!",
        description: "Your consultation has been scheduled successfully.",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    createAppointmentMutation.mutate();
  };

  // Generate time slots (9 AM to 5 PM)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Your Consultation
        </CardTitle>
        <CardDescription>
          Select a health coach and schedule your initial consultation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coach Selection */}
        <div className="space-y-3">
          <Label>Select a Health Coach</Label>
          {loadingCoaches ? (
            <p className="text-sm text-gray-500">Loading coaches...</p>
          ) : (
            <RadioGroup value={selectedCoach} onValueChange={setSelectedCoach}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(healthCoaches as UserType[]).map((coach) => (
                  <div key={coach.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={coach.id.toString()} id={`coach-${coach.id}`} />
                    <Label 
                      htmlFor={`coach-${coach.id}`} 
                      className="flex items-center gap-2 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{coach.firstName} {coach.lastName}</p>
                        <p className="text-xs text-gray-500">{coach.email}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            className="rounded-md border"
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <Label>Select Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        {selectedCoach && selectedDate && selectedTime && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Appointment Summary</h4>
            <p className="text-sm text-gray-600">
              <strong>Coach:</strong> {healthCoaches.find((c: UserType) => c.id.toString() === selectedCoach)?.firstName} {healthCoaches.find((c: UserType) => c.id.toString() === selectedCoach)?.lastName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Date:</strong> {format(selectedDate, "MMMM d, yyyy")}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Time:</strong> {selectedTime}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleBooking}
          disabled={!selectedCoach || !selectedDate || !selectedTime || createAppointmentMutation.isPending}
        >
          {createAppointmentMutation.isPending ? "Booking..." : "Confirm Appointment"}
        </Button>
      </CardContent>
    </Card>
  );
}