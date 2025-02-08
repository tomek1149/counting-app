import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RateForm from "@/components/rate-form";
import Timer from "@/components/timer";
import SessionList from "@/components/session-list";
import Summary from "@/components/summary";
import WorkingHoursForm from "@/components/working-hours-form";
import HistoricalTracking from "@/components/historical-tracking";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Time Tracking & Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RateForm />
            <Separator />
            <WorkingHoursForm />
            <Separator />
            <Timer />
          </CardContent>
        </Card>

        <HistoricalTracking />

        <div className="grid gap-8 md:grid-cols-2">
          <SessionList sessions={sessions} />
          <Summary sessions={sessions} />
        </div>
      </div>
    </div>
  );
}