import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Error",
  message,
  variant = 'destructive',
  onRetry,
  className
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>{title}:</strong> {message}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default ErrorMessage;