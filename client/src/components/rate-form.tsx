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
      for (const rate of rates) {
        // Create sessions starting from different times
        const startTime = new Date(now.getTime() - Math.random() * 3600000); // Random start within last hour

        await apiRequest("POST", "/api/sessions", {
          rate,
          startTime: startTime.toISOString(),
          isActive: true,
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