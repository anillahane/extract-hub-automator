import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateJobRequest {
  name: string
  description?: string
  source_type: string
  code: string
  credential_id?: string
  schedule_type: 'now' | 'schedule'
  frequency?: string
  schedule_time?: string
  s3_bucket?: string
  folder_path?: string
  date_subfolders?: boolean
}

interface UpdateJobRequest extends CreateJobRequest {
  id: string
  status?: 'active' | 'inactive' | 'draft'
}

Deno.serve(async (req) => {
  console.log('Manage jobs function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      throw new Error('Authentication required')
    }

    console.log('User authenticated:', user.id)

    const url = new URL(req.url)
    const method = req.method

    if (method === 'GET') {
      // Get all jobs for the user
      const { data: jobs, error: jobsError } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          credentials (
            id,
            name,
            type,
            host,
            database_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error('Jobs fetch error:', jobsError)
        throw new Error('Failed to fetch jobs')
      }

      // Get latest execution for each job
      const jobsWithStatus = await Promise.all(
        jobs.map(async (job) => {
          const { data: latestExecution } = await supabaseClient
            .from('job_executions')
            .select('status, started_at, completed_at')
            .eq('job_id', job.id)
            .order('started_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...job,
            latest_execution: latestExecution
          }
        })
      )

      return new Response(
        JSON.stringify({ jobs: jobsWithStatus }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'POST') {
      // Create new job
      const jobData: CreateJobRequest = await req.json()

      const { data: job, error: createError } = await supabaseClient
        .from('jobs')
        .insert({
          user_id: user.id,
          name: jobData.name,
          description: jobData.description,
          source_type: jobData.source_type,
          code: jobData.code,
          credential_id: jobData.credential_id,
          schedule_type: jobData.schedule_type,
          frequency: jobData.frequency,
          schedule_time: jobData.schedule_time,
          s3_bucket: jobData.s3_bucket,
          folder_path: jobData.folder_path,
          date_subfolders: jobData.date_subfolders,
          status: jobData.schedule_type === 'now' ? 'active' : 'draft'
        })
        .select()
        .single()

      if (createError) {
        console.error('Job creation error:', createError)
        throw new Error('Failed to create job: ' + createError.message)
      }

      console.log('Job created:', job.id)

      return new Response(
        JSON.stringify({ success: true, job }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    if (method === 'PUT') {
      // Update existing job
      const jobData: UpdateJobRequest = await req.json()

      const { data: job, error: updateError } = await supabaseClient
        .from('jobs')
        .update({
          name: jobData.name,
          description: jobData.description,
          source_type: jobData.source_type,
          code: jobData.code,
          credential_id: jobData.credential_id,
          schedule_type: jobData.schedule_type,
          frequency: jobData.frequency,
          schedule_time: jobData.schedule_time,
          s3_bucket: jobData.s3_bucket,
          folder_path: jobData.folder_path,
          date_subfolders: jobData.date_subfolders,
          status: jobData.status
        })
        .eq('id', jobData.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Job update error:', updateError)
        throw new Error('Failed to update job: ' + updateError.message)
      }

      console.log('Job updated:', job.id)

      return new Response(
        JSON.stringify({ success: true, job }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'DELETE') {
      // Delete job
      const jobId = url.searchParams.get('id')
      
      if (!jobId) {
        throw new Error('Job ID is required')
      }

      const { error: deleteError } = await supabaseClient
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Job deletion error:', deleteError)
        throw new Error('Failed to delete job: ' + deleteError.message)
      }

      console.log('Job deleted:', jobId)

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Method not allowed')

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})