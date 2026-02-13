import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { SystemLogsSummary } from "@/hooks/super-admin/system-logs/types";

interface Props {
  summary: SystemLogsSummary;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const SystemLogsSummaryCards = ({ summary }: Props) => {
  const cards = [
    {
      label: "Total Events",
      value: summary.totalEvents,
      icon: Shield,
      borderColor: "border-primary/30",
      bgGradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Successful Logins",
      value: summary.successfulLogins,
      icon: CheckCircle,
      borderColor: "border-success/30",
      bgGradient: "from-success/20 to-success/5",
      iconColor: "text-success",
    },
    {
      label: "Failed Attempts",
      value: summary.failedAttempts,
      icon: XCircle,
      borderColor: "border-destructive/30",
      bgGradient: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
    },
    {
      label: "Security Alerts",
      value: summary.securityAlerts,
      icon: AlertTriangle,
      borderColor: "border-warning/30",
      bgGradient: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                key={card.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold"
              >
                {card.value.toLocaleString()}
              </motion.p>
            </div>
            <card.icon className={`w-8 h-8 ${card.iconColor} opacity-50`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SystemLogsSummaryCards;
