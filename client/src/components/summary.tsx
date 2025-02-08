import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Session } from "@shared/schema";
import { useState, useEffect } from "react";
import CurrencySelector, { currencies, type CurrencyCode } from "./currency-selector";

interface SummaryProps {
  sessions: Session[];
}

export default function Summary({ sessions }: SummaryProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // Update current time every second to recalculate earnings for active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateTotalEarnings = () => {
    const totalUSD = sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : 
                 session.isActive ? currentTime : new Date(session.startTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours * session.rate;
    }, 0);

    // Convert to selected currency
    const convertedAmount = totalUSD * currencies[currency].rate;
    return convertedAmount.toFixed(2);
  };

  const calculateTotalHours = () => {
    return sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : 
                 session.isActive ? currentTime : new Date(session.startTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0).toFixed(2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Summary</CardTitle>
        <CurrencySelector value={currency} onValueChange={setCurrency} />
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
              {currencies[currency].symbol}{calculateTotalEarnings()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}