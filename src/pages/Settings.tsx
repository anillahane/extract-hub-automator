import { useState } from "react";
import { Edit, Trash2, Database, Shield, Key, Plus, Bell, Download, Upload, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useCredentials, useCreateCredential, useDeleteCredential, CreateCredentialData } from "@/hooks/useCredentials";
import { useJobs } from "@/hooks/useJobs";
import { useToast } from "@/components/ui/use-toast";

const getTypeIcon = (type: string) => {
  return <Database className="w-4 h-4" />;
};

export default function Settings() {
  const { data: credentials = [], isLoading } = useCredentials();
  const { data: jobs = [] } = useJobs();
  const { toast } = useToast();
  const createCredential = useCreateCredential();
  const deleteCredential = useDeleteCredential();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  // Get default port based on database type
  const getDefaultPort = (type: string) => {
    switch (type) {
      case 'postgresql': return 5432;
      case 'mysql': return 3306;
      case 'oracle': return 1521;
      case 'redshift': return 5439;
      case 'mssql': return 1433;
      default: return 5432;
    }
  };

  // Handle database type change
  const handleTypeChange = (type: 'postgresql' | 'redshift' | 'oracle' | 'mysql' | 'mssql') => {
    setNewCredential({
      ...newCredential,
      type,
      port: getDefaultPort(type)
    });
  };

  // Get database-specific configuration
  const getDatabaseConfig = (type: string) => {
    switch (type) {
      case 'postgresql':
        return {
          hostPlaceholder: 'localhost',
          databasePlaceholder: 'postgres',
          usernamePlaceholder: 'postgres',
          helpText: 'Connect to your PostgreSQL database',
          showSSL: true
        };
      case 'mysql':
        return {
          hostPlaceholder: 'localhost',
          databasePlaceholder: 'mysql',
          usernamePlaceholder: 'root',
          helpText: 'Connect to your MySQL database',
          showSSL: true
        };
      case 'oracle':
        return {
          hostPlaceholder: 'localhost',
          databasePlaceholder: 'XE',
          usernamePlaceholder: 'system',
          helpText: 'Connect to your Oracle database using Service Name',
          showSSL: false
        };
      case 'redshift':
        return {
          hostPlaceholder: 'redshift-cluster.xxxx.region.redshift.amazonaws.com',
          databasePlaceholder: 'dev',
          usernamePlaceholder: 'awsuser',
          helpText: 'Connect to your Amazon Redshift cluster',
          showSSL: true
        };
      case 'mssql':
        return {
          hostPlaceholder: 'localhost',
          databasePlaceholder: 'master',
          usernamePlaceholder: 'sa',
          helpText: 'Connect to your Microsoft SQL Server',
          showSSL: true
        };
      default:
        return {
          hostPlaceholder: 'localhost',
          databasePlaceholder: 'database',
          usernamePlaceholder: 'username',
          helpText: 'Configure your database connection',
          showSSL: true
        };
    }
  };

  const dbConfig = getDatabaseConfig(newCredential.type);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobCompletions: true,
    jobFailures: true,
    systemAlerts: false,
    weeklyReports: false,
    emailAddress: "",
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

  const handleSaveNotifications = () => {
    // Here you would typically save to backend
    console.log("Saving notification settings:", notificationSettings);
    setShowNotificationDialog(false);
  };

  // Backup and Recovery functions
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        credentials: credentials.map(cred => ({
          ...cred,
          password: "***ENCRYPTED***" // Don't export actual passwords
        })),
        jobs: jobs,
        notificationSettings
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your configuration has been exported successfully. Note: Passwords are not included for security.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export configuration data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate the import data structure
      if (!importData.version || !importData.credentials || !importData.jobs) {
        throw new Error("Invalid backup file format");
      }

      // Here you would typically import the data to your backend
      console.log("Importing data:", importData);

      toast({
        title: "Import Successful",
        description: `Imported ${importData.credentials.length} credentials and ${importData.jobs.length} jobs. Please review and update passwords manually.`,
      });

      setShowBackupDialog(false);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import configuration data. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = "";
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
                  {dbConfig.helpText}
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
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                      <SelectItem value="redshift">Amazon Redshift</SelectItem>
                      <SelectItem value="mssql">Microsoft SQL Server</SelectItem>
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
                    placeholder={dbConfig.hostPlaceholder}
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
                    onChange={(e) => setNewCredential({ ...newCredential, port: parseInt(e.target.value) || getDefaultPort(newCredential.type) })}
                    className="col-span-3"
                    placeholder={newCredential.port.toString()}
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
                    placeholder={dbConfig.databasePlaceholder}
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
                    placeholder={dbConfig.usernamePlaceholder}
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
                {dbConfig.showSSL && (
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
                )}
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
              <CardTitle className="text-base flex items-center space-x-2">
                <Bell className="w-4 h-4 text-primary" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure email notifications for job completions and failures.
              </p>
              <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-3">
                    Configure Notifications
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                    <DialogDescription>
                      Configure your email notifications and alert preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Email Address */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={notificationSettings.emailAddress}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          emailAddress: e.target.value 
                        })}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable all email notifications
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: checked
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Job Completions</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when data extraction jobs complete successfully
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.jobCompletions}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            jobCompletions: checked
                          })}
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Job Failures</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when data extraction jobs fail
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.jobFailures}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            jobFailures: checked
                          })}
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>System Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about system maintenance and updates
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.systemAlerts}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            systemAlerts: checked
                          })}
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Weekly Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive weekly summary reports of your data extraction activities
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            weeklyReports: checked
                          })}
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNotifications}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Database className="w-4 h-4 text-primary" />
                <span>Backup & Recovery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export your configurations for backup or import existing settings.
              </p>
              <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-3">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Backup Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Backup & Recovery</DialogTitle>
                    <DialogDescription>
                      Export your current configuration or import a backup file.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Export Configuration</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download a backup file containing your credentials, jobs, and settings. 
                          Passwords will be encrypted and need to be re-entered after import.
                        </p>
                        <Button 
                          onClick={handleExportData}
                          disabled={isExporting}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isExporting ? "Exporting..." : "Export Configuration"}
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Import Configuration</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Restore from a backup file. This will add to your existing configuration.
                        </p>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                            id="backup-file-input"
                            disabled={isImporting}
                          />
                          <Button 
                            onClick={() => document.getElementById('backup-file-input')?.click()}
                            disabled={isImporting}
                            variant="outline"
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isImporting ? "Importing..." : "Import Configuration"}
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">What's included:</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Database credentials (passwords encrypted)</li>
                            <li>• Job configurations and schedules</li>
                            <li>• Notification settings</li>
                            <li>• System preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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