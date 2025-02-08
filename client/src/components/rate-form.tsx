import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

const rateSchema = z.object({
  rate: z.number().min(1, "Rate must be greater than 0"),
});

type RateFormValues = z.infer<typeof rateSchema>;

export default function RateForm() {
  const { toast } = useToast();
  const { t } = useLanguage();

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
    toast({
      title: t('common', 'success'),
      description: "Rate updated successfully",
    });
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
          <Button type="submit">{t('home', 'setRate')}</Button>
        </form>
      </Form>
    </div>
  );
}