import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: string;
  permissions: Permission[];
}

export function PermissionOverview() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select(`
            role,
            permissions (
              id,
              name,
              description,
              category
            )
          `);

        if (error) {
          throw error;
        }

        // Group permissions by role
        const groupedData: { [key: string]: Permission[] } = {};
        
        data?.forEach((item: any) => {
          const role = item.role;
          const permission = item.permissions;
          
          if (!groupedData[role]) {
            groupedData[role] = [];
          }
          groupedData[role].push(permission);
        });

        const rolePermissionsList = Object.entries(groupedData).map(([role, permissions]) => ({
          role,
          permissions: permissions.sort((a, b) => a.category.localeCompare(b.category))
        }));

        setRolePermissions(rolePermissionsList);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRolePermissions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'execution': return 'bg-green-100 text-green-800';
      case 'scheduling': return 'bg-yellow-100 text-yellow-800';
      case 'jobs': return 'bg-blue-100 text-blue-800';
      case 'credentials': return 'bg-red-100 text-red-800';
      case 'outputs': return 'bg-indigo-100 text-indigo-800';
      case 'administration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {rolePermissions.map((roleData) => (
          <Card key={roleData.role} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className={getRoleColor(roleData.role)}>
                  {roleData.role.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({roleData.permissions.length} permissions)
                </span>
              </CardTitle>
              <CardDescription>
                Permissions assigned to the {roleData.role} role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupPermissionsByCategory(roleData.permissions)).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({permissions.length})
                    </span>
                  </div>
                  <div className="space-y-1 ml-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="text-sm">
                        <p className="font-medium">{permission.name.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Categories</CardTitle>
          <CardDescription>
            Overview of all permission categories in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {['execution', 'scheduling', 'jobs', 'credentials', 'outputs', 'administration'].map((category) => (
              <div key={category} className="p-4 border rounded-lg">
                <Badge className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {category === 'execution' && 'Run queries and execute jobs'}
                  {category === 'scheduling' && 'Schedule jobs for future execution'}
                  {category === 'jobs' && 'Create, edit, and manage jobs'}
                  {category === 'credentials' && 'Manage database credentials'}
                  {category === 'outputs' && 'Download and access job outputs'}
                  {category === 'administration' && 'System administration tasks'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}