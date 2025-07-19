import { Edit, Trash2, Database, Shield, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Credential {
  id: string;
  name: string;
  type: string;
  host: string;
  database: string;
  lastUsed: string;
  status: "active" | "inactive";
}

const mockCredentials: Credential[] = [
  {
    id: "1",
    name: "Production Database",
    type: "PostgreSQL",
    host: "prod-db.company.com",
    database: "main_production",
    lastUsed: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Staging Database",
    type: "PostgreSQL",
    host: "staging-db.company.com",
    database: "main_staging",
    lastUsed: "1 day ago",
    status: "active",
  },
  {
    id: "3",
    name: "Analytics Database",
    type: "Redshift",
    host: "analytics.us-west-2.redshift.amazonaws.com",
    database: "analytics",
    lastUsed: "3 hours ago",
    status: "active",
  },
  {
    id: "4",
    name: "Legacy Oracle DB",
    type: "Oracle",
    host: "legacy-oracle.company.com",
    database: "LEGACY",
    lastUsed: "1 week ago",
    status: "inactive",
  },
  {
    id: "5",
    name: "Data Warehouse",
    type: "Redshift",
    host: "warehouse.us-east-1.redshift.amazonaws.com",
    database: "warehouse",
    lastUsed: "5 hours ago",
    status: "active",
  },
];

const getTypeIcon = (type: string) => {
  return <Database className="w-4 h-4" />;
};

const getStatusBadge = (status: Credential["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-muted text-muted-foreground">
          Inactive
        </Badge>
      );
    default:
      return null;
  }
};

export default function Settings() {
  const handleEditCredential = (credentialId: string) => {
    console.log("Editing credential:", credentialId);
    // TODO: Implement credential editing
  };

  const handleDeleteCredential = (credentialId: string) => {
    console.log("Deleting credential:", credentialId);
    // TODO: Implement credential deletion
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
          <Button className="bg-gradient-primary text-white shadow-elegant">
            <Key className="w-4 h-4 mr-2" />
            Add New Credential
          </Button>
        </div>

        {/* Credentials Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockCredentials.map((credential) => (
            <Card key={credential.id} className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getTypeIcon(credential.type)}
                    <span>{credential.name}</span>
                  </CardTitle>
                  {getStatusBadge(credential.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{credential.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Host:</span>
                    <span className="ml-2 font-mono text-xs break-all">
                      {credential.host}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Database:</span>
                    <span className="ml-2 font-medium">{credential.database}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Used:</span>
                    <span className="ml-2">{credential.lastUsed}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditCredential(credential.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteCredential(credential.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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