/**
 * App principal
 * 
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Protección de rutas privadas con redirect al dashboard
 * 
 * Mantiene una experiencia consistente para usuarios no autenticados
 * gracias al PublicLayout con PublicNavbar.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Páginas privadas
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";

// Tipado de store
import type { RootState } from "@shared/store";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Grupo de rutas públicas envueltas en PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home />
            )
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Rutas privadas */}
      <Route path="/dashboard" element={<TrainerDashboard />} />
    </Routes>
  );
}

export default App;
