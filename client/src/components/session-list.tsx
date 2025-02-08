import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type Session } from "@shared/schema";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import React, { useState, useEffect } from "react";
import { currencies } from "./currency-selector";

interface SessionListProps {
  sessions: Session[];
}

export default function SessionList({ sessions }: SessionListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update display frequently for smooth animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const deleteSession = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const formatDuration = (session: Session) => {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : 
               session.isActive ? new Date() : new Date(session.startTime);
    const totalMilliseconds = end.getTime() - start.getTime();

    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMilliseconds % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateEarnings = (session: Session) => {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : 
               session.isActive ? new Date() : new Date(session.startTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // Calculate earnings directly in PLN without currency conversion
    const earnings = hours * session.rate;
    return earnings.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <p className="font-medium">
                  Rate: {currencies["PLN"].symbol}{session.rate}/hr
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.startTime), "MMM d, HH:mm:ss")} -{" "}
                  {session.endTime
                    ? format(new Date(session.endTime), "HH:mm:ss")
                    : "Ongoing"}
                </p>
                <p className="text-sm font-medium">
                  {currencies["PLN"].symbol}{calculateEarnings(session)} ({formatDuration(session)})
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteSession.mutate(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}