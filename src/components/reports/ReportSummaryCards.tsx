import { FileText, Calendar, CalendarDays, CalendarRange, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReportCounts } from "@/hooks/useReports";

interface ReportSummaryCardsProps {
  counts: ReportCounts;
  customCount?: number;
}

const ReportSummaryCards = ({ counts, customCount = 0 }: ReportSummaryCardsProps) => {
  const cards = [
    {
      id: "total",
      label: "Total Reports",
      value: counts.total + customCount,
      icon: FileText,
      bgGradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
      valueColor: "text-blue-400",
    },
    {
      id: "daily",
      label: "Daily Reports",
      value: counts.daily,
      icon: Calendar,
      bgGradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      valueColor: "text-emerald-400",
    },
    {
      id: "weekly",
      label: "Weekly Reports",
      value: counts.weekly,
      icon: CalendarDays,
      bgGradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      valueColor: "text-amber-400",
    },
    {
      id: "monthly",
      label: "Monthly Reports",
      value: counts.monthly,
      icon: CalendarRange,
      bgGradient: "from-purple-500/15 to-purple-500/5",
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/20",
      valueColor: "text-purple-400",
    },
    {
      id: "custom",
      label: "Custom Reports",
      value: customCount,
      icon: Zap,
      bgGradient: "from-cyan-500/15 to-cyan-500/5",
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/20",
      valueColor: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className={`
              p-4 transition-colors duration-200
              border ${card.borderColor}
              bg-gradient-to-br ${card.bgGradient}
              cursor-default select-none
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.valueColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ReportSummaryCards;
