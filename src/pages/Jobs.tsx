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
import { useJobs, useExecuteJob, useDeleteJob } from "@/hooks/useJobs";

const getStatusBadge = (status: string) => {
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
    case "draft":
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
  const { data: jobs, isLoading } = useJobs();
  const executeJobMutation = useExecuteJob();
  const deleteJobMutation = useDeleteJob();

  const handleRunJob = (jobId: string) => {
    executeJobMutation.mutate(jobId);
  };

  const handleEditJob = (jobId: string) => {
    console.log("Editing job:", jobId);
    // TODO: Implement job editing
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const formatSchedule = (job: any) => {
    if (job.schedule_type === 'now') {
      return 'Run manually';
    }
    return `${job.frequency} at ${job.schedule_time || 'default time'}`;
  };

  const getLastRunInfo = (job: any) => {
    if (job.latest_execution) {
      const timeDiff = new Date().getTime() - new Date(job.latest_execution.started_at).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      return hoursAgo > 0 ? `${hoursAgo} hours ago` : 'Less than an hour ago';
    }
    return 'Never';
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading jobs...
                  </TableCell>
                </TableRow>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(job.source_type)}
                        <span className="capitalize">{job.source_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatSchedule(job)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.latest_execution?.status || job.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getLastRunInfo(job)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunJob(job.id)}
                          disabled={job.latest_execution?.status === "running" || executeJobMutation.isPending}
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
                          disabled={deleteJobMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No jobs created yet. Click "Create New Job" to get started.
                  </TableCell>
                </TableRow>
              )}
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