import { motion } from "framer-motion";
import { FiActivity, FiTrendingUp, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useState, useEffect } from "react";

const LiveDemo = () => {
  const dataSets = [
    {
      activeHosts: 127,
      alerts: 3,
      systemHealth: "98.7%",
      avgResponse: "142ms",
      cpuUsage: "34%",
      predictions: 12,
      insights: [
        { text: "Predicted disk failure on db-prod-03 in 11 days", color: "FAA41E", time: "2s ago" },
        { text: "Auto-scaled cluster-07 to handle traffic spike", color: "39ff14", time: "8s ago" },
        { text: "Root cause identified: Memory leak in app-node-12", color: "43BFC7", time: "15s ago" },
      ],
    },
    {
      activeHosts: 132,
      alerts: 2,
      systemHealth: "97.5%",
      avgResponse: "158ms",
      cpuUsage: "28%",
      predictions: 15,
      insights: [
        { text: "Anomaly detected in network traffic patterns", color: "FAA41E", time: "3s ago" },
        { text: "Optimized resource allocation for web-server-05", color: "39ff14", time: "10s ago" },
        { text: "Potential bottleneck in API endpoint resolved", color: "43BFC7", time: "18s ago" },
      ],
    },
    {
      activeHosts: 129,
      alerts: 4,
      systemHealth: "99.2%",
      avgResponse: "135ms",
      cpuUsage: "41%",
      predictions: 10,
      insights: [
        { text: "High load warning on cache-layer-02", color: "FAA41E", time: "1s ago" },
        { text: "Successfully mitigated DDoS attempt", color: "39ff14", time: "7s ago" },
        { text: "Firmware update recommended for router-14", color: "43BFC7", time: "14s ago" },
      ],
    },
    {
      activeHosts: 135,
      alerts: 1,
      systemHealth: "96.8%",
      avgResponse: "149ms",
      cpuUsage: "37%",
      predictions: 18,
      insights: [
        { text: "Storage capacity nearing limit on backup-09", color: "FAA41E", time: "4s ago" },
        { text: "Performance boost applied to database queries", color: "39ff14", time: "12s ago" },
        { text: "Configuration drift detected and corrected", color: "43BFC7", time: "20s ago" },
      ],
    },
    {
      activeHosts: 130,
      alerts: 5,
      systemHealth: "98.3%",
      avgResponse: "140ms",
      cpuUsage: "32%",
      predictions: 14,
      insights: [
        { text: "Unusual login activity from unknown IP", color: "FAA41E", time: "5s ago" },
        { text: "Cluster-03 balanced for optimal throughput", color: "39ff14", time: "9s ago" },
        { text: "Predictive maintenance scheduled for server-08", color: "43BFC7", time: "16s ago" },
      ],
    },
  ];

  const [currentData, setCurrentData] = useState(dataSets[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData((prev) => {
        const currentIndex = dataSets.indexOf(prev);
        const nextIndex = (currentIndex + 1) % dataSets.length;
        return dataSets[nextIndex];
      });
    }, 7000); // Cycle every 5 seconds for a live feel
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#43BFC7]/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
              See Sentramind Avis in Action
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">No Signup Needed</p>
        </motion.div>
        {/* Demo dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-3xl border border-[#43BFC7]/30 relative overflow-hidden"
        >
          {/* Neon glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#43BFC7]/10 via-transparent to-[#FAA41E]/10" />
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border/50">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Live Dashboard</h3>
                <p className="text-muted-foreground">Real-time monitoring</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#39ff14]">{currentData.activeHosts}</p>
                  <p className="text-sm text-muted-foreground">Active Hosts</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#FAA41E]">{currentData.alerts}</p>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </div>
            {/* Grid of stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 bg-background/50 rounded-2xl border border-[#39ff14]/30"
              >
                <FiCheckCircle className="w-8 h-8 text-[#39ff14] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">System Health</p>
                <p className="text-3xl font-bold text-[#39ff14]">{currentData.systemHealth}</p>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="p-6 bg-background/50 rounded-2xl border border-[#43BFC7]/30"
              >
                <FiActivity className="w-8 h-8 text-[#43BFC7] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                <p className="text-3xl font-bold text-[#43BFC7]">{currentData.avgResponse}</p>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="p-6 bg-background/50 rounded-2xl border border-[#FAA41E]/30"
              >
                <FiTrendingUp className="w-8 h-8 text-[#FAA41E] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">CPU Usage</p>
                <p className="text-3xl font-bold text-[#FAA41E]">{currentData.cpuUsage}</p>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                className="p-6 bg-background/50 rounded-2xl border border-[#43BFC7]/30"
              >
                <FiAlertCircle className="w-8 h-8 text-[#43BFC7] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Predictions</p>
                <p className="text-3xl font-bold text-[#43BFC7]">{currentData.predictions}</p>
              </motion.div>
            </div>
            {/* Live activity feed */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground mb-4">Recent AI Insights</h4>
             
              {currentData.insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className={`p-4 bg-background/30 rounded-xl border border-[#${insight.color}]/30 flex justify-between items-center`}
                >
                  <p className="text-foreground">{insight.text}</p>
                  <span className="text-sm text-muted-foreground">{insight.time}</span>
                </motion.div>
              ))}
            </div>
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center p-4 bg-[#39ff14]/10 rounded-xl border border-[#39ff14]/30"
            >
              <p className="text-[#39ff14] font-semibold">
                Avis enables quicker identification of issues and also Reduces noise / alert fatigue.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemo;