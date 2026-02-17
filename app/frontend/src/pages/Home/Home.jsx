import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "../../components/Button/Button";
import "./Home.css";

export default function Home() {
  const [text, setText] = useState("");
  const fullText = "We Build the Future";

  // Typing effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Cursor glow
  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");

    window.addEventListener("mousemove", (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    });
  }, []);

  return (
    <div className="home">

      <div className="cursor-glow" />

      <section className="hero">
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>{text}<span className="blink">|</span></h1>
          <p>Innovation. Precision. Excellence.</p>
        </motion.div>
      </section>

      <section className="parallax">
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2>We Are Different</h2>
        </motion.div>
      </section>

      <section className="parallax2">
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2>We Have Standards</h2>
        </motion.div>
      </section>

      <section className="buttons-section">
        <Button label="About" to="/about" />
        <Button label="Project" to="/project" />
        <Button label="Login" to="/login" />
      </section>
    </div>
  );
}
