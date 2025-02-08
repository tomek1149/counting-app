import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import JobSelector from "./job-selector";

const workingHoursSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  jobName: z.string().default(""),
}).refine((data) => {
  const start = new Date(`1970-01-01T${data.startTime}`);
  const end = new Date(`1970-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

export default function WorkingHoursForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
      jobName: "",
    },
  });

  // Load saved working hours when component mounts
  useEffect(() => {
    const savedStartTime = localStorage.getItem("workingHoursStart");
    const savedEndTime = localStorage.getItem("workingHoursEnd");
    if (savedStartTime && savedEndTime) {
      form.setValue("startTime", savedStartTime);
      form.setValue("endTime", savedEndTime);
    }
  }, [form]);

  const createWorkingHoursSession = useMutation({
    mutationFn: async (data: { startTime: Date; endTime: Date; rate: number; jobName: string }) => {
      const res = await apiRequest("POST", "/api/sessions", {
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        isActive: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Success",
        description: "Created working hours session",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create working hours session",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkingHoursFormValues) => {
    localStorage.setItem("workingHoursStart", data.startTime);
    localStorage.setItem("workingHoursEnd", data.endTime);
    toast({
      title: "Success",
      description: "Working hours updated",
    });
  };

  const startWorkingHoursTracking = () => {
    const rate = parseInt(localStorage.getItem("hourlyRate") || "0");
    if (rate <= 0) {
      toast({
        title: "Error",
        description: "Please set an hourly rate first",
        variant: "destructive",
      });
      return;
    }

    const startTimeStr = form.getValues("startTime");
    const endTimeStr = form.getValues("endTime");
    const jobName = form.getValues("jobName");

    if (!jobName) {
      toast({
        title: "Error",
        description: "Please select a job first",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    const startTime = new Date(today);
    const endTime = new Date(today);

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

    startTime.setHours(startHours, startMinutes, 0, 0);
    endTime.setHours(endHours, endMinutes, 0, 0);

    createWorkingHoursSession.mutate({ startTime, endTime, rate, jobName });
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="jobName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job</FormLabel>
                <FormControl>
                  <JobSelector value={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="time"
                      {...field}
                    />
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
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit">Save Hours</Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={startWorkingHoursTracking}
            >
              Create Today's Session
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}