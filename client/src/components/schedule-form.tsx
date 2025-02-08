import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/language-context";
import type { Session } from "@shared/schema";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";

const scheduleSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  selectedDates: z.array(z.date()).min(1, "Select at least one date"),
  rate: z.number().min(1, "Rate must be greater than 0"),
}).refine((data) => {
  const start = new Date(`1970-01-01T${data.startTime}`);
  const end = new Date(`1970-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function ScheduleForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Get all sessions to check scheduled dates
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
      selectedDates: [],
      rate: parseInt(localStorage.getItem("hourlyRate") || "0"),
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      // Create a session for each selected date
      for (const date of data.selectedDates) {
        const [startHours, startMinutes] = data.startTime.split(":").map(Number);
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);

        const sessionStartTime = new Date(date);
        const sessionEndTime = new Date(date);

        sessionStartTime.setHours(startHours, startMinutes, 0, 0);
        sessionEndTime.setHours(endHours, endMinutes, 0, 0);

        await apiRequest("POST", "/api/sessions", {
          rate: data.rate,
          startTime: sessionStartTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
          isActive: false,
          isScheduled: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: t('common', 'success'),
        description: "Schedule created successfully",
      });
      form.reset(form.getValues()); // Reset form but keep values
    },
    onError: (error: Error) => {
      toast({
        title: t('common', 'error'),
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    createSchedule.mutate(data);
  };

  // Get all dates that have scheduled sessions
  const scheduledDates = sessions
    .filter((session: Session) => session.isScheduled)
    .map((session: Session) => new Date(session.startTime));

  // Get all dates that have historical sessions
  const historicalDates = sessions
    .filter((session: Session) => !session.isScheduled)
    .map((session: Session) => new Date(session.startTime));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common', 'hourlyRate')} (PLN)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common', 'startTime')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common', 'endTime')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="selectedDates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Dates</FormLabel>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/20">●</Badge>
                      <span className="text-sm text-muted-foreground">Scheduled sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-accent">●</Badge>
                      <span className="text-sm text-muted-foreground">Historical sessions</span>
                    </div>
                  </div>
                  <Calendar
                    mode="multiple"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    modifiers={{
                      scheduled: scheduledDates,
                      historical: historicalDates
                    }}
                    modifiersStyles={{
                      scheduled: {
                        backgroundColor: "hsl(var(--primary) / 0.2)",
                        borderRadius: "4px",
                      },
                      historical: {
                        backgroundColor: "hsl(var(--accent))",
                        borderRadius: "4px",
                        color: "hsl(var(--accent-foreground))"
                      }
                    }}
                    className="rounded-md border"
                    weekStartsOn={1}
                  />
                  {field.value?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected dates: {field.value.map(date =>
                        format(date, 'MMM d, yyyy')
                      ).join(', ')}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createSchedule.isPending}
        >
          Create Schedule
        </Button>
      </form>
    </Form>
  );
}