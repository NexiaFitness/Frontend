/**
 * DashboardNavbar - Navbar horizontal para dashboard en mobile/tablet
 * UNIFICADO con PublicNavbar styling para consistencia visual
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop (lg+): HIDDEN (sidebar fijo se mantiene)
 * - Mobile/Tablet (< lg): VISIBLE como navbar horizontal
 *
 * @since v4.1.0
 * @updated v4.3.2 - Unified sidemenu layout: User Actions + Footer Branding bottom-aligned
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { NexiaLogoCompact } from "@/components/ui/branding/NexiaLogoCompact";
import { LogoutButton } from "@/components/ui/buttons";
import type { RootState } from "@nexia/shared/store";

interface DashboardNavbarProps {
    menuItems: Array<{ label: string; path: string }>;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ menuItems }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Navbar visible solo en mobile/tablet */}
            <nav className="lg:hidden bg-sidebar-header border-b border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-navbar-mobile lg:h-navbar-desktop">
                        {/* Logo a la izquierda */}
                        <NexiaLogoCompact className="w-24 sm:w-32 md:w-40" />

                        {/* User info + botón hamburguesa */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block text-right">
                                <span className="text-white font-semibold text-lg block">Dashboard</span>
                                <p className="text-slate-300 text-sm">
                                    {user?.nombre} {user?.apellidos}
                                </p>
                            </div>

                            <button
                                onClick={toggleMobileMenu}
                                className="text-white hover:text-blue-400 focus:outline-none focus:text-blue-400 transition-colors duration-200 p-3 -mr-3 rounded-lg hover:bg-white/10 flex items-center justify-center min-h-[48px] min-w-[48px]"
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

            {/* Drawer lateral mobile */}
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
 */
interface DashboardSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: Array<{ label: string; path: string }>;
    user: {
        nombre?: string;
        apellidos?: string;
        role?: string;
    } | null;
}

const DashboardSideMenu: React.FC<DashboardSideMenuProps> = ({
    isOpen,
    onClose,
    menuItems,
    user,
}) => {
    const location = useLocation();
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
                    </nav>

                  {/* Bottom Section: User Actions */}
<div className="px-6 pb-6">
    <div className="mb-6 pt-6 border-t border-white/60">
        <div className="mb-4 text-center">
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
</div>

                </div>
            </div>
        </>
    );
};