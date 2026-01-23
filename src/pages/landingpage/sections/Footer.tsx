import { motion } from "framer-motion";
import { FiTwitter, FiLinkedin, FiHeart } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  const links = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy" }, // Updated to actual route
      { name: "Terms of Service", href: "/terms-of-use" }, // Updated to actual route (note: your footer says "Terms of Service" but document is "Terms of Use"; change name if needed to "Terms of Use")
    ]
  };

  const socials = [
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/sentramind/",
      label: "Instagram",
      displayName: "Instagram"
    },
    {
      icon: FiTwitter,
      href: "https://x.com/sentramind",
      label: "X",
      displayName: "X"
    },
    // {
    //   icon: FiLinkedin,
    //   href: "#",
    //   label: "LinkedIn",
    //   displayName: "LinkedIn"
    // },
  ];

  return (
    <footer
      className="relative py-16 md:py-20 border-t border-border/50 overflow-hidden"
      style={{ background: "rgba(4, 20, 60, 0.8)" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#43BFC7]/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          {/* Brand & description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5 lg:col-span-4"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                Avis™
              </span>
            </h3>
            <p className="text-muted-foreground max-w-md">
              AI-Powered Infrastructure Monitoring Tool
            </p>
          </motion.div>

          {/* Links + Social section */}
          <div className="md:col-span-7 flex flex-col md:flex-row md:items-start gap-10 md:gap-12 lg:gap-16">
            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-bold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {links.Product.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-[#43BFC7] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                {links.Legal.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank" // Added to open in new tab
                      rel="noopener noreferrer" // Added for security
                      className="text-muted-foreground hover:text-[#43BFC7] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Connect With Us - horizontal icons with names below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-start"
            >
              <h4 className="font-bold text-foreground mb-4">Connect With Us</h4>

              <div className="flex items-start gap-8 md:gap-10 lg:gap-12">
                {socials.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    whileHover={{ scale: 1.12 }}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#FAA41E]/10 to-[#43BFC7]/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#FAA41E] group-hover:to-[#e8941a] transition-all duration-300 shadow-sm mb-2">
                      <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-[#04143C]" />
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors font-medium">
                      {social.displayName}
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
        >
          <p className="flex items-center gap-2">
            Made with <FiHeart className="text-[#FAA41E] w-4 h-4 animate-pulse" /> by the Avis Team
          </p>

          <p>© {new Date().getFullYear()} Avis. All rights reserved.</p> {/* Updated to Sentramind */}
        </motion.div>

        {/* Decorative bottom line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#43BFC7]/50 to-transparent" />
      </div>
    </footer>
  );
};

export default Footer;