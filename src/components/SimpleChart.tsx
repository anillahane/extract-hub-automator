import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const chartData = [
  { day: "Mon", successful: 24, failed: 3 },
  { day: "Tue", successful: 31, failed: 2 },
  { day: "Wed", successful: 28, failed: 5 },
  { day: "Thu", successful: 35, failed: 1 },
  { day: "Fri", successful: 42, failed: 4 },
  { day: "Sat", successful: 18, failed: 2 },
  { day: "Sun", successful: 15, failed: 1 },
];

export function SimpleChart() {
  const maxValue = Math.max(...chartData.map(d => d.successful + d.failed));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Extraction Success vs Failure (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((item) => {
            const successPercentage = (item.successful / maxValue) * 100;
            const failedPercentage = (item.failed / maxValue) * 100;
            
            return (
              <div key={item.day} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.day}</span>
                  <span className="text-muted-foreground">
                    {item.successful + item.failed} total
                  </span>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden bg-muted">
                  <div
                    className="bg-success transition-all duration-300"
                    style={{ width: `${successPercentage}%` }}
                    title={`${item.successful} successful`}
                  />
                  <div
                    className="bg-destructive transition-all duration-300"
                    style={{ width: `${failedPercentage}%` }}
                    title={`${item.failed} failed`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>✓ {item.successful} successful</span>
                  <span>✗ {item.failed} failed</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-sm"></div>
            <span>Successful</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-sm"></div>
            <span>Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}