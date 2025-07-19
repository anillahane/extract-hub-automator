import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  jobName: string;
  status: "success" | "failed" | "running";
  timestamp: string;
  duration?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    jobName: "Postgres Customer Sync",
    status: "success",
    timestamp: "2 minutes ago",
    duration: "1.2s",
  },
  {
    id: "2",
    jobName: "Redshift Sales Report",
    status: "failed",
    timestamp: "15 minutes ago",
    duration: "Failed after 30s",
  },
  {
    id: "3",
    jobName: "Oracle Inventory Update",
    status: "success",
    timestamp: "1 hour ago",
    duration: "45s",
  },
  {
    id: "4",
    jobName: "Python Data Cleanup",
    status: "running",
    timestamp: "2 hours ago",
    duration: "Running for 45s",
  },
  {
    id: "5",
    jobName: "PostgreSQL User Export",
    status: "success",
    timestamp: "3 hours ago",
    duration: "2.1s",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-destructive" />;
    case "running":
      return <Clock className="w-4 h-4 text-warning animate-pulse" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          Failed
        </Badge>
      );
    case "running":
      return (
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          Running
        </Badge>
      );
    default:
      return null;
  }
};

export function RecentActivity() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <div>
                  <div className="font-medium text-sm">{activity.jobName}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-muted-foreground">
                  {activity.duration}
                </div>
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}