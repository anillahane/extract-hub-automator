-- Create credentials table for storing database connections
CREATE TABLE public.credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('postgresql', 'redshift', 'oracle', 'mysql')),
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL, -- In production, this should be encrypted
  ssl_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create jobs table for storing extraction jobs
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('postgresql', 'redshift', 'oracle', 'python')),
  code TEXT NOT NULL, -- SQL query or Python script
  credential_id UUID REFERENCES public.credentials(id) ON DELETE SET NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('now', 'schedule')) DEFAULT 'now',
  frequency TEXT CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  schedule_time TIME,
  s3_bucket TEXT,
  folder_path TEXT,
  date_subfolders BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'draft')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create job executions table for tracking execution history
CREATE TABLE public.job_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')) DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  rows_processed INTEGER DEFAULT 0,
  error_message TEXT,
  logs TEXT,
  output_location TEXT, -- S3 path or other storage location
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credentials
CREATE POLICY "Users can view their own credentials" 
ON public.credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credentials" 
ON public.credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" 
ON public.credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" 
ON public.credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for jobs
CREATE POLICY "Users can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for job executions
CREATE POLICY "Users can view their own job executions" 
ON public.job_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job executions" 
ON public.job_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_job_executions_job_id ON public.job_executions(job_id);
CREATE INDEX idx_job_executions_user_id ON public.job_executions(user_id);
CREATE INDEX idx_job_executions_status ON public.job_executions(status);
CREATE INDEX idx_job_executions_started_at ON public.job_executions(started_at);

-- Create function to generate unique run IDs
CREATE OR REPLACE FUNCTION public.generate_run_id(job_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'run_' || TO_CHAR(now(), 'YYYYMMDD_HH24MI') || '_' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
END;
$$ LANGUAGE plpgsql;