import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="py-12 text-center">
        {Icon && <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmptyState;