import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiUser, FiMail, FiMessageSquare, FiSend } from "react-icons/fi";
import { Building } from "lucide-react";

const features = [
  "Unlimited infrastructure monitoring",
  "Near real-time alerts & events",
  "Alert correlation & noise reduction",
  "Multi-team access controls",
  "Unified infrastructure visibility",
  "Root cause insights",
  "Guided remediation recommendations",
  "Role-based access control (RBAC)",
];

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for the custom event from Navbar
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener("open-demo-modal", handleOpenModal);

    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("open-demo-modal", handleOpenModal);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Demo request submitted!");
    setIsModalOpen(false);
    alert("Demo request submitted! We'll contact you within 24 hours.");
  };

  return (
    <section id="pricing" className="relative py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-foreground">Enterprise </span>
            <span className="bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
              Subscription
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Flexible plans for teams that need reliable, AI-enhanced monitoring across modern infrastructure.
          </p>
        </motion.div>

        {/* Enterprise Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl border-2 border-[#43BFC7]/50 relative overflow-hidden max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#43BFC7]/10 via-[#FAA41E]/10 to-[#43BFC7]/10 animate-gradient-shift pointer-events-none" />

          <div className="relative z-10 px-8 py-12 space-y-10 text-center">
            <h3 className="text-4xl font-bold text-foreground">
              Custom Enterprise Plan
            </h3>

            <p className="text-xl text-muted-foreground">
              Tailored pricing based on scale, data sources, and support needs.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 justify-center md:justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#39ff14] to-[#43BFC7] flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-[#04143C]" />
                  </div>
                  <span className="text-lg text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-10 py-5 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-2xl text-[#04143C] font-bold text-lg hover:scale-105 transition-transform hover:shadow-[0_0_40px_rgba(250,164,30,0.4)]"
              >
                Get Custom Quote & Book Demo
              </button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Our team will reach out within 24 hours to understand your needs and provide a personalized proposal.
            </p>
          </div>
        </motion.div>

        {/* Demo Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-sm my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="glass-card rounded-2xl border border-[#43BFC7]/40 p-5 relative overflow-hidden shadow-2xl"
                  style={{ background: "rgba(4, 20, 60, 0.96)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#43BFC7]/8 via-[#FAA41E]/8 to-[#43BFC7]/8 animate-pulse pointer-events-none" />

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-r from-[#FAA41E] to-[#e8941a] flex items-center justify-center text-[#04143C] hover:scale-110 transition-transform z-10 shadow-md"
                  >
                    <FiX className="w-4 h-4" />
                  </button>

                  <div className="relative z-10 text-center mb-5">
                    <h3 className="text-lg font-bold mb-1">
                      <span className="bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                        Request Demo & Quote
                      </span>
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      We'll reply within 24 hours
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="relative z-10 space-y-3.5">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43BFC7] w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full pl-9 pr-3 py-2.5 glass-card border border-[#43BFC7]/30 rounded-xl focus:border-[#43BFC7] focus:outline-none text-foreground placeholder-muted-foreground text-sm"
                        style={{ background: "rgba(4, 20, 60, 0.85)" }}
                      />
                    </div>

                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43BFC7] w-3.5 h-3.5" />
                      <input
                        type="email"
                        placeholder="Work Email"
                        required
                        className="w-full pl-9 pr-3 py-2.5 glass-card border border-[#43BFC7]/30 rounded-xl focus:border-[#43BFC7] focus:outline-none text-foreground placeholder-muted-foreground text-sm"
                        style={{ background: "rgba(4, 20, 60, 0.85)" }}
                      />
                    </div>

                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43BFC7] w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Company Name"
                        required
                        className="w-full pl-9 pr-3 py-2.5 glass-card border border-[#43BFC7]/30 rounded-xl focus:border-[#43BFC7] focus:outline-none text-foreground placeholder-muted-foreground text-sm"
                        style={{ background: "rgba(4, 20, 60, 0.85)" }}
                      />
                    </div>

                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-2.5 text-[#43BFC7] w-3.5 h-3.5" />
                      <textarea
                        placeholder="Current monitoring tools or what you want to see..."
                        rows={2}
                        className="w-full pl-9 pr-3 py-2.5 glass-card border border-[#43BFC7]/30 rounded-xl focus:border-[#43BFC7] focus:outline-none text-foreground placeholder-muted-foreground resize-none text-sm"
                        style={{ background: "rgba(4, 20, 60, 0.85)" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-xl text-[#04143C] font-semibold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 text-sm shadow-lg"
                    >
                      <FiSend className="w-4 h-4" />
                      Submit Request
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Pricing;