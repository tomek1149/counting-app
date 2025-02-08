import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@shared/schema";

function getWorkingPeriodForToday(): { startTime: Date; endTime: Date } | null {
  const startTimeStr = localStorage.getItem("workingHoursStart");
  const endTimeStr = localStorage.getItem("workingHoursEnd");

  if (!startTimeStr || !endTimeStr) return null;

  const today = new Date();
  const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
  const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

  const startTime = new Date(today);
  startTime.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date(today);
  endTime.setHours(endHours, endMinutes, 0, 0);

  return { startTime, endTime };
}

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
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

    const workingPeriod = getWorkingPeriodForToday();
    if (!workingPeriod) {
      toast({
        title: "Error",
        description: "Please set working hours first",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    if (now < workingPeriod.startTime) {
      toast({
        title: "Error",
        description: "Working hours haven't started yet",
        variant: "destructive",
      });
      return;
    }

    if (now > workingPeriod.endTime) {
      toast({
        title: "Error",
        description: "Working hours are over for today",
        variant: "destructive",
      });
      return;
    }

    if (!isRunning) {
      setStartTime(now);
      setIsRunning(true);
      try {
        await createSession.mutateAsync({
          rate,
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
        const endTime = now > workingPeriod.endTime ? workingPeriod.endTime : now;
        try {
          await updateSession.mutateAsync({
            id: activeSession.id,
            endTime: endTime.toISOString(),
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
    <div className="flex items-center justify-center">
      <Button
        size="lg"
        onClick={toggleTimer}
        className={isRunning ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {isRunning ? "Stop" : "Start"} Timer
      </Button>
    </div>
  );
}