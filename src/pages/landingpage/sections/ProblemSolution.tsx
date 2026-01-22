import { motion } from "framer-motion";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const ProblemSolution = () => {
  const alerts = [
  "CRITICAL: Disk almost full (95%) on database server db-prod-01 – clean up now!",
  "WARNING: CPU spiking high on web server web-03 – check running processes",
  "ALERT: Memory leak found in app on node-07 – restart might be needed",
  "CRITICAL: Network connection lost to cluster-05 – urgent check required",
  "WARNING: SSL certificate for site expires in 2 days – renew soon",
  "ALERT: Database connections maxed out – add more or optimize queries",
  "CRITICAL: Redis memory limit hit – scale up or clear cache",
  "WARNING: Kafka message backlog growing on partition-12 – investigate delay"
];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-center mb-20"
        >
          <span className="text-foreground">You're </span>
          <span className="text-[#FAA41E]">Drowning in Alerts</span>
          <span className="text-foreground">. We Fix That.</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Chaotic alerts side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 rounded-3xl border border-[#FAA41E]/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#FAA41E]/5 animate-pulse" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4 text-[#FAA41E]">
                <FiAlertTriangle className="w-6 h-6" />
                <span className="font-bold">System Health Alerts</span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-hidden">
                {alerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-background/50 rounded-lg border border-[#FAA41E]/20 text-sm font-mono"
                  >
                    {alert}
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-3xl font-bold text-[#FAA41E]">Many</span>
                <p className="text-muted-foreground">alerts/day</p>
              </div>
            </div>
          </motion.div>

          {/* Glitch tear effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl font-bold text-[#43BFC7] opacity-50"
              >
                ⚡
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] blur-3xl opacity-30" />
            </div>
          </motion.div>

          {/* Peaceful Avis side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 rounded-3xl border border-[#39ff14]/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#39ff14]/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4 text-[#39ff14]">
                <FiCheckCircle className="w-6 h-6" />
                <span className="font-bold">Avis AI</span>
              </div>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-background/50 rounded-lg border border-[#39ff14]/30"
                >
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-[#39ff14] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Root Cause Identified</p>
                      <p className="text-sm text-muted-foreground">Disk cleanup needed on db-prod-01</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 bg-background/50 rounded-lg border border-[#43BFC7]/30"
                >
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-[#43BFC7] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Auto-Remediation Applied</p>
                      <p className="text-sm text-muted-foreground">Scaled cluster-05 → Issue resolved</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-6 text-center">
                <span className="text-3xl font-bold text-[#39ff14]">8</span>
                <p className="text-muted-foreground">insights/day</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-3xl font-bold">
            <span className="text-[#FAA41E]">From Many alerts/day</span>
            <span className="text-foreground"> → </span>
            <span className="text-[#39ff14]">Reduced noise from alerts</span>
          </p>
          <p className="text-xl text-muted-foreground mt-2">Reduced alert fatigue</p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;