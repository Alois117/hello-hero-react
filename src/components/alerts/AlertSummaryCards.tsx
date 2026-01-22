import { motion } from "framer-motion";
import { Skull, AlertTriangle, Minus, AlertCircle, CheckCircle } from "lucide-react";
import { AlertCounts } from "@/hooks/useAlerts";

interface AlertSummaryCardsProps {
  counts: AlertCounts;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const AlertSummaryCards = ({ counts }: AlertSummaryCardsProps) => {
  const cards = [
    {
      label: "Disaster",
      count: counts.disaster,
      icon: Skull,
      borderColor: "border-purple-500/30",
      bgGradient: "from-purple-600/20 to-purple-600/5",
      iconColor: "text-purple-500",
    },
    {
      label: "High",
      count: counts.high,
      icon: AlertTriangle,
      borderColor: "border-accent/30",
      bgGradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
    },
    {
      label: "Average",
      count: counts.average,
      icon: Minus,
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
    },
    {
      label: "Warning",
      count: counts.warning,
      icon: AlertCircle,
      borderColor: "border-warning/30",
      bgGradient: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
    {
      label: "Acknowledged",
      count: counts.acknowledged,
      icon: CheckCircle,
      borderColor: "border-success/30",
      bgGradient: "from-success/20 to-success/5",
      iconColor: "text-success",
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

export default AlertSummaryCards;
