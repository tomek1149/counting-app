import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronRight, ChevronDown, Pencil, X, Check } from "lucide-react";
import { type Session } from "@shared/schema";
import { format, isSameDay, isSameMonth } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import React, { useState, useEffect } from "react";
import { currencies } from "./currency-selector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import JobSelector from "@/components/job-selector";

interface SessionListProps {
  sessions: Session[];
}

interface GroupedSessions {
  [key: string]: {
    [key: string]: Session[];
  };
}

interface EditingSession {
  jobName: string;
  rate: number;
  startTime: string;
  endTime: string;
}

export default function SessionList({ sessions }: SessionListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<EditingSession | null>(null);
  const { toast } = useToast();

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

  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Session> }) => {
      await apiRequest("PATCH", `/api/sessions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
      setEditingSessionId(null);
      setEditingValues(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    },
  });

  const startEditing = (session: Session) => {
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : startTime;

    setEditingSessionId(session.id);
    setEditingValues({
      jobName: session.jobName,
      rate: session.rate,
      startTime: format(startTime, "HH:mm"),
      endTime: format(endTime, "HH:mm"),
    });
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingValues(null);
  };

  const saveEditing = async (session: Session) => {
    if (!editingValues) return;

    const date = new Date(session.startTime);
    const [startHours, startMinutes] = editingValues.startTime.split(":").map(Number);
    const [endHours, endMinutes] = editingValues.endTime.split(":").map(Number);

    const startTime = new Date(date);
    const endTime = new Date(date);

    startTime.setHours(startHours, startMinutes, 0, 0);
    endTime.setHours(endHours, endMinutes, 0, 0);

    if (endTime <= startTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    await updateSession.mutateAsync({
      id: session.id,
      data: {
        jobName: editingValues.jobName,
        rate: editingValues.rate,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });
  };

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
    const earnings = hours * session.rate;
    return earnings.toFixed(2);
  };

  const calculateDayEarnings = (daySessions: Session[]) => {
    return daySessions.reduce((total, session) => {
      return total + parseFloat(calculateEarnings(session));
    }, 0).toFixed(2);
  };

  const calculateMonthEarnings = (monthSessions: Session[]) => {
    return monthSessions.reduce((total, session) => {
      return total + parseFloat(calculateEarnings(session));
    }, 0).toFixed(2);
  };

  const groupSessions = (sessions: Session[]): GroupedSessions => {
    return sessions.reduce((groups: GroupedSessions, session) => {
      const monthKey = format(new Date(session.startTime), 'MMMM yyyy');
      const dayKey = format(new Date(session.startTime), 'yyyy-MM-dd');

      if (!groups[monthKey]) {
        groups[monthKey] = {};
      }
      if (!groups[monthKey][dayKey]) {
        groups[monthKey][dayKey] = [];
      }
      groups[monthKey][dayKey].push(session);
      return groups;
    }, {});
  };

  const toggleMonth = (month: string) => {
    const newOpenMonths = new Set(openMonths);
    if (newOpenMonths.has(month)) {
      newOpenMonths.delete(month);
    } else {
      newOpenMonths.add(month);
    }
    setOpenMonths(newOpenMonths);
  };

  const toggleDay = (day: string) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(day)) {
      newOpenDays.delete(day);
    } else {
      newOpenDays.add(day);
    }
    setOpenDays(newOpenDays);
  };

  const groupedSessions = groupSessions(sessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedSessions)
            .sort(([monthA], [monthB]) => new Date(monthB).getTime() - new Date(monthA).getTime())
            .map(([month, days]) => {
              const monthSessions = Object.values(days).flat();
              return (
                <Collapsible
                  key={month}
                  open={openMonths.has(month)}
                  onOpenChange={() => toggleMonth(month)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {openMonths.has(month) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{month}</span>
                      </div>
                      <span className="font-medium text-primary">
                        {currencies["PLN"].symbol}{calculateMonthEarnings(monthSessions)}
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-2 ml-6">
                      {Object.entries(days)
                        .sort(([dayA], [dayB]) => new Date(dayB).getTime() - new Date(dayA).getTime())
                        .map(([day, daySessions]) => (
                          <Collapsible
                            key={day}
                            open={openDays.has(day)}
                            onOpenChange={() => toggleDay(day)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  {openDays.has(day) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span>{format(new Date(day), 'MMMM d, yyyy')}</span>
                                </div>
                                <span className="font-medium">
                                  {currencies["PLN"].symbol}{calculateDayEarnings(daySessions)}
                                </span>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-2 mt-2 ml-6">
                                {daySessions.map((session) => (
                                  <div
                                    key={session.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-background/50"
                                  >
                                    {editingSessionId === session.id && editingValues ? (
                                      <div className="flex-1 space-y-4">
                                        <div className="w-full">
                                          <JobSelector 
                                            value={editingValues.jobName} 
                                            onValueChange={(value) => setEditingValues({
                                              ...editingValues,
                                              jobName: value
                                            })} 
                                          />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          <Input
                                            type="number"
                                            value={editingValues.rate}
                                            onChange={(e) => setEditingValues({
                                              ...editingValues,
                                              rate: parseInt(e.target.value)
                                            })}
                                            min="1"
                                            className="w-24"
                                          />
                                          <span className="text-sm text-muted-foreground">PLN/hr</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Input
                                            type="time"
                                            value={editingValues.startTime}
                                            onChange={(e) => setEditingValues({
                                              ...editingValues,
                                              startTime: e.target.value
                                            })}
                                            className="w-32"
                                          />
                                          <span className="text-sm text-muted-foreground">to</span>
                                          <Input
                                            type="time"
                                            value={editingValues.endTime}
                                            onChange={(e) => setEditingValues({
                                              ...editingValues,
                                              endTime: e.target.value
                                            })}
                                            className="w-32"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="font-medium">
                                          {session.jobName || "Untitled Job"}
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
                                    )}
                                    <div className="flex gap-2 ml-4 relative z-50">
                                      {editingSessionId === session.id ? (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => saveEditing(session)}
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={cancelEditing}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => startEditing(session)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      )}
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
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}