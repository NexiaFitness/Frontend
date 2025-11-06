/**
 * Configuración de navegación dinámica para NEXIA
 * Define menús públicos y privados basados en roles de usuario
 * Facilita escalabilidad y mantenimiento de la navegación
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { USER_ROLES, ROUTES } from './constants';

export interface NavigationItem {
    path: string;
    label: string;
    icon: string;
    description?: string;
    badge?: string | number;
    children?: NavigationItem[];
}

export interface NavigationConfig {
    public: NavigationItem[];
    trainer: NavigationItem[];
    admin: NavigationItem[];
    athlete: NavigationItem[];
}

// Navbar público (usuarios no autenticados)
const publicNavigation: NavigationItem[] = [
    {
        path: ROUTES.HOME,
        label: 'Inicio',
        icon: 'Home',
        description: 'Página principal'
    },
    {
        path: ROUTES.LOGIN,
        label: 'Iniciar Sesión',
        icon: 'LogIn',
        description: 'Acceder a tu cuenta'
    },
    {
        path: ROUTES.REGISTER,
        label: 'Registrarse',
        icon: 'UserPlus',
        description: 'Crear cuenta nueva'
    }
];

// Sidebar para entrenadores
const trainerNavigation: NavigationItem[] = [
    {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: 'Home',
        description: 'Vista general de actividad'
    },
    {
        path: '/dashboard/clients',
        label: 'Mis Clientes',
        icon: 'Users',
        description: 'Gestionar clientes y perfiles'
    },
    {
        path: '/dashboard/plans',
        label: 'Planes de Entrenamiento',
        icon: 'FileText',
        description: 'Crear y gestionar planes'
    },
    {
        path: '/dashboard/sessions',
        label: 'Sesiones',
        icon: 'Calendar',
        description: 'Programar entrenamientos'
    },
    {
        path: '/dashboard/exercises',
        label: 'Base de Ejercicios',
        icon: 'Dumbbell',
        description: 'Biblioteca de ejercicios'
    },
    {
        path: '/dashboard/analytics',
        label: 'Analytics',
        icon: 'BarChart',
        description: 'Métricas y reportes'
    },
    {
        path: ROUTES.PROFILE,
        label: 'Mi Cuenta',
        icon: 'User',
        description: 'Configuración de perfil'
    }
];

// Sidebar para administradores
const adminNavigation: NavigationItem[] = [
    {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: 'Home',
        description: 'Vista general del sistema'
    },
    {
        path: '/dashboard/users',
        label: 'Gestión de Usuarios',
        icon: 'Users',
        description: 'Administrar todos los usuarios'
    },
    {
        path: '/dashboard/trainers',
        label: 'Entrenadores',
        icon: 'UserCheck',
        description: 'Supervisar entrenadores'
    },
    {
        path: '/dashboard/analytics',
        label: 'Analytics Globales',
        icon: 'BarChart',
        description: 'Métricas de la plataforma'
    },
    {
        path: '/dashboard/system',
        label: 'Configuración',
        icon: 'Settings',
        description: 'Configuración del sistema'
    },
    {
        path: ROUTES.PROFILE,
        label: 'Mi Cuenta',
        icon: 'User',
        description: 'Configuración de perfil'
    }
];

// Sidebar para atletas
const athleteNavigation: NavigationItem[] = [
    {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: 'Home',
        description: 'Mi resumen de entrenamiento'
    },
    {
        path: '/dashboard/my-plan',
        label: 'Mi Plan',
        icon: 'Target',
        description: 'Plan de entrenamiento actual'
    },
    {
        path: '/dashboard/sessions',
        label: 'Mis Sesiones',
        icon: 'Calendar',
        description: 'Entrenamientos programados'
    },
    {
        path: '/dashboard/progress',
        label: 'Mi Progreso',
        icon: 'TrendingUp',
        description: 'Seguimiento de resultados'
    },
    {
        path: '/dashboard/feedback',
        label: 'Feedback',
        icon: 'MessageSquare',
        description: 'Comunicación con entrenador'
    },
    {
        path: ROUTES.PROFILE,
        label: 'Mi Cuenta',
        icon: 'User',
        description: 'Configuración de perfil'
    }
];

// Configuración completa exportada
export const NAVIGATION_CONFIG: NavigationConfig = {
    public: publicNavigation,
    trainer: trainerNavigation,
    admin: adminNavigation,
    athlete: athleteNavigation,
} as const;

// Helper para obtener navegación por rol
export const getNavigationByRole = (role?: string): NavigationItem[] => {
    if (!role) return NAVIGATION_CONFIG.public;
    
    switch (role) {
        case USER_ROLES.TRAINER:
            return NAVIGATION_CONFIG.trainer;
        case USER_ROLES.ADMIN:
            return NAVIGATION_CONFIG.admin;
        case USER_ROLES.ATHLETE:
            return NAVIGATION_CONFIG.athlete;
        default:
            return NAVIGATION_CONFIG.public;
    }
};

// Helper para verificar si una ruta requiere autenticación
export const isProtectedRoute = (path: string): boolean => {
    return path.startsWith('/dashboard') || path === ROUTES.PROFILE;
};

// Helper para obtener el item activo basado en la ruta actual
export const getActiveNavigationItem = (
    currentPath: string, 
    navigationItems: NavigationItem[]
): NavigationItem | null => {
    return navigationItems.find(item => 
        item.path === currentPath || 
        (item.children && item.children.some(child => child.path === currentPath))
    ) || null;
};