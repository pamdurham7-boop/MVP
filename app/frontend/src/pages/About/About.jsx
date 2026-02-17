import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Button from "../../components/Button/Button";
import "./About.css";

export default function About() {
  const location = useLocation();

  const pages = [
    { name: "Home", path: "/" },
    { name: "Project", path: "/project" },
    { name: "Login", path: "/login" },
  ];

  return (
    <div className="about-page">
      <section className="full-section">
        <motion.div
          className="glass-card large"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>About Us</h1>
          <p>
            We design systems that merge precision, performance,
            and futuristic aesthetics. Built for tomorrow.
          </p>
        </motion.div>
      </section>

      <section className="buttons-section">
        {pages
          .filter((p) => p.path !== location.pathname)
          .map((p) => (
            <Button
              key={p.path}
              label={p.name}
              to={p.path}
            />
          ))}
      </section>
    </div>
  );
}
