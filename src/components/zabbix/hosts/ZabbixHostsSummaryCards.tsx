import { motion } from "framer-motion";
import { Server, CheckCircle, XCircle, Link2, FolderOpen } from "lucide-react";
import { ZabbixHostCounts } from "@/hooks/useZabbixHosts";

interface ZabbixHostsSummaryCardsProps {
  counts: ZabbixHostCounts;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Summary cards for Zabbix Hosts
 * Read-only, non-clickable, styled to match AlertSummaryCards
 */
const ZabbixHostsSummaryCards = ({ counts }: ZabbixHostsSummaryCardsProps) => {
  const cards = [
    {
      label: "Total Hosts",
      count: counts.total,
      icon: Server,
      borderColor: "border-primary/30",
      bgGradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Enabled",
      count: counts.enabled,
      icon: CheckCircle,
      borderColor: "border-success/30",
      bgGradient: "from-success/20 to-success/5",
      iconColor: "text-success",
    },
    {
      label: "Disabled",
      count: counts.disabled,
      icon: XCircle,
      borderColor: "border-destructive/30",
      bgGradient: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
    },
    {
      label: "Veeam Linked",
      count: counts.withVeeamLink,
      icon: Link2,
      borderColor: "border-secondary/30",
      bgGradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
    },
    {
      label: "Groups",
      count: counts.uniqueGroups,
      icon: FolderOpen,
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

export default ZabbixHostsSummaryCards;
