import { useState } from "react";
import { Edit, Trash2, Database, Shield, Key, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCredentials, useCreateCredential, useDeleteCredential, CreateCredentialData } from "@/hooks/useCredentials";

const getTypeIcon = (type: string) => {
  return <Database className="w-4 h-4" />;
};

export default function Settings() {
  const { data: credentials = [], isLoading } = useCredentials();
  const createCredential = useCreateCredential();
  const deleteCredential = useDeleteCredential();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCredential, setNewCredential] = useState<CreateCredentialData>({
    name: "",
    type: "postgresql",
    host: "",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
    ssl_enabled: true,
  });

  const handleCreateCredential = async () => {
    try {
      await createCredential.mutateAsync(newCredential);
      setShowCreateDialog(false);
      setNewCredential({
        name: "",
        type: "postgresql",
        host: "",
        port: 5432,
        database_name: "",
        username: "",
        password: "",
        ssl_enabled: true,
      });
    } catch (error) {
      console.error("Error creating credential:", error);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      try {
        await deleteCredential.mutateAsync(credentialId);
      } catch (error) {
        console.error("Error deleting credential:", error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage database credentials and system configuration
        </p>
      </div>

      {/* Credentials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Database Credentials</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage database connections and authentication
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white shadow-elegant">
                <Key className="w-4 h-4 mr-2" />
                Add New Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Database Credential</DialogTitle>
                <DialogDescription>
                  Enter the details for your database connection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newCredential.name}
                    onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Production DB"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newCredential.type}
                    onValueChange={(value: any) => setNewCredential({ ...newCredential, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                      <SelectItem value="redshift">Redshift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="host" className="text-right">
                    Host
                  </Label>
                  <Input
                    id="host"
                    value={newCredential.host}
                    onChange={(e) => setNewCredential({ ...newCredential, host: e.target.value })}
                    className="col-span-3"
                    placeholder="localhost"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port" className="text-right">
                    Port
                  </Label>
                  <Input
                    id="port"
                    type="number"
                    value={newCredential.port}
                    onChange={(e) => setNewCredential({ ...newCredential, port: parseInt(e.target.value) || 5432 })}
                    className="col-span-3"
                    placeholder="5432"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="database_name" className="text-right">
                    Database
                  </Label>
                  <Input
                    id="database_name"
                    value={newCredential.database_name}
                    onChange={(e) => setNewCredential({ ...newCredential, database_name: e.target.value })}
                    className="col-span-3"
                    placeholder="mydb"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newCredential.username}
                    onChange={(e) => setNewCredential({ ...newCredential, username: e.target.value })}
                    className="col-span-3"
                    placeholder="username"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCredential.password}
                    onChange={(e) => setNewCredential({ ...newCredential, password: e.target.value })}
                    className="col-span-3"
                    placeholder="Password"
                  />
                </div>
                <div className="flex items-center space-x-2 justify-end">
                  <Checkbox
                    id="ssl"
                    checked={newCredential.ssl_enabled}
                    onCheckedChange={(checked) => setNewCredential({ ...newCredential, ssl_enabled: !!checked })}
                  />
                  <Label htmlFor="ssl" className="text-sm font-medium">
                    Enable SSL
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCredential}
                  disabled={createCredential.isPending}
                >
                  {createCredential.isPending ? "Creating..." : "Create Credential"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Credentials Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading credentials...</p>
            </div>
          </div>
        ) : credentials.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No credentials found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first database credential to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Credential
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {credentials.map((credential) => (
              <Card key={credential.id} className="shadow-card hover:shadow-elegant transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getTypeIcon(credential.type)}
                      <span>{credential.name}</span>
                    </CardTitle>
                    <Badge className="bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium capitalize">{credential.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Host:</span>
                      <span className="ml-2 font-mono text-xs break-all">
                        {credential.host}:{credential.port}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database:</span>
                      <span className="ml-2 font-medium">{credential.database_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Username:</span>
                      <span className="ml-2">{credential.username}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SSL:</span>
                      <span className="ml-2">{credential.ssl_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => console.log('Edit:', credential.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteCredential(credential.id)}
                      disabled={deleteCredential.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* System Settings Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">System Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure global system preferences
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure email notifications for job completions and failures.
              </p>
              <Button variant="outline" className="mt-3">
                Configure Notifications
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Backup & Recovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage system backups and recovery options.
              </p>
              <Button variant="outline" className="mt-3">
                Backup Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">API Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate and manage API keys for external integrations.
              </p>
              <Button variant="outline" className="mt-3">
                Manage API Keys
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and download system logs for troubleshooting.
              </p>
              <Button variant="outline" className="mt-3">
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}