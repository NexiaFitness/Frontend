/**
 * Navbar pública para usuarios no autenticados
 * Navegación contextual inteligente basada en ruta actual
 * Diseño minimalista con logo y links limpios
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.0.0 - Integrado con NexiaSideMenu fullscreen
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@shared/hooks/usePublicNavigation";
import { NexiaLogo } from "@/components/auth/NexiaLogo";
import { NexiaSideMenu } from "./NexiaSideMenu";

export const PublicNavbar: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { visibleNavigationItems, isHomePage } = usePublicNavigation({
        currentPath: location.pathname,
    });

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="bg-sidebar-header border-b border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-32">
                        <Link
                            to="/"
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                            onClick={closeMobileMenu}
                        >
                            <div className="w-28 h-auto">
                                <NexiaLogo />
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            {visibleNavigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="text-white hover:text-blue-400 transition-colors duration-200 text-base lg:text-lg font-medium"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="md:hidden">
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

            {/* Side Menu - Reemplaza el dropdown anterior */}
            <NexiaSideMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        </>
    );
};