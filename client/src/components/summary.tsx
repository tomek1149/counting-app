import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Session } from "@shared/schema";

interface SummaryProps {
  sessions: Session[];
}

export default function Summary({ sessions }: SummaryProps) {
  const calculateTotalEarnings = () => {
    return sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours * session.rate;
    }, 0).toFixed(2);
  };

  const calculateTotalHours = () => {
    return sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Hours:</span>
            <span className="text-2xl font-bold">{calculateTotalHours()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Earnings:</span>
            <span className="text-2xl font-bold text-primary">
              ${calculateTotalEarnings()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
