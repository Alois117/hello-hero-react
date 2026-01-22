import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import avisLogo from "@/assets/avis-logo.png";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Features", id: "features" },
    { name: "Demo", id: "demo" },
    { name: "Pricing", id: "pricing" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6">
        <div
          className={`glass-surface rounded-2xl px-6 py-4 border-2 transition-all duration-300 ${
            isScrolled
              ? "border-[#43BFC7]/30 shadow-[0_0_30px_rgba(67,191,199,0.2)]"
              : "border-border/20"
          }`}
          style={{
            background: isScrolled
              ? "rgba(4, 20, 60, 0.9)"
              : "rgba(4, 20, 60, 0.6)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src={avisLogo}
                alt="Avis Logo"
                className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_8px_rgba(67,191,199,0.4)]"
              />
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                Avis™
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  whileHover={{ scale: 1.05 }}
                  className="text-foreground hover:text-[#43BFC7] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-foreground hover:text-[#43BFC7] transition-colors"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In
              </motion.button>

              {/* Book Demo - now opens modal */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-xl text-[#04143C] font-semibold hover:shadow-[0_0_40px_rgba(250,164,30,0.6)] transition-all relative overflow-hidden group"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-demo-modal"));
                }}
              >
                <span className="relative z-10">Book Your Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8941a] to-[#FAA41E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground hover:text-[#43BFC7] transition-colors"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-2 mx-6 overflow-hidden"
          >
            <div
              className="glass-surface rounded-2xl p-6 border-2 border-[#43BFC7]/20"
              style={{ background: "rgba(4, 20, 60, 0.95)" }}
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => scrollToSection(link.id)}
                    className="text-left py-3 px-4 text-foreground hover:text-[#43BFC7] hover:bg-[#43BFC7]/10 rounded-lg transition-all"
                  >
                    {link.name}
                  </motion.button>
                ))}

                <div className="h-px bg-border my-2" />

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="py-3 px-4 text-foreground hover:text-[#43BFC7] hover:bg-[#43BFC7]/10 rounded-lg transition-all text-left"
                  onClick={() => (window.location.href = "/login")}
                >
                  Sign In
                </motion.button>

                {/* Mobile Book Demo - opens same modal */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="py-3 px-4 bg-gradient-to-r from-[#FAA41E] to-[#e8941a] rounded-lg text-[#04143C] font-semibold hover:shadow-[0_0_40px_rgba(250,164,30,0.6)] transition-all"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-demo-modal"));
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Book Your Demo
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navigation;