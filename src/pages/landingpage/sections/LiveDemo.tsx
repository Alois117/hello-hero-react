import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiTrendingUp, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useState, useEffect } from "react";

type Insight = {
  text: string;
  color: string;
  time: string;
};

type DataSet = {
  activeHosts: number;
  alerts: number;
  systemHealth: number;
  avgResponse: number;
  cpuUsage: number;
  predictions: number;
  insights: Insight[];
};

const LiveDemo = () => {
  const baseDataSets: DataSet[] = [
    {
      activeHosts: 127,
      alerts: 3,
      systemHealth: 98.7,
      avgResponse: 142,
      cpuUsage: 34,
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
      systemHealth: 97.5,
      avgResponse: 158,
      cpuUsage: 28,
      predictions: 15,
      insights: [
        { text: "Anomaly detected in network throughput on edge-04", color: "FAA41E", time: "4s ago" },
        { text: "Resource optimization applied to frontend pods", color: "39ff14", time: "11s ago" },
        { text: "Latency spike mitigated in payment service", color: "43BFC7", time: "19s ago" },
      ],
    },
    {
      activeHosts: 129,
      alerts: 5,
      systemHealth: 96.9,
      avgResponse: 165,
      cpuUsage: 42,
      predictions: 18,
      insights: [
        { text: "High memory pressure detected on cache-redis-01", color: "FAA41E", time: "1s ago" },
        { text: "Auto-remediation completed for failed cronjob", color: "39ff14", time: "6s ago" },
        { text: "Unusual outbound traffic pattern flagged", color: "43BFC7", time: "13s ago" },
      ],
    },
    {
      activeHosts: 135,
      alerts: 1,
      systemHealth: 99.1,
      avgResponse: 131,
      cpuUsage: 31,
      predictions: 9,
      insights: [
        { text: "Predictive scaling triggered for API cluster", color: "39ff14", time: "3s ago" },
        { text: "Configuration drift corrected in prod namespace", color: "43BFC7", time: "12s ago" },
        { text: "Healthy state restored across all nodes", color: "39ff14", time: "20s ago" },
      ],
    },
    {
      activeHosts: 124,
      alerts: 4,
      systemHealth: 95.8,
      avgResponse: 172,
      cpuUsage: 47,
      predictions: 21,
      insights: [
        { text: "CPU contention warning on worker-15", color: "FAA41E", time: "5s ago" },
        { text: "Database query optimization recommended", color: "43BFC7", time: "9s ago" },
        { text: "Traffic surge handled — no degradation", color: "39ff14", time: "16s ago" },
      ],
    },
    {
      activeHosts: 141,
      alerts: 3,
      systemHealth: 98.2,
      avgResponse: 139,
      cpuUsage: 36,
      predictions: 14,
      insights: [
        { text: "Potential SSL certificate expiry in 18 days", color: "FAA41E", time: "2s ago" },
        { text: "Load balancer rebalanced across 4 zones", color: "39ff14", time: "10s ago" },
        { text: "Anomaly score normalized after patching", color: "43BFC7", time: "17s ago" },
      ],
    },
    {
      activeHosts: 128,
      alerts: 6,
      systemHealth: 96.4,
      avgResponse: 161,
      cpuUsage: 44,
      predictions: 19,
      insights: [
        { text: "Elevated error rate in checkout service", color: "FAA41E", time: "1s ago" },
        { text: "Circuit breaker opened then auto-recovered", color: "43BFC7", time: "7s ago" },
        { text: "Memory leak suspected in background-worker", color: "FAA41E", time: "14s ago" },
      ],
    },
    {
      activeHosts: 133,
      alerts: 2,
      systemHealth: 99.4,
      avgResponse: 128,
      cpuUsage: 29,
      predictions: 11,
      insights: [
        { text: "Idle resources reclaimed from staging env", color: "39ff14", time: "4s ago" },
        { text: "Predictive alert suppressed — false positive", color: "43BFC7", time: "11s ago" },
        { text: "All services reporting optimal health", color: "39ff14", time: "18s ago" },
      ],
    },
    {
      activeHosts: 130,
      alerts: 4,
      systemHealth: 97.9,
      avgResponse: 148,
      cpuUsage: 39,
      predictions: 16,
      insights: [
        { text: "Disk I/O bottleneck identified on log-node-08", color: "FAA41E", time: "3s ago" },
        { text: "Auto-healing completed for pod crash-loop", color: "39ff14", time: "8s ago" },
        { text: "Network jitter reduced after rerouting", color: "43BFC7", time: "15s ago" },
      ],
    },
    {
      activeHosts: 137,
      alerts: 3,
      systemHealth: 98.5,
      avgResponse: 145,
      cpuUsage: 33,
      predictions: 13,
      insights: [
        { text: "Unusual spike in 5xx errors — mitigated", color: "FAA41E", time: "6s ago" },
        { text: "Capacity forecast updated: +18% next week", color: "43BFC7", time: "12s ago" },
        { text: "Cluster efficiency improved by 7%", color: "39ff14", time: "19s ago" },
      ],
    },
  ];

  const randomizeData = (base: DataSet): DataSet => ({
    activeHosts: Math.max(100, base.activeHosts + Math.floor(Math.random() * 7) - 3),
    alerts: Math.max(0, base.alerts + Math.floor(Math.random() * 5) - 2),
    systemHealth: Number(
      Math.min(99.9, Math.max(95, base.systemHealth + (Math.random() * 6 - 3))).toFixed(1)
    ),
    avgResponse: Math.round(base.avgResponse + Math.random() * 16 - 8),
    cpuUsage: Math.round(base.cpuUsage + Math.random() * 6 - 3),
    predictions: Math.max(5, base.predictions + Math.floor(Math.random() * 5) - 2),
    insights: base.insights.map((item) => ({ ...item })),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayData, setDisplayData] = useState<DataSet>(randomizeData(baseDataSets[0]));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % baseDataSets.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayData(randomizeData(baseDataSets[currentIndex]));
  }, [currentIndex]);

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#43BFC7]/30"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-3xl border border-[#43BFC7]/30 relative overflow-hidden"
        >
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
                  <p className="text-3xl font-bold text-[#39ff14]">{displayData.activeHosts}</p>
                  <p className="text-sm text-muted-foreground">Active Hosts</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#FAA41E]">{displayData.alerts}</p>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-background/50 rounded-2xl border border-[#39ff14]/30">
                <FiCheckCircle className="w-8 h-8 text-[#39ff14] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">System Health</p>
                <p className="text-3xl font-bold text-[#39ff14]">{displayData.systemHealth}%</p>
              </div>
              <div className="p-6 bg-background/50 rounded-2xl border border-[#43BFC7]/30">
                <FiActivity className="w-8 h-8 text-[#43BFC7] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                <p className="text-3xl font-bold text-[#43BFC7]">{displayData.avgResponse}ms</p>
              </div>
              <div className="p-6 bg-background/50 rounded-2xl border border-[#FAA41E]/30">
                <FiTrendingUp className="w-8 h-8 text-[#FAA41E] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">CPU Usage</p>
                <p className="text-3xl font-bold text-[#FAA41E]">{displayData.cpuUsage}%</p>
              </div>
              <div className="p-6 bg-background/50 rounded-2xl border border-[#43BFC7]/30">
                <FiAlertCircle className="w-8 h-8 text-[#43BFC7] mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Predictions</p>
                <p className="text-3xl font-bold text-[#43BFC7]">{displayData.predictions}</p>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Recent AI Insights
              </h4>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 1, filter: "brightness(1)" }}
                  animate={{ opacity: 1, filter: "brightness(1)" }}
                  exit={{ opacity: 0.65, filter: "brightness(0.98)" }} // ✨ subtle dim, never gone
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                  className="space-y-3"
                >
                  {displayData.insights.map((insight, i) => (
                    <motion.div
                      key={`${currentIndex}-${i}`}
                      initial={{ opacity: 0.85, filter: "brightness(0.99)" }}
                      animate={{ opacity: 1, filter: "brightness(1)" }}
                      exit={{ opacity: 0.65, filter: "brightness(0.98)" }}
                      transition={{
                        duration: 0.45,
                        delay: i * 0.08,
                        ease: "easeInOut",
                      }}
                      className={`p-4 bg-background/30 rounded-xl border border-[#${insight.color}]/30 flex justify-between items-center`}
                    >
                      <p className="text-foreground">{insight.text}</p>
                      <span className="text-sm text-muted-foreground">
                        {insight.time}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemo;
