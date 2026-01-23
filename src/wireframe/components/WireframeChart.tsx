import { cn } from "@/lib/utils";
import { WireframeBox } from "./WireframeBox";

interface WireframeChartProps {
  label?: string;
  type?: "bar" | "line" | "pie" | "area";
  className?: string;
}

export const WireframeChart = ({ label, type = "bar", className }: WireframeChartProps) => {
  return (
    <WireframeBox label={label} className={cn("min-h-[200px] flex items-center justify-center", className)}>
      {type === "bar" && (
        <div className="flex items-end gap-2 h-32">
          {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
            <div
              key={i}
              className="w-8 bg-primary/20 border-2 border-dashed border-primary/40 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )}
      {type === "line" && (
        <svg className="w-full h-32" viewBox="0 0 200 80">
          <path
            d="M 10 60 L 40 40 L 70 50 L 100 20 L 130 35 L 160 25 L 190 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4"
            className="text-primary/40"
          />
        </svg>
      )}
      {type === "pie" && (
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-mono text-muted-foreground">[PIE]</span>
        </div>
      )}
      {type === "area" && (
        <svg className="w-full h-32" viewBox="0 0 200 80">
          <path
            d="M 10 60 L 40 40 L 70 50 L 100 20 L 130 35 L 160 25 L 190 40 L 190 80 L 10 80 Z"
            fill="currentColor"
            className="text-primary/10"
          />
          <path
            d="M 10 60 L 40 40 L 70 50 L 100 20 L 130 35 L 160 25 L 190 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4"
            className="text-primary/40"
          />
        </svg>
      )}
    </WireframeBox>
  );
};
