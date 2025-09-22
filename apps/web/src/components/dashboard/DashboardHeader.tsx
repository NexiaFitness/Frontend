/**
 * DashboardHeader - Header responsive para dashboards
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Invisible (sidebar siempre visible)
 * - Mobile/Tablet: Hamburger button para toggle sidebar drawer
 * 
 * @author Frontend Team  
 * @since v4.0.0 - Responsive dashboard implementation
 */

import React from "react";
import { NexiaLogo } from "@/components/auth/NexiaLogo";

interface DashboardHeaderProps {
    onMenuToggle: () => void;
    title?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onMenuToggle,
    title = "Dashboard"
}) => {
    return (
        // Only visible on mobile/tablet
        <header className="lg:hidden bg-sidebar-header border-b border-white/20 sticky top-0 z-30 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Hamburger Button */}
                <button
                    onClick={onMenuToggle}
                    className="text-white hover:text-blue-400 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo + Title */}
                <div className="flex items-center space-x-3">
                    <NexiaLogo className="w-8 h-8" />
                    <span className="text-white font-semibold text-lg">{title}</span>
                </div>

                {/* Right space for balance */}
                <div className="w-10"></div>
            </div>
        </header>
    );
};