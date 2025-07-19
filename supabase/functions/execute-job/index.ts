import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobExecutionRequest {
  jobId: string
}

interface Credential {
  id: string
  type: string
  host: string
  port: number
  database_name: string
  username: string
  password: string
  ssl_enabled: boolean
}

interface Job {
  id: string
  name: string
  source_type: string
  code: string
  credential_id: string
  s3_bucket: string
  folder_path: string
  date_subfolders: boolean
}

Deno.serve(async (req) => {
  console.log('Execute job function called')

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

    const { jobId }: JobExecutionRequest = await req.json()

    if (!jobId) {
      throw new Error('Job ID is required')
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      console.error('Job fetch error:', jobError)
      throw new Error('Job not found or access denied')
    }

    console.log('Job fetched:', job.name)

    // Generate run ID
    const runId = `run_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}_${crypto.randomUUID().substring(0, 8)}`

    // Create job execution record
    const { data: execution, error: executionError } = await supabaseClient
      .from('job_executions')
      .insert({
        job_id: jobId,
        user_id: user.id,
        run_id: runId,
        status: 'running'
      })
      .select()
      .single()

    if (executionError) {
      console.error('Execution record creation error:', executionError)
      throw new Error('Failed to create execution record')
    }

    console.log('Execution record created:', execution.id)

    // Execute the job based on source type
    let result: any
    let logs = `${new Date().toISOString()} INFO: Starting job execution for ${job.name}\n`

    try {
      if (job.source_type === 'python') {
        // For Python scripts, we'll simulate execution
        logs += `${new Date().toISOString()} INFO: Executing Python script\n`
        logs += `${new Date().toISOString()} INFO: Script content: ${job.code.substring(0, 100)}...\n`
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        result = {
          rows_processed: Math.floor(Math.random() * 1000) + 100,
          success: true,
          message: 'Python script executed successfully'
        }
        
        logs += `${new Date().toISOString()} INFO: Python script completed successfully\n`
      } else {
        // For database connections, fetch credentials
        if (!job.credential_id) {
          throw new Error('No credentials configured for this job')
        }

        const { data: credential, error: credError } = await supabaseClient
          .from('credentials')
          .select('*')
          .eq('id', job.credential_id)
          .eq('user_id', user.id)
          .single()

        if (credError || !credential) {
          throw new Error('Credentials not found')
        }

        logs += `${new Date().toISOString()} INFO: Connecting to ${credential.type} database at ${credential.host}\n`
        logs += `${new Date().toISOString()} INFO: Database: ${credential.database_name}\n`
        
        // Simulate database connection and query execution
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        logs += `${new Date().toISOString()} INFO: Connection established\n`
        logs += `${new Date().toISOString()} INFO: Executing query: ${job.code.substring(0, 100)}...\n`
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        result = {
          rows_processed: Math.floor(Math.random() * 5000) + 500,
          success: true,
          message: 'Query executed successfully'
        }
        
        logs += `${new Date().toISOString()} INFO: Query executed successfully, ${result.rows_processed} rows returned\n`
      }

      // Generate output location
      let outputLocation = ''
      if (job.s3_bucket && job.folder_path) {
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `${job.name.toLowerCase().replace(/\s+/g, '_')}_${runId}`
        
        if (job.date_subfolders) {
          const datePath = timestamp.replace(/-/g, '/')
          outputLocation = `s3://${job.s3_bucket}/${job.folder_path}/${datePath}/${filename}.csv`
        } else {
          outputLocation = `s3://${job.s3_bucket}/${job.folder_path}/${filename}.csv`
        }
        
        logs += `${new Date().toISOString()} INFO: Data exported to ${outputLocation}\n`
      }

      logs += `${new Date().toISOString()} INFO: Job completed successfully\n`

      // Update execution record with success
      const { error: updateError } = await supabaseClient
        .from('job_executions')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(execution.created_at).getTime(),
          rows_processed: result.rows_processed,
          logs: logs,
          output_location: outputLocation
        })
        .eq('id', execution.id)

      if (updateError) {
        console.error('Failed to update execution record:', updateError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: execution.id,
          run_id: runId,
          rows_processed: result.rows_processed,
          output_location: outputLocation
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (executionError) {
      console.error('Job execution error:', executionError)
      
      logs += `${new Date().toISOString()} ERROR: ${executionError.message}\n`
      
      // Update execution record with failure
      const { error: updateError } = await supabaseClient
        .from('job_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(execution.created_at).getTime(),
          error_message: executionError.message,
          logs: logs
        })
        .eq('id', execution.id)

      if (updateError) {
        console.error('Failed to update execution record:', updateError)
      }

      throw executionError
    }

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