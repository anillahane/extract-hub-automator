import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_roles: Array<{
    role: string;
    assigned_at: string;
    assigned_by: string | null;
  }>;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from admin-manage-users function...');
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        method: 'GET'
      });

      console.log('Response from admin-manage-users:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function error:', data.error);
        throw new Error(data.error);
      }

      console.log('Users fetched successfully:', data?.users);
      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        method: 'POST',
        body: {
          action: 'assign_role',
          user_id: userId,
          role
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Role assigned successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        method: 'POST',
        body: {
          action: 'remove_role',
          user_id: userId,
          role
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Role removed successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        method: 'POST',
        body: {
          action: 'update_status',
          user_id: userId,
          status
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const updateUserProfile = async (userId: string, displayName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        method: 'POST',
        body: {
          action: 'update_profile',
          user_id: userId,
          display_name: displayName
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('User profile updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update user profile');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    assignRole,
    removeRole,
    updateUserStatus,
    updateUserProfile
  };
}