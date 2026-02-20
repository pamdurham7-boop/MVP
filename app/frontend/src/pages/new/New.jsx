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
  const [error, setError] = useState(""); // ✅ error state

  const getWebSocketUrl = () => {
    if (window.location.hostname === "localhost") {
      return "ws://localhost:8081";
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/ws/`;
  };

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      console.log("WebSocket connected for registration");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        if (response.status === "success") {
          navigate("/login");
        } else {
          setError(response.message || "Failed to create account");
        }
      } catch (e) {
        setError("Unexpected server response");
      }
    };

    ws.onerror = () => {
      setError("Connection error. Please try again.");
    };

    return () => {
      if (ws) ws.close();
    };
  }, [navigate]);

  const handleCreateAccount = () => {
    // Frontend validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      setError(""); // clear previous error

      socket.send(
        JSON.stringify({
          action: "register",
          name,
          email,
          password,
        })
      );
    } else {
      setError("Connection not ready, please wait...");
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

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* ✅ ERROR DISPLAY */}
        {error && <div className="new-error">{error}</div>}

        <button className="apple-btn" onClick={handleCreateAccount}>
          Create Account
        </button>

        <p className="back" onClick={() => navigate("/login")}>
          ← Back to Sign in
        </p>
      </motion.div>
    </div>
  );
}
