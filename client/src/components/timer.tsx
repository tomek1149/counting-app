import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@shared/schema";
import JobSelector from "./job-selector";

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [jobName, setJobName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async (data: { id: number } & Partial<Session>) => {
      const res = await apiRequest("PATCH", `/api/sessions/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const toggleTimer = async () => {
    const rate = parseInt(localStorage.getItem("hourlyRate") || "0");
    if (rate <= 0) {
      toast({
        title: "Error",
        description: "Please set an hourly rate first",
        variant: "destructive",
      });
      return;
    }

    if (!jobName && !isRunning) {
      toast({
        title: "Error",
        description: "Please select a job first",
        variant: "destructive",
      });
      return;
    }

    if (!isRunning) {
      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
      try {
        await createSession.mutateAsync({
          rate,
          jobName,
          startTime: now.toISOString(),
          isActive: true,
        });
      } catch (error) {
        console.error('Failed to create session:', error);
        setIsRunning(false);
        toast({
          title: "Error",
          description: "Failed to start timer",
          variant: "destructive",
        });
      }
    } else {
      setIsRunning(false);
      const sessions = await queryClient.fetchQuery<Session[]>({ 
        queryKey: ["/api/sessions"] 
      });
      const activeSession = sessions.find((s) => s.isActive);
      if (activeSession) {
        try {
          await updateSession.mutateAsync({
            id: activeSession.id,
            endTime: new Date().toISOString(),
            isActive: false,
          });
        } catch (error) {
          console.error('Failed to update session:', error);
          toast({
            title: "Error",
            description: "Failed to stop timer",
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <JobSelector value={jobName} onValueChange={setJobName} />
        </div>
        <Button
          size="lg"
          onClick={toggleTimer}
          className={isRunning ? "bg-destructive hover:bg-destructive/90" : ""}
          disabled={!jobName && !isRunning}
        >
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? "Stop" : "Start"} Timer
        </Button>
      </div>
    </div>
  );
}