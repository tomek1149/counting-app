import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/language-context";
import type { Session } from "@shared/schema";

const daysOfWeek = [
  { label: "Monday", value: "MON" },
  { label: "Tuesday", value: "TUE" },
  { label: "Wednesday", value: "WED" },
  { label: "Thursday", value: "THU" },
  { label: "Friday", value: "FRI" },
  { label: "Saturday", value: "SAT" },
  { label: "Sunday", value: "SUN" },
] as const;

const scheduleSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  days: z.array(z.string()).min(1, "Select at least one day"),
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

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
      days: [],
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      const rate = parseInt(localStorage.getItem("hourlyRate") || "0");
      if (rate <= 0) {
        throw new Error("Please set an hourly rate first");
      }

      // Create a session for each selected day
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); // Start of today

      // Find next occurrence of each selected day
      for (const dayCode of data.days) {
        const dayIndex = daysOfWeek.findIndex(d => d.value === dayCode);
        const currentDay = today.getDay();
        let daysUntilNext = dayIndex + 1 - currentDay;
        if (daysUntilNext <= 0) daysUntilNext += 7;

        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + daysUntilNext);

        const [startHours, startMinutes] = data.startTime.split(":").map(Number);
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);

        const sessionStartTime = new Date(sessionDate);
        const sessionEndTime = new Date(sessionDate);

        sessionStartTime.setHours(startHours, startMinutes, 0, 0);
        sessionEndTime.setHours(endHours, endMinutes, 0, 0);

        await apiRequest("POST", "/api/sessions", {
          rate,
          startTime: sessionStartTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
          isActive: false,
          isScheduled: true,
          repeatDays: [dayCode],
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
    onError: (error) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
            name="days"
            render={() => (
              <FormItem>
                <FormLabel>Repeat on</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem
                          key={day.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const value = field.value || [];
                                return checked
                                  ? field.onChange([...value, day.value])
                                  : field.onChange(
                                      value.filter((val) => val !== day.value)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
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