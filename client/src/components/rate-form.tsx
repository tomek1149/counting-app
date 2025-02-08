import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const rateSchema = z.object({
  rate: z.number().min(1, "Rate must be greater than 0"),
});

type RateFormValues = z.infer<typeof rateSchema>;

export default function RateForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      rate: 0,
    },
  });

  // Load saved rate when component mounts
  useEffect(() => {
    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) {
      form.setValue("rate", parseInt(savedRate));
    }
  }, [form]);

  const onSubmit = (data: RateFormValues) => {
    localStorage.setItem("hourlyRate", data.rate.toString());
  };

  const createTestSessions = async () => {
    const rates = [75, 100, 150]; // Different hourly rates
    const now = new Date();

    try {
      // Create sessions with different states
      for (let i = 0; i < rates.length; i++) {
        const rate = rates[i];
        const startTime = new Date(now.getTime() - (i + 1) * 15 * 60000); // Each 15 minutes before

        // Only the last session will be active
        const isActive = i === rates.length - 1;
        const endTime = isActive ? null : new Date(startTime.getTime() + 10 * 60000); // 10 minutes duration

        await apiRequest("POST", "/api/sessions", {
          rate,
          startTime: startTime.toISOString(),
          endTime: endTime?.toISOString() || null,
          isActive,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });

      toast({
        title: "Success",
        description: "Created test sessions with different rates",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test sessions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit">Set Rate</Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={createTestSessions}
            >
              Create Test Sessions
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}