/**
 * routePrefetch.ts — Prefetch de chunks lazy al hover/focus en sidebar
 *
 * Contexto: Tras el code splitting (BUILD_WARNINGS_ANALYSIS.md Fase 2), la primera
 * navegación a una ruta lazy puede ser lenta. Este módulo permite pre-cargar el chunk
 * cuando el usuario hace hover o focus sobre el enlace en el sidebar (R2.4).
 *
 * Notas de mantenimiento:
 * - El mapeo path -> import debe mantenerse sincronizado con App.tsx.
 * - Solo incluir rutas que usan React.lazy().
 * - /dashboard requiere role para prefetchear el dashboard correcto.
 *
 * @author Frontend Team
 * @since v5.x
 */

const prefetched = new Set<string>();

/**
 * Genera la clave para el Set de prefetch.
 * Para /dashboard usamos role para evitar prefetchear el dashboard equivocado.
 */
function getPrefetchKey(path: string, role?: string): string {
  if (path === "/dashboard" || path === "/dashboard/") {
    return role ? `/dashboard:${role}` : "/dashboard:skip";
  }
  return path;
}

/**
 * Loaders por path. Usan los mismos import() que App.tsx para que el chunk
 * se cargue una vez y React.lazy lo reutilice.
 */
const loaders: Record<string, () => Promise<unknown>> = {
  "/dashboard/clients": () => import("../pages/clients/ClientList"),
  "/dashboard/scheduling": () => import("../pages/scheduling/SchedulingPage"),
  "/dashboard/training-plans": () => import("../pages/trainingPlans/TrainingPlansPage"),
  "/dashboard/exercises": () => import("../pages/exercises"),
  "/dashboard/account": () => import("../pages/account/Account"),
};

const dashboardLoaders: Record<string, () => Promise<unknown>> = {
  trainer: () => import("../pages/dashboard/trainer/TrainerDashboard"),
  admin: () => import("../pages/dashboard/admin/AdminDashboard"),
  athlete: () => import("../pages/dashboard/athlete/AthleteDashboard"),
};

/**
 * Pre-carga el chunk de la ruta indicada. Fire-and-forget; no bloquea.
 * Evita prefetch redundante usando un Set interno.
 *
 * @param path - Path del enlace (ej. /dashboard/clients)
 * @param role - Rol del usuario; necesario para /dashboard
 */
export function prefetchRoute(path: string, role?: string): void {
  const key = getPrefetchKey(path, role);
  if (prefetched.has(key)) {
    return;
  }
  prefetched.add(key);

  const normalizedPath = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;

  if (normalizedPath === "/dashboard") {
    const loader = role ? dashboardLoaders[role] : undefined;
    if (loader) {
      loader().catch(() => {
        prefetched.delete(key);
      });
    }
    return;
  }

  const loader = loaders[normalizedPath];
  if (loader) {
    loader().catch(() => {
      prefetched.delete(key);
    });
  }
}
