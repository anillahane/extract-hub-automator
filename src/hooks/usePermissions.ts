import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Permission {
  name: string;
  description: string;
  category: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setUserRoles([]);
      setLoading(false);
      return;
    }

    const fetchUserPermissions = async () => {
      try {
        // Get user roles
        const { data: roles } = await supabase
          .rpc('get_user_roles', { _user_id: user.id });

        const roleList = roles?.map((r: any) => r.role) || [];
        setUserRoles(roleList);

        // Get user permissions based on roles
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select('permissions(name)')
          .in('role', roleList);

        const permissionList = rolePermissions
          ?.map((rp: any) => rp.permissions?.name)
          .filter(Boolean) || [];

        setPermissions(permissionList);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');

  return {
    permissions,
    userRoles,
    loading,
    hasPermission,
    hasRole,
    isAdmin,
    isManager
  };
}