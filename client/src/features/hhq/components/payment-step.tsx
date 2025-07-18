import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign } from "lucide-react";

interface PaymentStepProps {
  hhqId: number;
  onComplete: () => void;
}

export function PaymentStep({ hhqId, onComplete }: PaymentStepProps) {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const paymentAmount = 299; // Fixed amount for demo

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/hhq/${hhqId}/pay`, {
        amount: paymentAmount,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: `Payment of $${paymentAmount} has been processed.`,
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
    },
  });

  const handlePayment = () => {
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      paymentMutation.mutate();
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
        <CardDescription>
          Complete your payment to proceed with appointment booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-900">${paymentAmount}</p>
          <p className="text-sm text-blue-700">One-time consultation fee</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">What's Included:</h4>
          <ul className="list-check list-inside text-sm text-gray-600 space-y-1">
            <li>✓ Initial health consultation</li>
            <li>✓ Personalized health assessment</li>
            <li>✓ Custom treatment plan</li>
            <li>✓ Follow-up support</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Demo Mode:</strong> This is a simulated payment. In production, 
            this would integrate with a real payment processor like Stripe.
          </p>
        </div>

        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={processing || paymentMutation.isPending}
        >
          {processing ? (
            <>
              <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
              Processing Payment...
            </>
          ) : (
            `Pay $${paymentAmount} Now`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}