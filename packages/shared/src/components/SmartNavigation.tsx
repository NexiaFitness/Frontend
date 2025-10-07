/**
 * SmartNavigation.tsx
 * -----------------------------------------------------
 * Cross-platform intelligent navigation component.
 * Automatically redirects users based on their role and profile completion.
 * 
 * @scope Shared navigation logic (cross-platform)
 * @author NEXIA
 * @since v2.3.0
 */

import React, { useEffect } from "react";
import { useRoleNavigation } from "@shared/hooks/useRoleNavigation";
import { useCompleteProfile } from "@shared/hooks/useCompleteProfile";

interface SmartNavigationProps {
    children: React.ReactNode;
    onNavigate?: (path: string) => void;
}

/**
 * SmartNavigation - Cross-platform intelligent routing
 * 
 * Features:
 * - Role-based redirection
 * - Profile completion checks
 * - Automatic fallbacks
 * - Web and mobile compatible
 */
export const SmartNavigation: React.FC<SmartNavigationProps> = ({
    children,
    onNavigate
}) => {
    const { getDefaultRoute, canAccessRoute } = useRoleNavigation();
    const { isProfileComplete, isTrainer } = useCompleteProfile({
        onRedirect: onNavigate
    });

    useEffect(() => {
        if (!onNavigate) return;

        // Get default route for user role
        const defaultRoute = getDefaultRoute();
        
        // For trainers, check if profile is complete
        if (isTrainer && !isProfileComplete) {
            // Trainer needs to complete profile
            if (canAccessRoute('/dashboard/complete-profile')) {
                onNavigate('/dashboard/complete-profile');
            } else {
                onNavigate(defaultRoute);
            }
        } else {
            // User can access their default dashboard
            onNavigate(defaultRoute);
        }
    }, [isTrainer, isProfileComplete, getDefaultRoute, canAccessRoute, onNavigate]);

    return <>{children}</>;
};
