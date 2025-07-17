import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "destructive";
}

const colorClasses = {
  primary: "bg-primary/20 text-primary",
  success: "bg-green-500/20 text-green-500",
  warning: "bg-amber-500/20 text-amber-500",
  destructive: "bg-red-500/20 text-red-500"
};

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="surface border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
