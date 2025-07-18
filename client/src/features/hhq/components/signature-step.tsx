import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileSignature } from "lucide-react";

interface SignatureStepProps {
  hhqId: number;
  onComplete: () => void;
}

export function SignatureStep({ hhqId, onComplete }: SignatureStepProps) {
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  const signMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/hhq/${hhqId}/sign`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Signed Successfully",
        description: "Your signature has been recorded.",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSign = () => {
    signMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Electronic Signature
        </CardTitle>
        <CardDescription>
          Please review and sign the health questionnaire consent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">Consent Agreement</h4>
          <p className="text-sm text-gray-600">
            By signing below, I acknowledge that:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>The information I provided is accurate to the best of my knowledge</li>
            <li>I consent to the use of this information for health assessment purposes</li>
            <li>I understand that this information will be kept confidential</li>
            <li>I agree to the terms and conditions of the health program</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Click to sign electronically</p>
          <div className="flex items-center justify-center space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="agree" className="text-sm cursor-pointer">
              I agree to sign this document electronically
            </Label>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSign}
          disabled={!agreed || signMutation.isPending}
        >
          {signMutation.isPending ? "Signing..." : "Sign Document"}
        </Button>
      </CardContent>
    </Card>
  );
}