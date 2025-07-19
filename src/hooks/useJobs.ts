import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Job {
  id: string;
  name: string;
  description?: string;
  source_type: string;
  code: string;
  credential_id?: string;
  schedule_type: 'now' | 'schedule';
  frequency?: string;
  schedule_time?: string;
  s3_bucket?: string;
  folder_path?: string;
  date_subfolders?: boolean;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  credentials?: {
    id: string;
    name: string;
    type: string;
    host: string;
    database_name: string;
  };
  latest_execution?: {
    status: string;
    started_at: string;
    completed_at?: string;
  };
}

export interface CreateJobData {
  name: string;
  description?: string;
  source_type: string;
  code: string;
  credential_id?: string;
  schedule_type: 'now' | 'schedule';
  frequency?: string;
  schedule_time?: string;
  s3_bucket?: string;
  folder_path?: string;
  date_subfolders?: boolean;
}

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-jobs', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw new Error('Failed to fetch jobs');
      }

      return data.jobs as Job[];
    }
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobData: CreateJobData) => {
      const { data, error } = await supabase.functions.invoke('manage-jobs', {
        method: 'POST',
        body: jobData
      });

      if (error) {
        console.error('Error creating job:', error);
        throw new Error(error.message || 'Failed to create job');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    }
  });
};

export const useExecuteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('execute-job', {
        method: 'POST',
        body: { jobId }
      });

      if (error) {
        console.error('Error executing job:', error);
        throw new Error(error.message || 'Failed to execute job');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-executions'] });
      toast({
        title: "Success",
        description: `Job executed successfully. ${data.rows_processed} rows processed.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute job",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-jobs', {
        method: 'DELETE',
        body: null,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error deleting job:', error);
        throw new Error(error.message || 'Failed to delete job');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  });
};