import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { type Session } from "@shared/schema";
import { format, isSameDay } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import React, { useState, useEffect } from "react";
import { currencies } from "./currency-selector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SessionListProps {
  sessions: Session[];
}

interface GroupedSessions {
  [date: string]: Session[];
}

export default function SessionList({ sessions }: SessionListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());

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

  const calculateDayEarnings = (daySessions: Session[]) => {
    return daySessions.reduce((total, session) => {
      return total + parseFloat(calculateEarnings(session));
    }, 0).toFixed(2);
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups: GroupedSessions, session) => {
    const date = format(new Date(session.startTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  const toggleDate = (date: string) => {
    const newOpenDates = new Set(openDates);
    if (newOpenDates.has(date)) {
      newOpenDates.delete(date);
    } else {
      newOpenDates.add(date);
    }
    setOpenDates(newOpenDates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedSessions)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dateSessions]) => (
              <Collapsible
                key={date}
                open={openDates.has(date)}
                onOpenChange={() => toggleDate(date)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {openDates.has(date) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {format(new Date(date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <span className="font-medium text-primary">
                      {currencies["PLN"].symbol}{calculateDayEarnings(dateSessions)}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2 ml-6">
                    {dateSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-background/50"
                      >
                        <div>
                          <p className="font-medium">
                            {session.jobName ? session.jobName : "Untitled Job"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Rate: {currencies["PLN"].symbol}{session.rate}/hr
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.startTime), "HH:mm:ss")} -{" "}
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
                </CollapsibleContent>
              </Collapsible>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}