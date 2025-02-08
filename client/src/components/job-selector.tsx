import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import type { PredefinedJob } from "@shared/schema";

interface JobSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function JobSelector({ value, onValueChange }: JobSelectorProps) {
  const { data: jobs = [] } = useQuery<PredefinedJob[]>({
    queryKey: ["/api/predefined-jobs"],
  });

  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="space-y-2">
      {jobs.map((job) => (
        <div key={job.id} className="flex items-center space-x-2">
          <RadioGroupItem value={job.name} id={`job-${job.id}`} />
          <Label htmlFor={`job-${job.id}`}>{job.name}</Label>
        </div>
      ))}
      {jobs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No predefined jobs. Add some in the Job Manager.
        </p>
      )}
    </RadioGroup>
  );
}
