import { motion } from "framer-motion";
import { FiCpu, FiZap, FiShield, FiTarget, FiUsers, FiPackage, FiWifi, FiMoreHorizontal } from "react-icons/fi";
import { useRef } from "react";

const features = [
  {
    icon: FiCpu,
    title: "AI-Powered Cause Detection",
    subtitle: "Faster Insights & Fixes",
    description: "Let AI find the root cause in seconds instead of hours of searching",
    gradient: "from-[#43BFC7] to-[#FAA41E]"
  },
  {
    icon: FiZap,
    title: "Near Real-Time Alerts & Events",
    subtitle: "Fast, Reliable Updates",
    description: "Alerts are detected and delivered within minutes, giving you timely visibility without manual checks",
    gradient: "from-[#FAA41E] to-[#43BFC7]"
  },
  {
    icon: FiTarget,
    title: "Intelligent Alert Prioritization",
    subtitle: "Smart Filtering",
    description: "AI groups related alerts, reduces noise, and helps focus on what matters most",
    gradient: "from-[#43BFC7] to-[#FAA41E]"
  },
  {
    icon: FiShield,
    title: "Guided Remediation",
    subtitle: "Action Recommendations",
    description: "Clear, step-by-step suggestions to resolve common issues quickly and safely",
    gradient: "from-[#FAA41E] to-[#43BFC7]"
  },
  {
    icon: FiUsers,
    title: "Enterprise-Grade Access Control",
    subtitle: "RBAC",
    description: "Granular role-based permissions, Multi-team & multi-tenant organization",
    gradient: "from-[#43BFC7] to-[#FAA41E]"
  }
];

const FeaturesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-center mb-4"
        >
          <span className="bg-gradient-to-r from-[#43BFC7] via-[#FAA41E] to-[#43BFC7] bg-clip-text text-transparent">
            Enterprise-Grade Features
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-xl text-muted-foreground"
        >
          Everything you need to monitor, predict, and prevent outages
        </motion.p>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 px-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="snap-center flex-shrink-0 w-[350px] group"
            >
              <div className="glass-card p-8 rounded-3xl border border-border/50 hover:border-[#43BFC7]/50 transition-all h-full relative overflow-hidden group-hover:translate-y-[-10px] duration-300">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-[#04143C]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-[#04143C] text-sm font-semibold mb-4`}>
                    {feature.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Neon border animation */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {features.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-border hover:bg-[#43BFC7] transition-colors cursor-pointer"
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturesCarousel;