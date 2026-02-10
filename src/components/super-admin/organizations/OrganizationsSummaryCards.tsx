/**
 * Organizations Summary Cards
 * Displays aggregate KPIs for all organizations (read-only, non-interactive)
 * Matches the visual style of Zabbix Alerts summary cards
 */
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { OrganizationCounts } from "@/hooks/super-admin/organizations";
import { AlertItem } from "@/hooks/super-admin//organizations/useOrganizationDetails"; // adjust import path if different

interface OrganizationsSummaryCardsProps {
  counts: OrganizationCounts;
  // ✅ Pass real alerts list (all orgs) here
  alerts?: AlertItem[];
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const isActiveAlert = (a: Partial<AlertItem>) => {
  const status = String(a.status ?? "").toLowerCase();
  // treat acknowledged separately if you want
  return status === "active" || status === "problem" || status === "open";
};

const OrganizationsSummaryCards = ({
  counts,
  alerts = [],
}: OrganizationsSummaryCardsProps) => {
  // ✅ Real total active alerts (computed)
  const activeAlertsCount = alerts.filter(isActiveAlert).length;

  const cards = [
    {
      label: "Total Organizations",
      count: counts.total,
      icon: Building2,
      borderColor: "border-primary/30",
      bgGradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Active",
      count: counts.active,
      icon: CheckCircle,
      borderColor: "border-success/30",
      bgGradient: "from-success/20 to-success/5",
      iconColor: "text-success",
    },
    {
      label: "Inactive",
      count: counts.inactive,
      icon: XCircle,
      borderColor: "border-destructive/30",
      bgGradient: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
    },
    {
      label: "Total Users",
      count: counts.totalUsers,
      icon: Users,
      borderColor: "border-secondary/30",
      bgGradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
    },
    {
      label: "Active Alerts",
      // ✅ Use real computed count (fallback to counts.totalAlerts if alerts not provided)
      count: alerts.length ? activeAlertsCount : counts.totalAlerts,
      icon: AlertTriangle,
      borderColor: "border-warning/30",
      bgGradient: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`cyber-card ${card.borderColor} bg-gradient-to-br ${card.bgGradient}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <motion.p
                key={card.count}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold"
              >
                {card.count}
              </motion.p>
            </div>
            <card.icon className={`w-8 h-8 ${card.iconColor} opacity-50`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrganizationsSummaryCards;
