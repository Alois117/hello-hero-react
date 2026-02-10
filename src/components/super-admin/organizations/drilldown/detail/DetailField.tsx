/**
 * DetailField - Reusable key-value field for detail panels
 */
import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  mono?: boolean;
}

const DetailField = ({ label, value, className, mono = false }: DetailFieldProps) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {label}
    </p>
    <p className={cn(
      "text-sm font-medium",
      mono && "font-mono text-xs"
    )}>
      {value ?? <span className="text-muted-foreground/50 italic">N/A</span>}
    </p>
  </div>
);

export default DetailField;
