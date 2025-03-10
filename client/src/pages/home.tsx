import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RateForm from "@/components/rate-form";
import Timer from "@/components/timer";
import SessionList from "@/components/session-list";
import Summary from "@/components/summary";
import WorkingHoursForm from "@/components/working-hours-form";
import HistoricalTracking from "@/components/historical-tracking";
import ScheduleForm from "@/components/schedule-form";
import JobManager from "@/components/job-manager";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import LanguageSelector from "@/components/language-selector";

export default function Home() {
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('home', 'title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <JobManager />
            <Separator />
            <RateForm />
            <Separator />
            <WorkingHoursForm />
            <Separator />
            <Timer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Future Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleForm />
          </CardContent>
        </Card>

        <HistoricalTracking />

        <div className="grid gap-8 md:grid-cols-2 relative">
          <SessionList sessions={sessions} />
          <div className="relative z-0">
            <Summary sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  );
}