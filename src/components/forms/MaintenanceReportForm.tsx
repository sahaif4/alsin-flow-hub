import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tool } from "@/types/tool";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface MaintenanceReportFormProps {
  tool: Tool;
  onSuccess?: () => void;
}

export const MaintenanceReportForm: React.FC<MaintenanceReportFormProps> = ({ tool, onSuccess }) => {
  const [description, setDescription] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
        toast({ title: "Error", description: "Please provide a description of the issue.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      await api.post("/maintenance/report", {
        tool_id: tool.id,
        description: description,
      });
      toast({
        title: "Success!",
        description: "Your maintenance report has been submitted.",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <h3 className="font-semibold">Report an issue with: {tool.name}</h3>
        <Label htmlFor="description" className="mt-2">Description</Label>
        <Textarea
          id="description"
          placeholder="Please describe the issue in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={5}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Report"}
      </Button>
    </div>
  );
};
