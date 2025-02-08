import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PredefinedJob } from "@shared/schema";

export default function JobManager() {
  const [newJobName, setNewJobName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery<PredefinedJob[]>({
    queryKey: ["/api/predefined-jobs"],
  });

  const createJob = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/predefined-jobs", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predefined-jobs"] });
      setNewJobName("");
      toast({
        title: "Success",
        description: "Job added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add job",
        variant: "destructive",
      });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/predefined-jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predefined-jobs"] });
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newJobName.trim()) {
      createJob.mutate(newJobName.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Job Names</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            value={newJobName}
            onChange={(e) => setNewJobName(e.target.value)}
            placeholder="Enter new job name"
            className="flex-1"
          />
          <Button type="submit" disabled={!newJobName.trim()}>
            Add Job
          </Button>
        </form>

        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-background"
            >
              <span>{job.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteJob.mutate(job.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
