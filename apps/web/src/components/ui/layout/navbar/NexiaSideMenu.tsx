/**
 * NexiaSideMenu - Menú lateral fullscreen para NEXIA
 * Inspirado en LHC Legal pero adaptado al branding y navegación de NEXIA
 * 
 * Features:
 * - Slide-in desde la derecha con overlay
 * - Gradiente NEXIA branded
 * - Navegación contextual inteligente
 * - Footer con CTA registration
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@shared/hooks/usePublicNavigation";
import {
    Home,
    UserPlus,
    LogIn,
    Dumbbell
} from "lucide-react";

interface NexiaSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NexiaSideMenu: React.FC<NexiaSideMenuProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { visibleNavigationItems } = usePublicNavigation({
        currentPath: location.pathname,
    });

    const linkIconColor = "text-primary-700";

    // Navigation items with icons
    const navigationItemsWithIcons = visibleNavigationItems.map((item) => {
        let icon = <Home size={20} className={linkIconColor} />;

        switch (item.path) {
            case '/':
                icon = <Home size={20} className={linkIconColor} />;
                break;
            case '/auth/login':
                icon = <LogIn size={20} className={linkIconColor} />;
                break;
            case '/auth/register':
                icon = <UserPlus size={20} className={linkIconColor} />;
                break;
            default:
                icon = <Dumbbell size={20} className={linkIconColor} />;
        }

        return { ...item, icon };
    });

    const isActiveLink = (href: string) => location.pathname === href;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                onClick={onClose}
            />

            {/* Side Menu */}
            <div
                className={`fixed top-32 right-0 h-[calc(100vh-8rem)] w-full z-50 transform transition-transform duration-500 ease-in-out bg-sidebar-nav ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto pt-8 px-6 pb-6">
                        <div>
                            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">
                                Navegación
                            </h3>
                            <div className="w-full h-px bg-white/60 mb-6" />
                            <ul className="space-y-2">
                                {navigationItemsWithIcons.map(({ path, label, icon }) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            onClick={onClose}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActiveLink(path)
                                                    ? "bg-slate-800 text-white font-semibold"
                                                    : "text-slate-200 hover:text-white hover:bg-slate-800"
                                                }`}
                                        >
                                            {icon}
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
                                NEXIA Fitness
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