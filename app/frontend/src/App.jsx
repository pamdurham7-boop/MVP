import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import New from "./pages/new/New";
import ProtectedRoute from "./routes/Protectedroute";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Project from "./pages/Project";
import Login from "./pages/Login/Login";

function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Login Route */}
        <Route
          path="/login"
          element={
            token
              ? <Navigate to="/" replace />
              : <Login />
          }
        />
         <Route
         path="/new"
         element={
          token
          ? <Navigate to="/" replace />
          : <New />
        }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  // 🔥 GLOBAL CURSOR SYSTEM
  useEffect(() => {
    const moveGlow = (e) => {
      document
        .querySelectorAll(
          ".cursor-glow, .header-cursor-glow, .footer-cursor-glow"
        )
        .forEach((el) => {
          if (el) {
            el.style.left = `${e.clientX}px`;
            el.style.top = `${e.clientY}px`;
          }
        });
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <BrowserRouter>
      {/* 🔵 GLOBAL BLUE GLOW */}
      <div className="cursor-glow" />

      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  );
}
