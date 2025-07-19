import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface JobExecution {
  id: string;
  job_id: string;
  run_id: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  rows_processed?: number;
  error_message?: string;
  logs?: string;
  output_location?: string;
  job: {
    name: string;
  };
}

export const useJobExecutions = () => {
  return useQuery({
    queryKey: ['job-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_executions')
        .select(`
          *,
          jobs (
            name
          )
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching job executions:', error);
        throw new Error('Failed to fetch job executions');
      }

      return data.map(execution => ({
        ...execution,
        job: execution.jobs
      })) as JobExecution[];
    }
  });
};