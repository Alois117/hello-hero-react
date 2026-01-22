import { motion } from "framer-motion";
import { FiMessageCircle, FiCpu } from "react-icons/fi";
import { useState, useEffect } from "react";

const AIShowcase = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);

  useEffect(() => {
    const conversation = [
      { role: 'user' as const, text: "Why is login server slow?" },
      { role: 'ai' as const, text: "Analyzing 847 data points..." },
      {
        role: 'ai' as const,
        text: "SSD wear 97% on nvme1n1 → predicted failure in 11 days. Auto-ticket created. Recommended action: Replace drive during next maintenance window."
      }
    ];

    let currentIndex = 0;
    let intervalId: NodeJS.Timeout | null = null;

    const startConversation = () => {
      // Clean up any previous interval
      if (intervalId) {
        clearInterval(intervalId);
      }

      currentIndex = 0;
      setMessages([]); // Clear messages first

      intervalId = setInterval(() => {
        if (currentIndex < conversation.length) {
          setMessages(prev => [...prev, conversation[currentIndex]]);
          currentIndex++;
        } else {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          // Reset and restart after a short pause
          setTimeout(() => {
            startConversation();
          }, 3000);
        }
      }, 1500);
    };

    startConversation();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Natural language troubleshooting powered by neural networks
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 3D Neural Network Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square">
              {/* Neural network nodes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 360) / 12;
                    const radius = 40;
                    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                    return (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-[#43BFC7] to-[#FAA41E]"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    );
                  })}

                  {/* Center node */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] flex items-center justify-center"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: 360
                    }}
                    transition={{
                      scale: { duration: 2, repeat: Infinity },
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <FiCpu className="w-8 h-8 text-[#04143C]" />
                  </motion.div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 360) / 12;
                      const radius = 40;
                      const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                      const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                      return (
                        <motion.line
                          key={i}
                          x1="50%"
                          y1="50%"
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.3 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      );
                    })}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#43BFC7" />
                        <stop offset="100%" stopColor="#FAA41E" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#43BFC7]/20 via-[#FAA41E]/20 to-[#43BFC7]/20 blur-3xl" />
            </div>
          </motion.div>

          {/* Chat interface */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-3xl border border-[#43BFC7]/30"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <FiMessageCircle className="w-6 h-6 text-[#43BFC7]" />
              <h3 className="text-xl font-bold text-foreground">AI Assistant</h3>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </div>

            <div className="space-y-4 min-h-[300px]">
              {messages.map((msg, i) => (
                msg ? (  // ← Safety check added here
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] text-[#04143C]'
                          : 'bg-background/50 border border-[#43BFC7]/30 text-foreground'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ) : null
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <button className="w-full py-4 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-2xl font-semibold text-[#04143C] hover:shadow-[0_0_30px_rgba(250,164,30,0.5)] transition-all">
                Talk to Our AI Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;