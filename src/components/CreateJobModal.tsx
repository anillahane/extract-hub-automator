import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCreateJob } from "@/hooks/useJobs";
import { useCredentials } from "@/hooks/useCredentials";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JobFormData {
  name: string;
  description: string;
  sourceType: string;
  code: string;
  credentials: string;
  runType: "now" | "schedule";
  frequency: string;
  time: string;
  s3Bucket: string;
  folderPath: string;
  dateSubfolders: boolean;
}

const initialFormData: JobFormData = {
  name: "",
  description: "",
  sourceType: "",
  code: "",
  credentials: "",
  runType: "now",
  frequency: "",
  time: "",
  s3Bucket: "",
  folderPath: "",
  dateSubfolders: false,
};

const steps = [
  { title: "General Info", description: "Basic job information" },
  { title: "Configuration", description: "Source and code setup" },
  { title: "Scheduling", description: "When to run the job" },
  { title: "Destination", description: "Where to store results" },
];

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const createJobMutation = useCreateJob();
  const { data: credentials } = useCredentials();
  const { hasPermission } = usePermissions();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Check permissions
    if (!hasPermission('job_create')) {
      toast.error("You don't have permission to create jobs");
      return;
    }

    if (formData.runType === 'schedule' && !hasPermission('query_schedule')) {
      toast.error("You don't have permission to schedule jobs");
      return;
    }

    try {
      const jobData = {
        name: formData.name,
        description: formData.description,
        source_type: formData.sourceType,
        code: formData.code,
        credential_id: formData.credentials || undefined,
        schedule_type: formData.runType,
        frequency: formData.frequency || undefined,
        schedule_time: formData.time || undefined,
        s3_bucket: formData.s3Bucket || undefined,
        folder_path: formData.folderPath || undefined,
        date_subfolders: formData.dateSubfolders
      };

      await createJobMutation.mutateAsync(jobData);
      toast.success("Job created successfully!");
      onOpenChange(false);
      setCurrentStep(0);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error("Failed to create job");
    }
  };

  const updateFormData = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter job name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe what this job does"
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Source Type</Label>
              <Select value={formData.sourceType} onValueChange={(value) => updateFormData("sourceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="redshift">Redshift</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                  <SelectItem value="python">Python Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="code">SQL Query / Python Code</Label>
              <Textarea
                id="code"
                value={formData.code}
                onChange={(e) => updateFormData("code", e.target.value)}
                placeholder="Enter your SQL query or Python script"
                rows={6}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Credentials</Label>
              <Select value={formData.credentials} onValueChange={(value) => updateFormData("credentials", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credentials" />
                </SelectTrigger>
                <SelectContent>
                  {credentials && credentials.length > 0 ? (
                    credentials.map((credential) => (
                      <SelectItem key={credential.id} value={credential.id}>
                        {credential.name} ({credential.type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No credentials available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Run Type</Label>
              <RadioGroup value={formData.runType} onValueChange={(value) => updateFormData("runType", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now">Run Now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule">Schedule</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.runType === "schedule" && (
              <>
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => updateFormData("frequency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateFormData("time", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="s3Bucket">S3 Bucket Name</Label>
              <Input
                id="s3Bucket"
                value={formData.s3Bucket}
                onChange={(e) => updateFormData("s3Bucket", e.target.value)}
                placeholder="my-data-bucket"
              />
            </div>
            <div>
              <Label htmlFor="folderPath">Folder Path</Label>
              <Input
                id="folderPath"
                value={formData.folderPath}
                onChange={(e) => updateFormData("folderPath", e.target.value)}
                placeholder="exports/customer-data"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dateSubfolders"
                checked={formData.dateSubfolders}
                onCheckedChange={(checked) => updateFormData("dateSubfolders", checked)}
              />
              <Label htmlFor="dateSubfolders">
                Create date-wise subfolders (YYYY/MM/DD)
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                className="bg-gradient-primary"
                disabled={createJobMutation.isPending}
              >
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && formData.sourceType !== 'python' && !formData.credentials}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}