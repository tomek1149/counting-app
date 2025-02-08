import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const workingHoursSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
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

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
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

  const onSubmit = (data: WorkingHoursFormValues) => {
    localStorage.setItem("workingHoursStart", data.startTime);
    localStorage.setItem("workingHoursEnd", data.endTime);
    toast({
      title: "Success",
      description: "Working hours updated",
    });
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit">Set Working Hours</Button>
        </form>
      </Form>
    </div>
  );
}
