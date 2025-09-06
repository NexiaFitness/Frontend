/**
 * App principal
 * Configura las rutas de React Router con protección de auth
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TestUi from "./pages/TestUi";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";
import type { RootState } from "@shared/store";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Redirección inteligente en home */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        } 
      />
      
      <Route path="/test-ui" element={<TestUi />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      {/* Ruta protegida del dashboard */}
      <Route path="/dashboard" element={<TrainerDashboard />} />
    </Routes>
  );
}

export default App;