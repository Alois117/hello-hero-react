import { motion } from "framer-motion";

const companies = [
  "Siemens",
  "Vodafone",
  "Riot Games",
  "Cloudflare",
  "Toyota",
  "Samsung",
  "Shopify",
  "Binance"
];

const LogoMarquee = () => {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#04143C] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#04143C] to-transparent z-10" />
      
      <motion.div
        className="flex gap-12"
        animate={{
          x: [0, -1000]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear"
          }
        }}
      >
        {[...companies, ...companies, ...companies].map((company, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-6 py-3 glass-card rounded-xl border border-border/30 hover:border-[#43BFC7]/50 transition-all"
          >
            <span className="text-lg font-semibold text-foreground whitespace-nowrap">
              {company}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoMarquee;