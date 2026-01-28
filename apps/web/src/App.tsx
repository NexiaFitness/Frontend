/**
 * App principal
 * 
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Smart dashboard routing basado en rol del usuario autenticado
 * - Protección de rutas privadas con redirect automático
 * - Client Management: List, Detail, Onboarding
 * - Training Plans Management: List (FASE 1)
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Role-based dashboard routing implementado
 * @updated v3.2.0 - Training Plans Management agregado (FASE 1)
 * @updated v2.6.0 - Client Management Dashboard
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
import { ClientDetail } from "./pages/clients/ClientDetail";
import { ClientEdit } from "./pages/clients/ClientEdit";

// Training Plans Management (trainers only)
import { TrainingPlansPage } from "./pages/trainingPlans/TrainingPlansPage";
import { TrainingPlanDetail } from "./pages/trainingPlans/TrainingPlanDetail";
import { TrainingPlanEdit } from "./pages/trainingPlans/TrainingPlanEdit";
import { CreateTrainingPlan, CreateTrainingPlanTemplate } from "./pages/trainingPlans";

// Exercises Management (trainers only)
import { ExerciseList } from "./pages/exercises/ExerciseList";
import { ExerciseDetail } from "./pages/exercises/ExerciseDetail";

// Reports & Scheduling (trainers only)
import { GenerateReports } from "./pages/reports/GenerateReports";
import { SchedulingPage } from "./pages/scheduling/SchedulingPage";
import { ScheduleSession } from "./pages/scheduling/ScheduleSession";

// Session Programming (trainers only)
import { CreateSessionFromTemplate, CreateSession, EditSession, CreateTemplate, SessionDetail } from "./pages/sessionProgramming";

// Testing (trainers only)
import { CreateTestResult } from "./pages/testing";

// Páginas adicionales
import Account from "./pages/account/Account";

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";

// UI Components
import { ToastProvider } from "./components/ui/feedback";

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
    <ToastProvider>
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
      {/* TRAINING PLANS MANAGEMENT - Trainers only */}
      {/* ============================================ */}

      {/* Create Training Plan Template - Ruta específica PRIMERO (antes de create) */}
      <Route
        path="/dashboard/training-plans/templates/create"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <CreateTrainingPlanTemplate />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Create Training Plan - Ruta específica PRIMERO (antes de :id) */}
      <Route
        path="/dashboard/training-plans/create"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <CreateTrainingPlan />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Training Plan Edit - Ruta específica PRIMERO (antes de detail) */}
      <Route
        path="/dashboard/training-plans/:id/edit"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <TrainingPlanEdit />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Training Plan Detail */}
      <Route
        path="/dashboard/training-plans/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <TrainingPlanDetail />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Training Plans List - ✅ FASE 1 IMPLEMENTADA */}
      <Route
        path="/dashboard/training-plans"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <TrainingPlansPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* EXERCISES MANAGEMENT - Trainers only */}
      {/* ============================================ */}

      {/* Exercise Detail */}
      <Route
        path="/dashboard/exercises/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ExerciseDetail />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Exercise List */}
      <Route
        path="/dashboard/exercises"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ExerciseList />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* CLIENT MANAGEMENT - Trainers only */}
      {/* ============================================ */}

      {/* Client Edit - Ruta específica PRIMERO (antes de /:id) */}
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

      {/* Client Detail */}
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

      {/* Client List (lista principal) */}
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

      {/* ============================================ */}
      {/* REPORTS & SCHEDULING - Trainers only */}
      {/* ============================================ */}

      {/* Generate Reports */}
      <Route
        path="/dashboard/reports/generate"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <GenerateReports />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Scheduling Page (main calendar view) */}
      <Route
        path="/dashboard/scheduling"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <SchedulingPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Schedule Session (legacy form page) */}
      <Route
        path="/dashboard/scheduling/schedule"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
              <ScheduleSession />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* SESSION PROGRAMMING - Trainers only */}
      {/* ============================================ */}

      {/* Create Session From Template */}
      <Route
        path="/dashboard/session-programming/create-from-template/:templateId"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <CreateSessionFromTemplate />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Create Session */}
      <Route
        path="/dashboard/session-programming/create-session"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <CreateSession />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Edit Session */}
      <Route
        path="/dashboard/session-programming/edit-session/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <EditSession />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Session Detail */}
      <Route
        path="/dashboard/session-programming/sessions/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <SessionDetail />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Create Template */}
      <Route
        path="/dashboard/session-programming/create-template"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <CreateTemplate />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* TESTING - Trainers only */}
      {/* ============================================ */}

      {/* Create Test Result */}
      <Route
        path="/dashboard/testing/create-test"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
              <CreateTestResult />
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
    </ToastProvider>
  );
}

export default App;