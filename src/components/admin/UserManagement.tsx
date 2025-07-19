import { useState } from "react";
import { useUserManagement, UserProfile } from "@/hooks/useUserManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, UserCheck, UserX, Plus, Minus } from "lucide-react";

const ROLES = ['admin', 'manager', 'user'] as const;
const STATUSES = ['active', 'suspended', 'pending'] as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'manager': return 'bg-blue-100 text-blue-800';
    case 'user': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function UserManagement() {
  const { users, loading, assignRole, removeRole, updateUserStatus, updateUserProfile } = useUserManagement();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditDisplayName(user.display_name || "");
  };

  const handleSaveProfile = async () => {
    if (editingUser) {
      await updateUserProfile(editingUser.user_id, editDisplayName);
      setEditingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.display_name || 'Unnamed User'}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.status}
                    onValueChange={(status) => updateUserStatus(user.user_id, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('100', '500')}`} />
                            <span className="capitalize">{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.user_roles.map((userRole) => (
                      <Badge
                        key={userRole.role}
                        variant="secondary"
                        className={getRoleColor(userRole.role)}
                      >
                        {userRole.role}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                          onClick={() => removeRole(user.user_id, userRole.role)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    <Select onValueChange={(role) => assignRole(user.user_id, role)}>
                      <SelectTrigger className="w-8 h-6 p-0 border-dashed">
                        <Plus className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter(role => 
                          !user.user_roles.some(userRole => userRole.role === role)
                        ).map((role) => (
                          <SelectItem key={role} value={role}>
                            <span className="capitalize">{role}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>
                          Update user profile information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="display-name">Display Name</Label>
                          <Input
                            id="display-name"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            placeholder="Enter display name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={user.email || ''} disabled />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}