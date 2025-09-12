/**
 * Navbar pública para usuarios no autenticados
 * Navegación contextual inteligente basada en ruta actual
 * Diseño minimalista con logo y links limpios
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@shared/hooks/usePublicNavigation";
import { NexiaLogo } from "@/components/auth/NexiaLogo";


export const PublicNavbar: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hook personalizado para navegación contextual
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
        <nav className="bg-sidebar-header border-b border-gray-800 sticky top-0 z-50">

            <div className="px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center h-32">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                        onClick={closeMobileMenu}
                    >
                        <div className="w-28 h-auto">
                            <NexiaLogo />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
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

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-white hover:text-blue-400 focus:outline-none focus:text-blue-400 transition-colors duration-200"
                            aria-label="Abrir menú"
                        >
                            <svg
                                className="h-6 w-6"
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

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-700 rounded-lg mt-2 mb-2">
                            {visibleNavigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className="block px-3 py-2 text-white hover:text-blue-400 hover:bg-slate-600 rounded-md text-base font-medium transition-colors duration-200"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
