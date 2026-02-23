/**
 * App principal
 *
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Smart dashboard routing basado en rol del usuario autenticado
 * - Protección de rutas privadas con redirect automático
 * - Dashboard unificado vía DashboardShell (Fase 2b)
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v5.0.0 - Fase 2b: todas las rutas dashboard anidadas bajo DashboardShell
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
import { ExerciseList, ExerciseDetail, ExerciseForm } from "./pages/exercises";

// Reports & Scheduling (trainers only)
import { GenerateReports } from "./pages/reports/GenerateReports";
import { SchedulingPage } from "./pages/scheduling/SchedulingPage";
import { NewScheduledSessionPage } from "./pages/scheduling/NewScheduledSessionPage";
import { EditScheduledSessionPage } from "./pages/scheduling/EditScheduledSessionPage";

// Session Programming (trainers only)
import { CreateSessionFromTemplate, CreateSession, EditSession, CreateTemplate, SessionDetail } from "./pages/sessionProgramming";

// Testing (trainers only)
import { CreateTestResult } from "./pages/testing";

// Páginas adicionales
import Account from "./pages/account/Account";

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";
import { DashboardShell } from "./components/dashboard/DashboardShell";

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
 * DashboardRouter - Router inteligente basado en roles para index /dashboard
 */
const DashboardRouter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "trainer":
      return <TrainerDashboard />;
    case "athlete":
      return <AthleteDashboard />;
    default:
      console.error(`Unknown user role: ${user?.role}`);
      return <Navigate to="/auth/login" replace />;
  }
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      // eslint-disable-next-line no-console
      console.info("[App] Auth state:", {
        isAuthenticated,
        user: user?.email || "none",
        role: user?.role || "none",
        verified: user?.is_verified ?? false,
      });
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <ToastProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Dashboard: todas las rutas anidadas bajo DashboardShell (Fase 2b) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardRouter />} />

          {/* Training Plans - rutas específicas primero */}
          <Route
            path="training-plans/templates/create"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <CreateTrainingPlanTemplate />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="training-plans/create"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <CreateTrainingPlan />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="training-plans/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <TrainingPlanEdit />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="training-plans/:id"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <TrainingPlanDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="training-plans"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <TrainingPlansPage />
              </RoleProtectedRoute>
            }
          />

          {/* Exercises */}
          <Route
            path="exercises/create"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ExerciseForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="exercises/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ExerciseForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="exercises/:id"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ExerciseDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="exercises"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ExerciseList />
              </RoleProtectedRoute>
            }
          />

          {/* Clients */}
          <Route
            path="clients/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ClientEdit />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="clients/:id"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ClientDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="clients/onboarding"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ClientOnboarding />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="clients"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ClientList />
              </RoleProtectedRoute>
            }
          />

          {/* Complete Profile */}
          <Route
            path="trainer/complete-profile"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <CompleteProfile />
              </RoleProtectedRoute>
            }
          />

          {/* Reports & Scheduling */}
          <Route
            path="reports/generate"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <GenerateReports />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="scheduling"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <SchedulingPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="scheduling/new"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <NewScheduledSessionPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="scheduling/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <EditScheduledSessionPage />
              </RoleProtectedRoute>
            }
          />

          {/* Session Programming */}
          <Route
            path="session-programming/create-from-template/:templateId"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <CreateSessionFromTemplate />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="session-programming/create-session"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <CreateSession />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="session-programming/edit-session/:id"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <EditSession />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="session-programming/sessions/:id"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <SessionDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="session-programming/create-template"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <CreateTemplate />
              </RoleProtectedRoute>
            }
          />

          {/* Testing */}
          <Route
            path="testing/create-test"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]} redirectTo="/dashboard">
                <CreateTestResult />
              </RoleProtectedRoute>
            }
          />

          {/* Account - todos los roles */}
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
