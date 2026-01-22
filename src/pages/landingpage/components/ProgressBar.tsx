import { motion, useScroll } from "framer-motion";

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#43BFC7] via-[#FAA41E] to-[#43BFC7] origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export default ProgressBar;