import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./Footer.css";

export default function Footer() {
  const footerRef = useRef(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = footerRef.current.getBoundingClientRect();

      const distanceThreshold = 150;

      const isClose =
        e.clientY > rect.top - distanceThreshold;

      setIsNear(isClose);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        className={`footer-cursor-glow ${isNear ? "active" : ""}`}
      />

      <motion.footer
        ref={footerRef}
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="glass-footer">
          <p>© 2026 X, Y, Z</p>
          <p>contact@email.com</p>
        </div>
      </motion.footer>
    </>
  );
}
