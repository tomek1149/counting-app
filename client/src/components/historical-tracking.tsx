import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const historicalSessionSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  rate: z.number().min(1, "Rate must be greater than 0"),
}).refine((data) => {
  const start = new Date(`1970-01-01T${data.startTime}`);
  const end = new Date(`1970-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type HistoricalSessionFormValues = z.infer<typeof historicalSessionSchema>;

export default function HistoricalTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const form = useForm<HistoricalSessionFormValues>({
    resolver: zodResolver(historicalSessionSchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      rate: parseInt(localStorage.getItem("hourlyRate") || "0"),
    },
  });

  const createHistoricalSession = useMutation({
    mutationFn: async (data: { startTime: Date; endTime: Date; rate: number }) => {
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
        description: "Added historical session",
      });
      form.reset(form.getValues()); // Maintain the current values but reset validation state
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add historical session",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (formData: HistoricalSessionFormValues) => {
    const startTime = new Date(formData.date);
    const endTime = new Date(formData.date);
    
    const [startHours, startMinutes] = formData.startTime.split(":").map(Number);
    const [endHours, endMinutes] = formData.endTime.split(":").map(Number);
    
    startTime.setHours(startHours, startMinutes, 0, 0);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    createHistoricalSession.mutate({
      startTime,
      endTime,
      rate: formData.rate,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Historical Session</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => date > new Date()}
                        className="rounded-md border"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (PLN)</FormLabel>
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

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Time</FormLabel>
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
                      <FormItem className="flex-1">
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createHistoricalSession.isPending}
            >
              Add Historical Session
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
