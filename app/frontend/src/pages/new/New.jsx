import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./New.css";

export default function New() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect WebSocket on component mount
    const ws = new WebSocket(
      window.location.hostname === "localhost"
        ? "ws://localhost:8081"
        : `ws://${window.location.hostname}:8081`
    );

    ws.onopen = () => {
      console.log("WebSocket connected for registration");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.status === "success") {
          alert("Account created successfully!");
          navigate("/login");
        } else {
          alert(response.message || "Failed to create account");
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
    };

    ws.onerror = () => {
      alert("WebSocket error");
    };

    return () => {
      if (ws) ws.close();
    };
  }, [navigate]);

  const handleCreateAccount = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        action: "register",
        name,
        email,
        password,
      };
      socket.send(JSON.stringify(message));
    } else {
      alert("Connection not ready, please wait...");
    }
  };

  return (
    <div className="new-page">
      <motion.div
        className="new-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Create Account</h2>

        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <button className="apple-btn" onClick={handleCreateAccount}>Create Account</button>

        <p className="back" onClick={() => navigate("/login")}>
          ← Back to Sign in
        </p>
      </motion.div>
    </div>
  );
}
