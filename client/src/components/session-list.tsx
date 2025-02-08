import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { type Session } from "@shared/schema";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SessionListProps {
  sessions: Session[];
}

export default function SessionList({ sessions }: SessionListProps) {
  const deleteSession = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const calculateDuration = (session: Session) => {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const calculateEarnings = (session: Session) => {
    const hours = parseFloat(calculateDuration(session));
    return (hours * session.rate).toFixed(2);
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
                  Rate: ${session.rate}/hr
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.startTime), "MMM d, h:mm a")} -{" "}
                  {session.endTime
                    ? format(new Date(session.endTime), "h:mm a")
                    : "Ongoing"}
                </p>
                <p className="text-sm font-medium">
                  ${calculateEarnings(session)} ({calculateDuration(session)} hrs)
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
