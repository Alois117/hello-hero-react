import { cn } from "@/lib/utils";
import { WireframeBox } from "./WireframeBox";

interface WireframeTableProps {
  label?: string;
  columns: string[];
  rows?: number;
  className?: string;
}

export const WireframeTable = ({ label, columns, rows = 5, className }: WireframeTableProps) => {
  return (
    <WireframeBox label={label} className={cn("p-0 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-dashed border-muted-foreground/30 bg-muted/30">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-dashed border-muted-foreground/20">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t-2 border-dashed border-muted-foreground/30 flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">[Page 1 of N]</span>
        <div className="flex gap-2">
          <span className="text-xs font-mono text-muted-foreground/50">[← Prev]</span>
          <span className="text-xs font-mono text-muted-foreground">[Next →]</span>
        </div>
      </div>
    </WireframeBox>
  );
};
