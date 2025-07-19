import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Admin manage users function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id);

    // Check if user has admin role
    const { data: adminCheck } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Fetch all user profiles with their roles
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            assigned_at,
            assigned_by
          )
        `)

      if (profilesError) {
        throw profilesError
      }

      return new Response(
        JSON.stringify({ users: profiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { action } = body

      switch (action) {
        case 'assign_role': {
          const { user_id, role } = body
          
          const { error } = await supabaseClient
            .from('user_roles')
            .insert({ user_id, role, assigned_by: user.id })

          if (error) {
            throw error
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        case 'remove_role': {
          const { user_id, role } = body
          
          const { error } = await supabaseClient
            .from('user_roles')
            .delete()
            .match({ user_id, role })

          if (error) {
            throw error
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        case 'update_status': {
          const { user_id, status } = body
          
          const { error } = await supabaseClient
            .from('profiles')
            .update({ status })
            .eq('user_id', user_id)

          if (error) {
            throw error
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        case 'update_profile': {
          const { user_id, display_name } = body
          
          const { error } = await supabaseClient
            .from('profiles')
            .update({ display_name })
            .eq('user_id', user_id)

          if (error) {
            throw error
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})