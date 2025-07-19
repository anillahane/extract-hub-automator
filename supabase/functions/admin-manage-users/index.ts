import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and get their info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Admin action by user: ${user.id}, method: ${req.method}`);

    if (req.method === 'GET') {
      // Get all users with their profiles and roles
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
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      return new Response(
        JSON.stringify({ users: profiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { action, user_id, role, status, display_name } = await req.json();

      if (action === 'assign_role') {
        // Assign role to user
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .upsert({
            user_id,
            role,
            assigned_by: user.id
          }, {
            onConflict: 'user_id,role'
          });

        if (roleError) {
          throw roleError;
        }

        console.log(`Role ${role} assigned to user ${user_id} by admin ${user.id}`);

        return new Response(
          JSON.stringify({ message: 'Role assigned successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'remove_role') {
        // Remove role from user
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)
          .eq('role', role);

        if (roleError) {
          throw roleError;
        }

        console.log(`Role ${role} removed from user ${user_id} by admin ${user.id}`);

        return new Response(
          JSON.stringify({ message: 'Role removed successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'update_status') {
        // Update user status
        const { error: statusError } = await supabaseClient
          .from('profiles')
          .update({ status })
          .eq('user_id', user_id);

        if (statusError) {
          throw statusError;
        }

        console.log(`User ${user_id} status updated to ${status} by admin ${user.id}`);

        return new Response(
          JSON.stringify({ message: 'User status updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'update_profile') {
        // Update user profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({ display_name })
          .eq('user_id', user_id);

        if (profileError) {
          throw profileError;
        }

        console.log(`User ${user_id} profile updated by admin ${user.id}`);

        return new Response(
          JSON.stringify({ message: 'User profile updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Admin user management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});