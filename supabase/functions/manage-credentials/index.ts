import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateCredentialRequest {
  name: string
  type: 'postgresql' | 'redshift' | 'oracle' | 'mysql'
  host: string
  port: number
  database_name: string
  username: string
  password: string
  ssl_enabled: boolean
}

interface UpdateCredentialRequest extends CreateCredentialRequest {
  id: string
}

interface TestConnectionRequest {
  type: string
  host: string
  port: number
  database_name: string
  username: string
  password: string
  ssl_enabled: boolean
}

Deno.serve(async (req) => {
  console.log('Manage credentials function called')

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
      // Get all credentials for the user
      const { data: credentials, error: credentialsError } = await supabaseClient
        .from('credentials')
        .select('id, name, type, host, port, database_name, username, ssl_enabled, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (credentialsError) {
        console.error('Credentials fetch error:', credentialsError)
        throw new Error('Failed to fetch credentials')
      }

      return new Response(
        JSON.stringify({ credentials }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'POST') {
      const action = url.searchParams.get('action')

      if (action === 'test') {
        // Test database connection
        const connectionData: TestConnectionRequest = await req.json()
        
        // Simulate connection test
        console.log(`Testing connection to ${connectionData.type} at ${connectionData.host}:${connectionData.port}`)
        
        // Simulate different connection scenarios
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        
        const success = Math.random() > 0.2 // 80% success rate for demo
        
        if (success) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Successfully connected to ${connectionData.type} database`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Connection failed: Connection timeout or invalid credentials'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }
      }

      // Create new credential
      const credentialData: CreateCredentialRequest = await req.json()

      const { data: credential, error: createError } = await supabaseClient
        .from('credentials')
        .insert({
          user_id: user.id,
          name: credentialData.name,
          type: credentialData.type,
          host: credentialData.host,
          port: credentialData.port,
          database_name: credentialData.database_name,
          username: credentialData.username,
          password: credentialData.password, // In production, encrypt this
          ssl_enabled: credentialData.ssl_enabled
        })
        .select('id, name, type, host, port, database_name, username, ssl_enabled, created_at')
        .single()

      if (createError) {
        console.error('Credential creation error:', createError)
        throw new Error('Failed to create credential: ' + createError.message)
      }

      console.log('Credential created:', credential.id)

      return new Response(
        JSON.stringify({ success: true, credential }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    if (method === 'PUT') {
      // Update existing credential
      const credentialData: UpdateCredentialRequest = await req.json()

      const updateData: any = {
        name: credentialData.name,
        type: credentialData.type,
        host: credentialData.host,
        port: credentialData.port,
        database_name: credentialData.database_name,
        username: credentialData.username,
        ssl_enabled: credentialData.ssl_enabled
      }

      // Only update password if provided
      if (credentialData.password) {
        updateData.password = credentialData.password
      }

      const { data: credential, error: updateError } = await supabaseClient
        .from('credentials')
        .update(updateData)
        .eq('id', credentialData.id)
        .eq('user_id', user.id)
        .select('id, name, type, host, port, database_name, username, ssl_enabled, updated_at')
        .single()

      if (updateError) {
        console.error('Credential update error:', updateError)
        throw new Error('Failed to update credential: ' + updateError.message)
      }

      console.log('Credential updated:', credential.id)

      return new Response(
        JSON.stringify({ success: true, credential }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'DELETE') {
      // Delete credential
      const credentialId = url.searchParams.get('id')
      
      if (!credentialId) {
        throw new Error('Credential ID is required')
      }

      const { error: deleteError } = await supabaseClient
        .from('credentials')
        .delete()
        .eq('id', credentialId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Credential deletion error:', deleteError)
        throw new Error('Failed to delete credential: ' + deleteError.message)
      }

      console.log('Credential deleted:', credentialId)

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