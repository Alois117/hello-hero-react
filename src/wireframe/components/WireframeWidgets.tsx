import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder, WireframeIcon, WireframeBadge, WireframeDivider } from "./WireframePrimitives";

interface WireframeKPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
}

export const WireframeKPICard = ({ title, value, change, changeType }: WireframeKPICardProps) => (
  <WireframeBox variant="card" className="p-4 space-y-2">
    <div className="flex items-center justify-between">
      <WireframeText variant="caption">{title}</WireframeText>
      <WireframeIcon size="sm" />
    </div>
    <WireframeText variant="h1" className="block">{value}</WireframeText>
    {change && (
      <span className={`text-xs ${changeType === "positive" ? "text-success" : "text-destructive"}`}>
        {change}
      </span>
    )}
  </WireframeBox>
);

interface WireframeChartProps {
  title: string;
  subtitle?: string;
  type?: "bar" | "line" | "pie" | "area";
  height?: string;
}

export const WireframeChart = ({ title, subtitle, type = "bar", height = "h-48" }: WireframeChartProps) => (
  <WireframeBox variant="chart" className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <WireframeText variant="h3">{title}</WireframeText>
        {subtitle && <WireframeText variant="caption" className="block">{subtitle}</WireframeText>}
      </div>
      <WireframeIcon size="sm" />
    </div>
    <div className={`${height} flex items-end justify-around gap-2 px-4`}>
      {type === "bar" &&
        [40, 65, 45, 80, 55, 70, 60].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-primary/40 to-primary/20 rounded-t"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      {type === "line" && (
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <motion.path
            d="M 0 40 Q 15 30, 30 35 T 50 25 T 70 30 T 100 15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </svg>
      )}
      {type === "pie" && (
        <div className="w-32 h-32 rounded-full border-8 border-primary/30 relative mx-auto">
          <div className="absolute inset-2 rounded-full border-8 border-secondary/30 border-t-transparent border-r-transparent" />
        </div>
      )}
      {type === "area" && (
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <motion.path
            d="M 0 50 L 0 40 Q 15 30, 30 35 T 50 25 T 70 30 T 100 15 L 100 50 Z"
            fill="hsl(var(--primary) / 0.2)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
      )}
    </div>
  </WireframeBox>
);

interface WireframeTableProps {
  title: string;
  columns: string[];
  rows?: number;
  onRowClick?: () => void;
}

export const WireframeTable = ({ title, columns, rows = 5, onRowClick }: WireframeTableProps) => (
  <WireframeBox variant="table" className="space-y-0">
    <div className="p-4 border-b border-border/30 flex items-center justify-between">
      <WireframeText variant="h3">{title}</WireframeText>
      <div className="flex items-center gap-2">
        <WireframeBox variant="input" className="w-40 h-8 px-3 flex items-center">
          <WireframeText variant="caption">Search...</WireframeText>
        </WireframeBox>
        <WireframeBox variant="button" className="px-3 py-1">
          <WireframeText variant="caption">Filter</WireframeText>
        </WireframeBox>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30 bg-muted/20">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <WireframeText variant="label">{col}</WireframeText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <motion.tr
              key={rowIndex}
              className="border-b border-border/20 hover:bg-muted/10 cursor-pointer"
              whileHover={{ backgroundColor: "hsl(var(--muted) / 0.2)" }}
              onClick={onRowClick}
            >
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <WireframePlaceholder width={colIndex === 0 ? "w-24" : "w-16"} height="h-3" />
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="p-3 border-t border-border/30 flex items-center justify-between">
      <WireframeText variant="caption">Showing 1-{rows} of 100</WireframeText>
      <div className="flex items-center gap-2">
        <WireframeBox variant="button" className="px-2 py-1">
          <WireframeText variant="caption">Prev</WireframeText>
        </WireframeBox>
        <WireframeBox variant="button" className="px-2 py-1 bg-primary/20">
          <WireframeText variant="caption">1</WireframeText>
        </WireframeBox>
        <WireframeBox variant="button" className="px-2 py-1">
          <WireframeText variant="caption">2</WireframeText>
        </WireframeBox>
        <WireframeBox variant="button" className="px-2 py-1">
          <WireframeText variant="caption">Next</WireframeText>
        </WireframeBox>
      </div>
    </div>
  </WireframeBox>
);

interface WireframeListItemProps {
  title: string;
  subtitle?: string;
  badge?: { text: string; variant: "default" | "success" | "warning" | "error" };
  onClick?: () => void;
}

export const WireframeListItem = ({ title, subtitle, badge, onClick }: WireframeListItemProps) => (
  <motion.div
    className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30 cursor-pointer"
    whileHover={{ x: 4, backgroundColor: "hsl(var(--muted) / 0.2)" }}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <WireframeIcon size="sm" />
      <div>
        <WireframeText variant="body" className="font-medium block">{title}</WireframeText>
        {subtitle && <WireframeText variant="caption" className="block">{subtitle}</WireframeText>}
      </div>
    </div>
    {badge && <WireframeBadge variant={badge.variant}>{badge.text}</WireframeBadge>}
  </motion.div>
);

interface WireframeProgressBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
}

export const WireframeProgressBar = ({ label, value, max = 100, showValue = true }: WireframeProgressBarProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <WireframeText variant="caption">{label}</WireframeText>
      {showValue && <WireframeText variant="caption">{value}/{max}</WireframeText>}
    </div>
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

export const WireframeFormField = ({ label, type = "text" }: { label: string; type?: "text" | "textarea" | "select" }) => (
  <div className="space-y-2">
    <WireframeText variant="label">{label}</WireframeText>
    {type === "textarea" ? (
      <WireframeBox variant="input" className="w-full h-24 p-3" />
    ) : type === "select" ? (
      <WireframeBox variant="input" className="w-full h-10 px-3 flex items-center justify-between">
        <WireframePlaceholder width="w-20" height="h-3" />
        <WireframeIcon size="sm" />
      </WireframeBox>
    ) : (
      <WireframeBox variant="input" className="w-full h-10 px-3 flex items-center">
        <WireframePlaceholder width="w-32" height="h-3" />
      </WireframeBox>
    )}
  </div>
);
