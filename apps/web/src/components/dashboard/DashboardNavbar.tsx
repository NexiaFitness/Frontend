/**
 * DashboardNavbar - Navbar horizontal para dashboard en mobile/tablet
 * UNIFICADO con PublicNavbar styling para consistencia visual
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop (lg+): HIDDEN (sidebar fijo se mantiene)
 * - Mobile/Tablet (< lg): VISIBLE como navbar horizontal
 * 
 * @author Frontend Team
 * @since v4.1.0 - Style unification with PublicNavbar + UX optimization
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { NexiaLogo } from "@/components/auth/NexiaLogo";
import { LogoutButton } from "@/components/ui/buttons";
import type { RootState } from "@shared/store";

interface DashboardNavbarProps {
    menuItems: Array<{ label: string; path: string }>;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ menuItems }) => {
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* UNIFICADO: Mismo styling que PublicNavbar */}
            <nav className="lg:hidden bg-sidebar-header border-b border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-32">
                        {/* Logo solo a la izquierda */}
                        <div className="w-28 h-auto">
                            <NexiaLogo />
                        </div>

                        {/* User info + Hamburger agrupados a la derecha */}
                        <div className="flex items-center space-x-4">
                            {/* User info dashboard */}
                            <div className="hidden sm:block text-right">
                                <span className="text-white font-semibold text-lg block">Dashboard</span>
                                <p className="text-slate-300 text-sm">
                                    {user?.nombre} {user?.apellidos}
                                </p>
                            </div>

                            {/* Hamburger Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="
                                    text-white hover:text-blue-400 focus:outline-none focus:text-blue-400 
                                    transition-colors duration-200 p-3 -mr-3 rounded-lg hover:bg-white/10 
                                    flex items-center justify-center min-h-[48px] min-w-[48px]
                                "
                                aria-label="Abrir menú"
                            >
                                <svg
                                    className="h-8 w-8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMobileMenuOpen ? (
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dashboard Side Menu - Fullscreen drawer como PublicNavbar */}
            <DashboardSideMenu 
                isOpen={isMobileMenuOpen} 
                onClose={closeMobileMenu}
                menuItems={menuItems}
                user={user}
            />
        </>
    );
};

/**
 * DashboardSideMenu - Drawer lateral para dashboard mobile
 * Mismo patrón que NexiaSideMenu pero con contenido dashboard
 */
interface DashboardSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: Array<{ label: string; path: string }>;
    user: any;
}

const DashboardSideMenu: React.FC<DashboardSideMenuProps> = ({ 
    isOpen, 
    onClose, 
    menuItems, 
    user 
}) => {
    const location = useLocation();
    const isActiveLink = (href: string) => location.pathname === href;

    return (
        <>
            {/* Overlay - Mismo que NexiaSideMenu */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                onClick={onClose}
            />

            {/* Side Menu - Mismo styling que NexiaSideMenu */}
            <div
                className={`fixed top-32 right-0 h-[calc(100vh-8rem)] w-full z-50 transform transition-transform duration-500 ease-in-out bg-sidebar-nav ${
                    isOpen ? "translate-x-0" : "translate-x-full"
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
                                {menuItems.map(({ path, label }) => (
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

                        {/* User Actions */}
                        <div className="mt-8 pt-6 border-t border-white/60">
                            <div className="mb-4">
                                <p className="text-white font-medium">
                                    {user?.nombre} {user?.apellidos}
                                </p>
                                <p className="text-slate-300 text-sm">Professional Trainer</p>
                            </div>
                            <LogoutButton
                                variant="secondary"
                                confirmationRequired={true}
                                showUserName={false}
                                className="w-full text-sm bg-slate-700 hover:bg-slate-600 text-white"
                            />
                        </div>
                    </nav>

                    {/* Footer Branding - Mismo que NexiaSideMenu */}
                    <div className="p-6 border-t border-white/60">
                        <div className="text-center">
                            <h4 className="text-white font-semibold text-lg mb-2">
                                NEXIA Dashboard
                            </h4>
                            <p className="text-slate-300 text-sm">
                                Professional training management
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};