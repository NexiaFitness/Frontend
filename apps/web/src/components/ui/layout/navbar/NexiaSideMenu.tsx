/**
 * NexiaSideMenu - Menú lateral fullscreen para NEXIA
 * Inspirado en LHC Legal pero adaptado al branding y navegación de NEXIA
 *
 * @since v1.0.0
 * @updated v4.4.2 - Unified layout: sin iconos, capitalización consistente con Dashboard
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@nexia/shared/hooks/usePublicNavigation";

interface NexiaSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NexiaSideMenu: React.FC<NexiaSideMenuProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { visibleNavigationItems } = usePublicNavigation({
        currentPath: location.pathname,
    });

    const isActiveLink = (href: string) => location.pathname === href;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                onClick={onClose}
            />

            {/* Side Menu */}
            <div
                className={`
                    fixed 
                    top-navbar-mobile lg:top-navbar-desktop 
                    right-0 
                    w-full 
                    h-[calc(100vh-theme(space.navbar-mobile))] 
                    lg:h-[calc(100vh-theme(space.navbar-desktop))] 
                    z-50 transform transition-transform duration-500 ease-in-out 
                    bg-sidebar-nav 
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto pt-8 px-6">
                        <div>
                            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">
                                Navegación
                            </h3>
                            <div className="w-full h-px bg-white/60 mb-6" />
                            <ul className="space-y-2">
                                {visibleNavigationItems.map(({ path, label }) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            onClick={onClose}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                                isActiveLink(path)
                                                    ? "bg-slate-800 text-white font-semibold"
                                                    : "text-slate-200 hover:text-white hover:bg-slate-800"
                                            }`}
                                        >
                                            <span className="text-lg">{label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    {/* Footer Branding */}
                    <div className="p-6 border-t border-white/60">
                        <div className="text-center">
                            <h4 className="text-white font-semibold text-lg mb-2">
                                Nexia Fitness
                            </h4>
                            <p className="text-slate-300 text-sm">
                                Plataforma científica para profesionales del fitness
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};