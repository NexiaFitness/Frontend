/**
 * App principal
 * 
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Smart dashboard routing basado en rol del usuario autenticado
 * - Protección de rutas privadas con redirect automático
 * - Client Management: List (implementado), Detail y Edit (pendientes)
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Role-based dashboard routing implementado
 * @updated v2.5.0 - ClientOnboarding wizard agregado
 * @updated v2.6.0 - Client Management Dashboard (List implementado, Detail/Edit pendientes)
 */

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboards por rol
import { TrainerDashboard } from "./pages/dashboard/trainer/TrainerDashboard";
import { AdminDashboard } from "./pages/dashboard/admin/AdminDashboard";
import { AthleteDashboard } from "./pages/dashboard/athlete/AthleteDashboard";

// Páginas trainer-specific
import { CompleteProfile } from "./pages/dashboard/trainer/CompleteProfile";

// Client Management (trainers only)
import { ClientOnboarding } from "./pages/clients/ClientOnboarding";
import { ClientList } from "./pages/clients/ClientList";
// TODO FASE 3: Descomentar cuando ClientDetail esté implementado
// import { ClientDetail } from "./pages/clients/ClientDetail";
// TODO FASE 4: Descomentar cuando ClientEdit esté implementado
// import { ClientEdit } from "./pages/clients/ClientEdit";

// Páginas adicionales
import Account from "./pages/account/Account";

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";

// Protección de rutas
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";

// Tipado de store
import type { RootState, AppDispatch } from "@nexia/shared/store";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { hydrateAuth } from "@nexia/shared/store/authSlice";

/**
 * DashboardRouter - Router inteligente basado en roles
 */
const DashboardRouter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

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
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  // Hidratar auth state al montar app
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // Log estratégico de auth state
  useEffect(() => {
    if (!isLoading) {  // Solo loguear después de hydration
      // eslint-disable-next-line no-console
      console.info("[App] Auth state:", {
        isAuthenticated,
        user: user?.email || 'none',
        role: user?.role || 'none',
        verified: user?.is_verified ?? false
      });
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Routes>
      {/* Rutas públicas */}
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Dashboard principal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* CLIENT MANAGEMENT - Trainers only */}
      {/* ============================================ */}
      
      {/* TODO FASE 4: Client Edit - Descomentar cuando esté implementado
      <Route
        path="/dashboard/clients/:id/edit"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ClientEdit />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      */}

      {/* TODO FASE 3: Client Detail - Descomentar cuando esté implementado
      <Route
        path="/dashboard/clients/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ClientDetail />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      */}

      {/* Client Onboarding (wizard de alta) */}
      <Route
        path="/dashboard/clients/onboarding"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ClientOnboarding />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Client List (lista principal) - ✅ FASE 2 IMPLEMENTADA */}
      <Route
        path="/dashboard/clients"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ClientList />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Complete Profile - Solo trainers */}
      <Route
        path="/dashboard/trainer/complete-profile"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <CompleteProfile />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Account - Todos los roles */}
      <Route
        path="/dashboard/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;