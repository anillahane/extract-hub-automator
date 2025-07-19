import { useState } from "react";
import { Plus, Edit, Trash2, Play, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CreateJobModal } from "@/components/CreateJobModal";

interface Job {
  id: string;
  name: string;
  sourceType: string;
  schedule: string;
  lastRunStatus: "success" | "failed" | "running" | "pending";
  lastRun?: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    name: "Customer Data Sync",
    sourceType: "PostgreSQL",
    schedule: "Daily at 2:00 AM",
    lastRunStatus: "success",
    lastRun: "2 hours ago",
  },
  {
    id: "2",
    name: "Sales Report Extract",
    sourceType: "Redshift",
    schedule: "Weekly on Monday",
    lastRunStatus: "failed",
    lastRun: "1 day ago",
  },
  {
    id: "3",
    name: "Inventory Update",
    sourceType: "Oracle",
    schedule: "Every 4 hours",
    lastRunStatus: "success",
    lastRun: "30 minutes ago",
  },
  {
    id: "4",
    name: "Data Cleanup Script",
    sourceType: "Python Script",
    schedule: "Daily at 1:00 AM",
    lastRunStatus: "running",
    lastRun: "Running now",
  },
  {
    id: "5",
    name: "User Analytics Export",
    sourceType: "PostgreSQL",
    schedule: "Hourly",
    lastRunStatus: "pending",
    lastRun: "Never",
  },
];

const getStatusBadge = (status: Job["lastRunStatus"]) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          Failed
        </Badge>
      );
    case "running":
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          Running
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-muted text-muted-foreground">
          Pending
        </Badge>
      );
    default:
      return null;
  }
};

const getSourceIcon = (sourceType: string) => {
  return <Database className="w-4 h-4" />;
};

export default function Jobs() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleRunJob = (jobId: string) => {
    console.log("Running job:", jobId);
    // TODO: Implement job execution
  };

  const handleEditJob = (jobId: string) => {
    console.log("Editing job:", jobId);
    // TODO: Implement job editing
  };

  const handleDeleteJob = (jobId: string) => {
    console.log("Deleting job:", jobId);
    // TODO: Implement job deletion
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your data extraction jobs
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-primary text-white shadow-elegant"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Jobs Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Configured Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(job.sourceType)}
                      <span>{job.sourceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{job.schedule}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.lastRunStatus)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.lastRun}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunJob(job.id)}
                        disabled={job.lastRunStatus === "running"}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Job Modal */}
      <CreateJobModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}