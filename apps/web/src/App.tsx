/**
 * App principal
 *
 * Configura las rutas de React Router con:
 * - Layout público para homepage y páginas de autenticación
 * - Smart dashboard routing basado en rol del usuario autenticado
 * - Protección de rutas privadas con redirect automático
 * - Dashboard unificado vía DashboardShell (Fase 2b)
 * - Route-based code splitting con React.lazy (BUILD_WARNINGS_ANALYSIS.md Fase 2)
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v5.0.0 - Fase 2b: todas las rutas dashboard anidadas bajo DashboardShell
 * @updated v5.x - Fase 2: code splitting por bloques funcionales
 */

import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Páginas públicas (críticas: estáticas)
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Bloque 1: Públicas secundarias (lazy)
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));

// Bloque 2: Dashboards por rol (lazy)
const TrainerDashboard = lazy(() =>
  import("./pages/dashboard/trainer/TrainerDashboard").then((m) => ({ default: m.TrainerDashboard }))
);
const AdminDashboard = lazy(() =>
  import("./pages/dashboard/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AthleteDashboard = lazy(() =>
  import("./pages/dashboard/athlete/AthleteDashboard").then((m) => ({ default: m.AthleteDashboard }))
);

// Bloque 3: Módulos trainer (lazy)
const CompleteProfile = lazy(() =>
  import("./pages/dashboard/trainer/CompleteProfile").then((m) => ({ default: m.CompleteProfile }))
);
const ClientOnboarding = lazy(() =>
  import("./pages/clients/ClientOnboarding").then((m) => ({ default: m.ClientOnboarding }))
);
const ClientList = lazy(() =>
  import("./pages/clients/ClientList").then((m) => ({ default: m.ClientList }))
);
const ClientDetail = lazy(() =>
  import("./pages/clients/ClientDetail").then((m) => ({ default: m.ClientDetail }))
);
const ClientEdit = lazy(() =>
  import("./pages/clients/ClientEdit").then((m) => ({ default: m.ClientEdit }))
);
const ClientNewSessionPage = lazy(() =>
  import("./pages/clients/ClientNewSessionPage").then((m) => ({ default: m.ClientNewSessionPage }))
);
const TrainingPlansPage = lazy(() =>
  import("./pages/trainingPlans/TrainingPlansPage").then((m) => ({ default: m.TrainingPlansPage }))
);
const TrainingPlanDetail = lazy(() =>
  import("./pages/trainingPlans/TrainingPlanDetail").then((m) => ({ default: m.TrainingPlanDetail }))
);
const TrainingPlanEdit = lazy(() =>
  import("./pages/trainingPlans/TrainingPlanEdit").then((m) => ({ default: m.TrainingPlanEdit }))
);
const CreateTrainingPlan = lazy(() =>
  import("./pages/trainingPlans/CreateTrainingPlan").then((m) => ({ default: m.CreateTrainingPlan }))
);
const CreateTrainingPlanTemplate = lazy(() =>
  import("./pages/trainingPlans/CreateTrainingPlanTemplate").then((m) => ({ default: m.CreateTrainingPlanTemplate }))
);
const ExerciseList = lazy(() =>
  import("./pages/exercises").then((m) => ({ default: m.ExerciseList }))
);
const ExerciseDetail = lazy(() =>
  import("./pages/exercises").then((m) => ({ default: m.ExerciseDetail }))
);
const ExerciseForm = lazy(() =>
  import("./pages/exercises").then((m) => ({ default: m.ExerciseForm }))
);
const GenerateReports = lazy(() =>
  import("./pages/reports/GenerateReports").then((m) => ({ default: m.GenerateReports }))
);
const SchedulingPage = lazy(() =>
  import("./pages/scheduling/SchedulingPage").then((m) => ({ default: m.SchedulingPage }))
);
const NewScheduledSessionPage = lazy(() =>
  import("./pages/scheduling/NewScheduledSessionPage").then((m) => ({ default: m.NewScheduledSessionPage }))
);
const EditScheduledSessionPage = lazy(() =>
  import("./pages/scheduling/EditScheduledSessionPage").then((m) => ({ default: m.EditScheduledSessionPage }))
);
const CreateSessionFromTemplate = lazy(() =>
  import("./pages/sessionProgramming/CreateSessionFromTemplate").then((m) => ({ default: m.CreateSessionFromTemplate }))
);
const CreateSession = lazy(() =>
  import("./pages/sessionProgramming/CreateSession").then((m) => ({ default: m.CreateSession }))
);
const EditSession = lazy(() =>
  import("./pages/sessionProgramming/EditSession").then((m) => ({ default: m.EditSession }))
);
const CreateTemplate = lazy(() =>
  import("./pages/sessionProgramming/CreateTemplate").then((m) => ({ default: m.CreateTemplate }))
);
const SessionDetail = lazy(() =>
  import("./pages/sessionProgramming/SessionDetail").then((m) => ({ default: m.SessionDetail }))
);
const CreateTestResult = lazy(() =>
  import("./pages/testing").then((m) => ({ default: m.CreateTestResult }))
);

// Bloque 4: Account, NotFound (lazy)
const Account = lazy(() => import("./pages/account/Account"));
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound }))
);

// Layouts
import { PublicLayout } from "./components/ui/layout/PublicLayout";
import { DashboardShell } from "./components/dashboard/DashboardShell";

// UI Components
import { ToastProvider, LoadingSpinner } from "./components/ui/feedback";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";

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
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
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
            path="clients/:id/sessions/new"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
                <ClientNewSessionPage />
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

        <Route path="*" element={<NotFound />} />
      </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
