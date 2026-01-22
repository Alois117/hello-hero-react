import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiZap } from "react-icons/fi";

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  const handleClose = () => setIsVisible(false);

  const handleDownload = () => {
    console.log("Downloading Zabbix to Zero Trust guide...");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#04143C]/90 backdrop-blur-sm z-[100]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-6 border-2 border-[#43BFC7]/50 shadow-[0_0_40px_rgba(67,191,199,0.3)] relative"
              style={{ background: "rgba(4, 20, 60, 0.95)" }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#43BFC7]/10 via-[#FAA41E]/10 to-[#43BFC7]/10 animate-gradient-shift rounded-2xl" />

              {/* Neon Grid */}
              <div className="absolute inset-0 opacity-10 rounded-2xl">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(67, 191, 199, 0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(67, 191, 199, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                  }}
                />
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-[#04143C]/50 hover:bg-[#04143C] border border-border/30 hover:border-[#43BFC7]/50 transition-all z-10"
              >
                <FiX className="w-4 h-4 text-foreground" />
              </motion.button>

              <div className="relative z-10 text-sm sm:text-base">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#43BFC7] to-[#FAA41E] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(67,191,199,0.4)]"
                >
                  <FiZap className="w-6 h-6 text-[#04143C]" />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-center mb-3"
                >
                  <span className="bg-gradient-to-r from-[#43BFC7] via-[#FAA41E] to-[#43BFC7] bg-clip-text text-transparent">
                    Wait! Don't Leave Empty-Handed
                  </span>
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-muted-foreground mb-4 text-sm sm:text-base"
                >
                  Get your free guide on transforming your infrastructure with Zero Trust principles and AI-powered monitoring.
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2 mb-6"
                >
                  {[
                    "Real-world case studies",
                    "Step-by-step implementation guide",
                    "Exclusive AI monitoring strategies",
                  ].map((benefit, i) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#39ff14] to-[#43BFC7] flex items-center justify-center flex-shrink-0">
                        <FiDownload className="w-3 h-3 text-[#04143C]" />
                      </div>
                      <span className="text-foreground text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="w-full py-3 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-lg text-[#04143C] font-semibold text-base hover:shadow-[0_0_30px_rgba(250,164,30,0.4)] transition-all flex items-center justify-center gap-2 group"
                >
                  <FiDownload className="w-4 h-4 group-hover:animate-bounce" />
                  Download Free Guide
                </motion.button>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  className="text-center text-xs text-muted-foreground mt-3"
                >
                  No credit card required • Instant access • 100% free
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;