/**
 * HeroSection para homepage de NEXIA - VERSIÓN FULLSCREEN TEMPORAL
 * 
 * Ocupa toda la altura disponible (como auth pages) para calidad visual inmediata
 * TEMPORAL hasta agregar más secciones (features, testimonials, etc.)
 *
 * - Desktop (≥1024px): layout split-screen 50/50 → texto + imagen
 * - Mobile/Tablet (<1024px): columnas (texto arriba, imagen abajo)
 * - Altura: calc(100vh - 128px) → sin scroll, centrado verticalmente
 *
 * @autor Frontend Team
 * @since v1.0.0
 * @updated v4.3.0 - Typography system integration
 */

import React from "react";
import { Link } from "react-router-dom";
import { meshGradient } from "@/utils/backgrounds";
import { TYPOGRAPHY } from "@/utils/typography";
import { ROUTES } from "@shared/config/constants";
import { Button } from "@/components/ui/buttons/Button";

export const HeroSection: React.FC = () => {
    return (
        <section
            className="h-[calc(100vh-128px)] flex items-stretch"
            style={{ background: meshGradient }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
                {/* Content Left */}
                <div className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 sm:py-16 lg:py-0 lg:justify-start">
                    <div className="space-y-8 max-w-xl text-center lg:text-left">
                        <div className="space-y-6">
                            {/* Main Headline */}
                            <h1 className={`${TYPOGRAPHY.hero} text-slate-800 leading-tight`}>
                                Profesionaliza tu{" "}
                                <span className="block text-blue-400">entrenamiento</span>
                            </h1>
                            
                            {/* Subtitle */}
                            <p className={`${TYPOGRAPHY.heroSubtitle} text-white leading-relaxed max-w-lg mx-auto lg:mx-0 [text-shadow:_2px_2px_12px_rgb(0_0_0_/_80%)] lg:[text-shadow:_1px_1px_6px_rgb(0_0_0_/_40%)]`}>
                                Revoluciona la creación de programas de entrenamiento con la
                                plataforma científica diseñada por profesionales del fitness.
                            </p>
                            
                            {/* Value Proposition */}
                            <p className={`${TYPOGRAPHY.bodyLarge} text-slate-800 max-w-lg mx-auto lg:mx-0`}>
                                Ahorra tiempo, mejora resultados y gestiona tus clientes con
                                herramientas inteligentes basadas en ciencia del deporte.
                            </p>
                        </div>
                        
                        {/* CTA */}
                        <div>
                            <Link to={ROUTES.REGISTER}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                                >
                                    Empezar ahora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Visual Right */}
                <div className="relative h-full min-h-[300px]">
                    <img
                        src="https://res.cloudinary.com/dcpirdjji/image/upload/v1757630415/Imagen_home_ndpgld.webp"
                        alt="Atleta profesional en entrenamiento"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
};