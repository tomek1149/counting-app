import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Session } from "@shared/schema";
import React, { useState, useEffect } from "react";
import CurrencySelector, { currencies, type CurrencyCode } from "./currency-selector";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";

interface SummaryProps {
  sessions: Session[];
}

interface GroupedData {
  [month: string]: {
    [jobName: string]: Session[];
  };
}

export default function Summary({ sessions }: SummaryProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currency, setCurrency] = useState<CurrencyCode>("PLN");
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const toggleMonth = (month: string) => {
    const newOpenMonths = new Set(openMonths);
    if (newOpenMonths.has(month)) {
      newOpenMonths.delete(month);
    } else {
      newOpenMonths.add(month);
    }
    setOpenMonths(newOpenMonths);
  };

  const calculateDuration = (sessions: Session[]) => {
    const totalMilliseconds = sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : 
                 session.isActive ? new Date() : start;
      return total + Math.max(0, end.getTime() - start.getTime());
    }, 0);

    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateEarnings = (sessions: Session[]) => {
    const totalPLN = sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : 
                 session.isActive ? new Date() : start;
      const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return total + hours * session.rate;
    }, 0);

    if (currency === "PLN") {
      return totalPLN.toFixed(2);
    }
    const totalUSD = totalPLN / currencies["PLN"].rate;
    const convertedAmount = totalUSD * currencies[currency].rate;
    return convertedAmount.toFixed(2);
  };

  const groupSessionsByMonthAndJob = (sessions: Session[]): GroupedData => {
    return sessions.reduce((grouped: GroupedData, session) => {
      const month = format(new Date(session.startTime), 'MMMM yyyy');
      const jobName = session.jobName || "Untitled Job";

      if (!grouped[month]) {
        grouped[month] = {};
      }
      if (!grouped[month][jobName]) {
        grouped[month][jobName] = [];
      }
      grouped[month][jobName].push(session);
      return grouped;
    }, {});
  };

  const groupedSessions = groupSessionsByMonthAndJob(sessions);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Summary</CardTitle>
        <CurrencySelector value={currency} onValueChange={setCurrency} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedSessions)
            .sort(([monthA], [monthB]) => 
              new Date(monthB).getTime() - new Date(monthA).getTime()
            )
            .map(([month, jobs]) => (
              <Collapsible
                key={month}
                open={openMonths.has(month)}
                onOpenChange={() => toggleMonth(month)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      {openMonths.has(month) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{month}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {currencies[currency].symbol}{calculateEarnings(
                          Object.values(jobs).flat()
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateDuration(Object.values(jobs).flat())}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-6 mt-2 space-y-2">
                    {Object.entries(jobs).map(([jobName, jobSessions]) => (
                      <div 
                        key={jobName}
                        className="flex justify-between items-center p-2 rounded-lg border bg-background/50"
                      >
                        <span className="font-medium">{jobName}</span>
                        <div className="text-right">
                          <div>
                            {currencies[currency].symbol}{calculateEarnings(jobSessions)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {calculateDuration(jobSessions)}
                          </div>
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