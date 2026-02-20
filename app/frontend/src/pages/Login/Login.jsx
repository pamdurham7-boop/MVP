import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(""); // ✅ new error state

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
      console.log("WebSocket connected for login");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        if (response.status === "success") {
          localStorage.setItem("token", response.id);
          localStorage.setItem("user", JSON.stringify(response));
          navigate("/");
        } else {
          setError(response.message || "Invalid email or password");
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

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      setError(""); // clear old error
      socket.send(
        JSON.stringify({
          action: "login",
          email,
          password,
        })
      );
    } else {
      setError("Connection not ready, please wait...");
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Sign in</h2>

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

        {/* ✅ ERROR MESSAGE */}
        {error && <div className="login-error">{error}</div>}

        <div className="remember-container">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <span>Remember me</span>
          </label>
        </div>

        <button className="apple-btn" onClick={handleLogin}>
          Continue
        </button>

        <p className="new-user">
          New user?{" "}
          <span onClick={() => navigate("/new")}>
            Create account
          </span>
        </p>

        <p className="back" onClick={() => navigate("/")}>
          ← Back
        </p>
      </motion.div>
    </div>
  );
}
