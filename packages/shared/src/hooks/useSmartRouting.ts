/**
 * useSmartRouting.ts
 * -----------------------------------------------------
 * Cross-platform smart routing hook.
 * Handles role-based navigation and profile completion logic.
 * 
 * @scope Shared navigation logic (cross-platform)
 * @author NEXIA
 * @since v2.3.0
 */

import { useEffect, useState } from "react";
import { useRoleNavigation } from "./useRoleNavigation";
import { useCompleteProfile } from "./useCompleteProfile";

interface UseSmartRoutingProps {
    onNavigate?: (path: string) => void;
    autoRedirect?: boolean;
}

export const useSmartRouting = ({ 
    onNavigate, 
    autoRedirect = true 
}: UseSmartRoutingProps = {}) => {
    const { getDefaultRoute, canAccessRoute } = useRoleNavigation();
    const { isProfileComplete, isTrainer, isAuthenticated } = useCompleteProfile();
    
    const [currentRoute, setCurrentRoute] = useState<string>("/");
    const [isNavigating, setIsNavigating] = useState(false);

    const navigateTo = (path: string) => {
        if (onNavigate) {
            setIsNavigating(true);
            onNavigate(path);
            setCurrentRoute(path);
            setIsNavigating(false);
        }
    };

    const getOptimalRoute = (): string => {
        if (!isAuthenticated) return "/auth/login";
        
        const defaultRoute = getDefaultRoute();
        
        // For trainers, check profile completion
        if (isTrainer && !isProfileComplete) {
            if (canAccessRoute('/dashboard/complete-profile')) {
                return '/dashboard/complete-profile';
            }
        }
        
        return defaultRoute;
    };

    const shouldRedirect = (): boolean => {
        if (!isAuthenticated) return false;
        
        const optimalRoute = getOptimalRoute();
        return currentRoute !== optimalRoute;
    };

    // Auto-redirect logic
    useEffect(() => {
        if (!autoRedirect || !onNavigate) return;
        
        if (shouldRedirect()) {
            const optimalRoute = getOptimalRoute();
            navigateTo(optimalRoute);
        }
    }, [isAuthenticated, isTrainer, isProfileComplete, autoRedirect]);

    return {
        currentRoute,
        isNavigating,
        navigateTo,
        getOptimalRoute,
        shouldRedirect,
        isAuthenticated,
        isTrainer,
        isProfileComplete,
    };
};
