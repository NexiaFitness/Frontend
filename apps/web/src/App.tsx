/**
 * App principal
 * 
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Smart dashboard routing basado en rol del usuario autenticado
 * - Protección de rutas privadas con redirect automático
 * - Ruta privada /dashboard/account → ProfileForm dentro de DashboardLayout
 * 
 * Mantiene una experiencia consistente para usuarios no autenticados
 * gracias al PublicLayout con PublicNavbar.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Role-based dashboard routing implementado
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

// Dashboards por rol (pages instead of components)
import { TrainerDashboard } from "./pages/dashboard/TrainerDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { AthleteDashboard } from "./pages/dashboard/AthleteDashboard";

// Páginas adicionales
import Account from "./pages/account/Account";

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";

// Protección de rutas
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Tipado de store
import type { RootState } from "@shared/store";

/**
 * DashboardRouter - Router inteligente basado en roles
 * Detecta automáticamente el rol del usuario y renderiza el dashboard apropiado
 */
const DashboardRouter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Role-based dashboard rendering
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'athlete':
      return <AthleteDashboard />;
    default:
      console.error(`Unknown user role: ${user?.role}`);
      return <Navigate to="/auth/login" replace />;
  }
};

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Grupo de rutas públicas envueltas en PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Dashboard principal - Smart routing basado en rol del usuario */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />

      {/* Ruta de cuenta - Accesible para todos los roles autenticados */}
      <Route
        path="/dashboard/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;