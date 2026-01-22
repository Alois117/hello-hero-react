import { motion } from "framer-motion";
import { SiReact, SiTypescript, SiPython, SiKubernetes, SiTerraform, SiRedis } from "react-icons/si";
import { FiShield, FiCheck } from "react-icons/fi";

const technologies = [
  { name: "FastAPI", icon: SiPython, color: "#43BFC7" },
  { name: "TypeScript", icon: SiTypescript, color: "#FAA41E" },
  { name: "React 19", icon: SiReact, color: "#43BFC7" },
  { name: "Redis Streams", icon: SiRedis, color: "#FAA41E" },
  { name: "Kubernetes", icon: SiKubernetes, color: "#39ff14" },
  { name: "Terraform", icon: SiTerraform, color: "#43BFC7" },
];

const compliance = [
  "SOC 2 Type II",
  "GDPR Compliant",
  "ISO 27001",
  "HIPAA Ready"
];

const Technology = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl pt-24 font-bold mb-4">
            <span className="bg-gradient-to-r from-[#39ff14] to-[#43BFC7] bg-clip-text text-transparent">
              Built on Modern Tech
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade infrastructure you can trust
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 rounded-3xl border border-[#43BFC7]/30 mb-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#43BFC7]/5 via-transparent to-[#39ff14]/5" />
          
          <div className="relative z-10">
            {/* Technology badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
              {technologies.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 group-hover:border-[#43BFC7] transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(67,191,199,0.3)]"
                    style={{ backgroundColor: `${tech.color}15` }}
                  >
                    <tech.icon className="w-8 h-8" style={{ color: tech.color }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{tech.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Architecture flow */}
            <div className="hidden lg:flex items-center justify-between gap-4 px-12">
              {["Frontend", "API Gateway", "AI Engine", "Database", "Monitoring"].map((layer, i) => (
                <div key={layer} className="flex items-center gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="glass-card p-4 rounded-xl border border-[#43BFC7]/30 text-center min-w-[120px]"
                  >
                    <p className="text-sm font-semibold text-foreground">{layer}</p>
                  </motion.div>
                  {i < 4 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.1 }}
                      className="h-0.5 w-8 bg-gradient-to-r from-[#43BFC7] to-[#FAA41E]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Compliance badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-3xl border border-[#39ff14]/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiShield className="w-6 h-6 text-[#39ff14]" />
            <h3 className="text-2xl font-bold text-foreground">Security & Compliance</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {compliance.map((cert, i) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-[#39ff14]/20"
              >
                <FiCheck className="w-5 h-5 text-[#39ff14] flex-shrink-0" />
                <span className="font-semibold text-foreground">{cert}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Technology;