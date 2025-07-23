import { useState } from "react";
import { ChevronDown, ChevronRight, Database, BarChart3, History, Settings, Users, Shield, Plus, Play, Download, Search, Filter, Bell, RefreshCw, FileText, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  features: Array<{
    name: string;
    description: string;
    steps?: string[];
  }>;
}

const helpSections: HelpSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: BarChart3,
    description: "Get an overview of your data extraction operations and system performance.",
    features: [
      {
        name: "Statistics Overview",
        description: "View key metrics including total extractions, success rates, and scheduled jobs.",
        steps: [
          "Navigate to the Dashboard from the sidebar",
          "Review the four main statistics cards",
          "Monitor trends with the up/down indicators",
          "Check success and failure rates"
        ]
      },
      {
        name: "Recent Activity",
        description: "See the latest job executions and their status.",
        steps: [
          "Check the Recent Activity panel on the left",
          "View job names, timestamps, and durations",
          "Monitor status badges (Success, Failed, Running)",
          "Click on items for more details"
        ]
      },
      {
        name: "Extraction Chart",
        description: "Visualize data extraction trends over time.",
        steps: [
          "Review the chart on the right side",
          "Analyze success vs. failure patterns",
          "Identify peak usage times",
          "Track performance over the last 7 days"
        ]
      }
    ]
  },
  {
    id: "jobs",
    title: "Jobs Management",
    icon: Database,
    description: "Create, configure, and manage your data extraction jobs.",
    features: [
      {
        name: "Creating Jobs",
        description: "Set up new data extraction jobs with custom SQL queries.",
        steps: [
          "Click the 'Create New Job' button",
          "Enter job name and description",
          "Select source type (PostgreSQL, MySQL, Oracle, etc.)",
          "Choose database credentials",
          "Write or paste your SQL query",
          "Configure scheduling options",
          "Set S3 output destination",
          "Save the job configuration"
        ]
      },
      {
        name: "Job Scheduling",
        description: "Configure when and how often jobs should run.",
        steps: [
          "Select 'Scheduled' in schedule type",
          "Choose frequency (Daily, Weekly, Monthly)",
          "Set specific time for execution",
          "Enable date-based subfolders if needed",
          "Review and confirm schedule settings"
        ]
      },
      {
        name: "Job Execution",
        description: "Run jobs manually or view scheduled executions.",
        steps: [
          "Find your job in the jobs list",
          "Click the 'Run Now' button for immediate execution",
          "Monitor status changes in real-time",
          "Check execution logs and results"
        ]
      },
      {
        name: "Job Management",
        description: "Edit, delete, and manage existing jobs.",
        steps: [
          "Use the Edit button to modify job settings",
          "Update SQL queries, schedules, or destinations",
          "Delete jobs that are no longer needed",
          "Monitor job status and last execution times"
        ]
      }
    ]
  },
  {
    id: "history",
    title: "Execution History",
    icon: History,
    description: "Track and analyze job execution history and performance.",
    features: [
      {
        name: "Viewing Execution Logs",
        description: "Review detailed logs of all job executions.",
        steps: [
          "Navigate to the History page",
          "Browse the list of recent executions",
          "Check status, duration, and timestamps",
          "Click on entries for detailed logs"
        ]
      },
      {
        name: "Filtering and Search",
        description: "Find specific executions using filters and search.",
        steps: [
          "Use the search bar to find specific jobs",
          "Filter by status (Success, Failed, Running)",
          "Sort by date, duration, or job name",
          "Export filtered results for analysis"
        ]
      },
      {
        name: "Performance Analysis",
        description: "Analyze job performance and identify issues.",
        steps: [
          "Review execution durations and trends",
          "Identify frequently failing jobs",
          "Check error messages and logs",
          "Monitor data processing volumes"
        ]
      }
    ]
  },
  {
    id: "settings",
    title: "Settings & Configuration",
    icon: Settings,
    description: "Manage database credentials, system settings, and preferences.",
    features: [
      {
        name: "Database Credentials",
        description: "Add and manage database connection credentials.",
        steps: [
          "Click 'Add New Credential' button",
          "Select database type (PostgreSQL, MySQL, etc.)",
          "Enter connection details (host, port, database)",
          "Provide username and password",
          "Configure SSL settings if needed",
          "Test and save the connection"
        ]
      },
      {
        name: "Notification Settings",
        description: "Configure email alerts and notifications.",
        steps: [
          "Open notification settings dialog",
          "Enter your email address",
          "Enable/disable job completion notifications",
          "Configure failure alerts",
          "Set up weekly reports",
          "Save notification preferences"
        ]
      },
      {
        name: "Backup & Recovery",
        description: "Export and import system configurations.",
        steps: [
          "Open backup settings dialog",
          "Click 'Export Configuration' to download backup",
          "Use 'Import Configuration' to restore from backup",
          "Review what's included in backups",
          "Note: Passwords are encrypted in exports"
        ]
      },
      {
        name: "System Logs",
        description: "View and analyze system logs for troubleshooting.",
        steps: [
          "Open system logs dialog",
          "Select log type (PostgreSQL, Auth, Functions, Application)",
          "Use search to filter specific messages",
          "Review log levels (INFO, WARN, ERROR)",
          "Export logs for external analysis"
        ]
      }
    ]
  },
  {
    id: "users",
    title: "User Management",
    icon: Users,
    description: "Manage user accounts, roles, and permissions.",
    features: [
      {
        name: "User Overview",
        description: "View all users and their current status.",
        steps: [
          "Navigate to the Users page",
          "Browse the list of all users",
          "Check user status (Active, Inactive)",
          "Review user roles and permissions"
        ]
      },
      {
        name: "User Administration",
        description: "Add, edit, and manage user accounts (Admin only).",
        steps: [
          "Use admin controls to manage users",
          "Add new users to the system",
          "Assign roles and permissions",
          "Activate or deactivate accounts",
          "Reset user passwords if needed"
        ]
      }
    ]
  },
  {
    id: "admin",
    title: "Admin Panel",
    icon: Shield,
    description: "Administrative functions for system management (Admin users only).",
    features: [
      {
        name: "User Management",
        description: "Comprehensive user administration tools.",
        steps: [
          "Access admin-only user management features",
          "View detailed user information",
          "Manage user roles and permissions",
          "Monitor user activity and sessions"
        ]
      },
      {
        name: "Permission Overview",
        description: "Review and manage system permissions.",
        steps: [
          "View all available permissions",
          "Understand permission categories",
          "Assign permissions to user roles",
          "Monitor permission usage"
        ]
      },
      {
        name: "System Monitoring",
        description: "Monitor overall system health and performance.",
        steps: [
          "Review system-wide statistics",
          "Monitor resource usage",
          "Check for system alerts",
          "Manage system configurations"
        ]
      }
    ]
  }
];

export default function Help() {
  const [openSections, setOpenSections] = useState<string[]>(["dashboard"]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Help & Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive guide to using the Data Extraction Hub. Learn how to create jobs, 
          manage data sources, monitor executions, and configure your system.
        </p>
      </div>

      {/* Quick Navigation */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Quick Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {helpSections.map((section) => (
              <Button
                key={section.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  const element = document.getElementById(section.id);
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center space-x-2 justify-start"
              >
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="space-y-6">
        {helpSections.map((section) => (
          <Card key={section.id} id={section.id} className="shadow-card">
            <Collapsible
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <section.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <p className="text-muted-foreground font-normal text-base">
                          {section.description}
                        </p>
                      </div>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {section.features.length} features
                      </Badge>
                      {openSections.includes(section.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {section.features.map((feature, featureIndex) => (
                      <div key={featureIndex}>
                        {featureIndex > 0 && <Separator className="my-6" />}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-primary">
                            {feature.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {feature.description}
                          </p>
                          {feature.steps && (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">
                                Step-by-Step Guide:
                              </h4>
                              <ol className="space-y-2">
                                {feature.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                      {stepIndex + 1}
                                    </span>
                                    <span className="text-sm">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Additional Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Getting Started Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Start by adding your database credentials in Settings</li>
                <li>• Create a simple test job to verify connectivity</li>
                <li>• Use the Dashboard to monitor your first executions</li>
                <li>• Set up notifications to stay informed of job status</li>
                <li>• Review the History page to understand execution patterns</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Test SQL queries before scheduling jobs</li>
                <li>• Use descriptive names for jobs and credentials</li>
                <li>• Regular backup of your configurations</li>
                <li>• Monitor system logs for performance insights</li>
                <li>• Keep credentials secure and rotate passwords regularly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Contact */}
      <Card className="shadow-card bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
          <p className="text-muted-foreground mb-4">
            If you can't find what you're looking for in this guide, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View System Logs
            </Button>
            <Button>
              <Bell className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}