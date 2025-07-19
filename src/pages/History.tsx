import { useState } from "react";
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useJobExecutions } from "@/hooks/useJobExecutions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HistoryItem {
  id: string;
  jobName: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: "success" | "failed" | "running";
  duration: string;
  logs: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    jobName: "Customer Data Sync",
    runId: "run_20241219_001",
    startTime: "2024-12-19 14:30:00",
    endTime: "2024-12-19 14:30:02",
    status: "success",
    duration: "2.1s",
    logs: "2024-12-19 14:30:00 INFO: Starting Customer Data Sync\n2024-12-19 14:30:00 INFO: Connecting to PostgreSQL database...\n2024-12-19 14:30:01 INFO: Connection established\n2024-12-19 14:30:01 INFO: Executing query: SELECT * FROM customers WHERE updated_at > '2024-12-18'\n2024-12-19 14:30:01 INFO: Query executed successfully, 1,247 rows returned\n2024-12-19 14:30:02 INFO: Data exported to S3: s3://data-bucket/customers/2024/12/19/customers_001.csv\n2024-12-19 14:30:02 INFO: Job completed successfully",
  },
  {
    id: "2",
    jobName: "Sales Report Extract",
    runId: "run_20241219_002",
    startTime: "2024-12-19 13:15:00",
    endTime: "2024-12-19 13:15:30",
    status: "failed",
    duration: "30s",
    logs: "2024-12-19 13:15:00 INFO: Starting Sales Report Extract\n2024-12-19 13:15:00 INFO: Connecting to Redshift cluster...\n2024-12-19 13:15:05 ERROR: Connection timeout\n2024-12-19 13:15:05 INFO: Retrying connection (attempt 2/3)...\n2024-12-19 13:15:15 ERROR: Connection timeout\n2024-12-19 13:15:15 INFO: Retrying connection (attempt 3/3)...\n2024-12-19 13:15:25 ERROR: Connection timeout\n2024-12-19 13:15:25 ERROR: Max retries exceeded\n2024-12-19 13:15:30 ERROR: Job failed: Unable to connect to Redshift cluster\n\nStack trace:\nConnectionTimeoutError: Connection timeout after 10000ms\n    at RedshiftConnector.connect (redshift.js:45)\n    at JobRunner.execute (runner.js:123)\n    at main (index.js:67)",
  },
  {
    id: "3",
    jobName: "Inventory Update",
    runId: "run_20241219_003",
    startTime: "2024-12-19 12:00:00",
    endTime: "2024-12-19 12:00:45",
    status: "success",
    duration: "45s",
    logs: "2024-12-19 12:00:00 INFO: Starting Inventory Update\n2024-12-19 12:00:00 INFO: Connecting to Oracle database...\n2024-12-19 12:00:03 INFO: Connection established\n2024-12-19 12:00:03 INFO: Executing inventory sync query...\n2024-12-19 12:00:35 INFO: Processing 15,432 inventory records\n2024-12-19 12:00:42 INFO: Data transformation complete\n2024-12-19 12:00:44 INFO: Data exported to S3: s3://data-bucket/inventory/2024/12/19/inventory_003.json\n2024-12-19 12:00:45 INFO: Job completed successfully",
  },
  {
    id: "4",
    jobName: "Data Cleanup Script",
    runId: "run_20241219_004",
    startTime: "2024-12-19 11:30:00",
    endTime: "",
    status: "running",
    duration: "45s and counting",
    logs: "2024-12-19 11:30:00 INFO: Starting Data Cleanup Script\n2024-12-19 11:30:00 INFO: Initializing Python environment...\n2024-12-19 11:30:05 INFO: Loading data cleanup modules\n2024-12-19 11:30:10 INFO: Connecting to data sources...\n2024-12-19 11:30:15 INFO: Beginning cleanup operations\n2024-12-19 11:30:30 INFO: Processing batch 1/5 (2,150 records)\n2024-12-19 11:30:45 INFO: Processing batch 2/5 (2,150 records)...",
  },
  {
    id: "5",
    jobName: "User Analytics Export",
    runId: "run_20241219_005",
    startTime: "2024-12-19 10:00:00",
    endTime: "2024-12-19 10:00:03",
    status: "success",
    duration: "3.2s",
    logs: "2024-12-19 10:00:00 INFO: Starting User Analytics Export\n2024-12-19 10:00:00 INFO: Connecting to PostgreSQL analytics database...\n2024-12-19 10:00:01 INFO: Connection established\n2024-12-19 10:00:01 INFO: Executing analytics query...\n2024-12-19 10:00:02 INFO: Query executed successfully, 5,689 rows returned\n2024-12-19 10:00:03 INFO: Data exported to S3: s3://analytics-bucket/users/2024/12/19/user_analytics_005.csv\n2024-12-19 10:00:03 INFO: Job completed successfully",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    case "running":
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <Clock className="w-3 h-3 mr-1 animate-pulse" />
          Running
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-muted text-muted-foreground">
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export default function History() {
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);
  const [selectedJobName, setSelectedJobName] = useState<string>("");
  const { data: executions, isLoading } = useJobExecutions();

  const handleViewLogs = (logs: string, jobName: string) => {
    setSelectedLogs(logs);
    setSelectedJobName(jobName);
  };

  const handleCloseLogs = () => {
    setSelectedLogs(null);
    setSelectedJobName("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">
          View all past job executions and their logs
        </p>
      </div>

      {/* History Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Job Execution History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Run ID</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading execution history...
                  </TableCell>
                </TableRow>
              ) : executions && executions.length > 0 ? (
                executions.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.job?.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.run_id}</TableCell>
                  <TableCell className="text-sm">{new Date(item.started_at).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    {item.completed_at ? new Date(item.completed_at).toLocaleString() : (
                      <span className="text-muted-foreground italic">Running...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.duration_ms ? `${(item.duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLogs(item.logs || 'No logs available', item.job?.name || 'Unknown Job')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No job executions found. Execute some jobs to see history here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs Modal */}
      <Dialog open={!!selectedLogs} onOpenChange={() => handleCloseLogs()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Logs for {selectedJobName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {selectedLogs}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}