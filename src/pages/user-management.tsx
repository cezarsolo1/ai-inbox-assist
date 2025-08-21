import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, UserCheck } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'tenant';
  created_at: string;
}

export default function UserManagementPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'tenant'>('tenant');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      try {
        // Try to get users with roles using RPC function
        const { data: authUsers, error: authError } = await supabase
          .rpc('get_users_with_roles');
        
        if (authError) {
          throw authError;
        }
        
        return (authUsers || []) as UserWithRole[];
      } catch (error) {
        // Fallback: get users from user_roles table
        const { data: userRoles, error: fallbackError } = await supabase
          .from('user_roles')
          .select('user_id, role, created_at')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        return (userRoles || []).map(ur => ({
          id: ur.user_id,
          email: `User ${ur.user_id.slice(0, 8)}...`,
          role: ur.role as 'admin' | 'tenant',
          created_at: ur.created_at
        }));
      }
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: 'admin' | 'tenant' }) => {
      const { error } = await supabase.rpc('set_user_role', {
        user_uuid: userId,
        new_role: newRole
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      setSelectedUserId("");
      setSelectedRole('tenant');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  });

  const handleRoleUpdate = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }

    updateRoleMutation.mutate({
      userId: selectedUserId,
      newRole: selectedRole
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {/* Role Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Assign User Roles</span>
          </CardTitle>
          <CardDescription>
            Select a user and assign them a role. Admins can access the inbox and management features, while tenants can file tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'tenant') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleRoleUpdate}
                disabled={!selectedUserId || updateRoleMutation.isPending}
                className="w-full"
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Current users and their assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Tenant'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <Badge variant="default">Admin</Badge>
            <div>
              <p className="font-medium">Administrator Access</p>
              <p className="text-sm text-muted-foreground">
                Can access inbox, manage conversations, view templates, properties, tenants, and RACI matrix. Full system access.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="secondary">Tenant</Badge>
            <div>
              <p className="font-medium">Tenant Access</p>
              <p className="text-sm text-muted-foreground">
                Can file tickets and access tenant-specific features. Limited to tenant portal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}