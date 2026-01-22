import { motion } from "framer-motion";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { useState, useEffect } from "react";

const FinalCTA = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#43BFC7]/20 via-[#FAA41E]/20 to-[#43BFC7]/20 animate-gradient-shift" />
      
      {/* Neon grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(67, 191, 199, 0.5) 2px, transparent 2px),
              linear-gradient(90deg, rgba(67, 191, 199, 0.5) 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#43BFC7] via-[#FAA41E] to-[#43BFC7] bg-clip-text text-transparent">
              The Last Monitoring Tool
              <br />
              You Will Ever Need
            </span>
          </motion.h2>

          {/* Countdown timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-muted-foreground mb-6 text-lg">
              Limited offer ends in:
            </p>
            <div className="flex justify-center gap-6">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="glass-card p-6 rounded-2xl border border-[#43BFC7]/30 min-w-[100px]"
                >
                  <motion.div
                    key={item.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent mb-2"
                  >
                    {item.value.toString().padStart(2, '0')}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Email signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="glass-card p-3 rounded-3xl border border-[#43BFC7]/30 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-[#04143C]/50 rounded-2xl">
                <FiMail className="w-5 h-5 text-[#43BFC7]" />
                <input
                  type="email"
                  placeholder="Enter your email for magic link signup"
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="px-8 py-4 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-2xl font-bold text-[#04143C] hover:shadow-[0_0_30px_rgba(250,164,30,0.6)] transition-all hover:scale-105 flex items-center justify-center gap-2">
                Get Started Free
                <FiArrowRight />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No password required · Start monitoring in 60 seconds
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 text-muted-foreground text-sm"
          >
            {[
              "✓ No credit card required",
              "✓ 14-day free trial",
              "✓ Cancel anytime",
              "✓ 99.99% uptime SLA"
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${['#43BFC7', '#FAA41E', '#43BFC7'][i % 3]}, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default FinalCTA;