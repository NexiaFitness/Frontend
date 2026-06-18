/**
 * HeroSection para homepage de NEXIA - VERSIÓN FULLSCREEN ESTABLE
 * 
 * Corregido layout para evitar superposición con secciones siguientes
 * MANTIENE diseño visual exacto, solo arregla arquitectura de layout
 *
 * - Desktop (≥1024px): layout split-screen 50/50 → texto + imagen
 * - Mobile/Tablet (<1024px): columnas (texto arriba, imagen abajo)
 * - Altura: min-h-[calc(100vh-128px)] → centrado verticalmente SIN desbordamiento
 *
 * @autor Frontend Team
 * @since v1.0.0
 * @updated v4.4.0 - Layout architecture fix, diseño visual preservado
 */

import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@nexia/shared/config/constants";
import { Button } from "@/components/ui/buttons/Button";

export const HeroSection: React.FC = () => {
    return (
        <section
            className="min-h-[calc(100vh-128px)] overflow-hidden bg-background"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full min-h-[calc(100vh-128px)]">
                {/* Content Left */}
                <div className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 sm:py-16 lg:py-0 lg:justify-start">
                    <div className="space-y-8 max-w-xl text-center lg:text-left">
                        <div className="space-y-6">
                            {/* Main Headline */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                                Profesionaliza tu{" "}
                                <span className="block text-primary">entrenamiento</span>
                            </h1>
                            
                            {/* Subtitle */}
                            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Revoluciona la creación de programas de entrenamiento con una
                                plataforma pensada para profesionales del fitness.
                            </p>
                            
                            {/* Value Proposition */}
                            <p className="text-base text-foreground max-w-lg mx-auto lg:mx-0">
                                Ahorra tiempo, mejora resultados y gestiona tus clientes con
                                herramientas claras y eficientes.
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
                
                {/* Visual Right — premium mobile frame + vignette desktop */}
                <div className="relative flex min-h-[280px] items-stretch px-4 pb-10 sm:px-8 lg:min-h-[calc(100vh-128px)] lg:px-0 lg:pb-0">
                    <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 shadow-[0_20px_50px_-20px] shadow-black/55 lg:min-h-[calc(100vh-128px)] lg:rounded-none lg:border-0 lg:shadow-none">
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-2xl lg:rounded-none"
                            aria-hidden
                        >
                            <div className="h-4 bg-gradient-to-b from-primary/20 to-transparent lg:from-primary/10" />
                            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent shadow-[0_0_12px_1px] shadow-primary/25" />
                        </div>
                        <img
                            src="https://res.cloudinary.com/dcpirdjji/image/upload/v1757630415/Imagen_home_ndpgld.webp"
                            alt="Atleta profesional en entrenamiento"
                            className="h-full min-h-[280px] w-full object-cover lg:min-h-[calc(100vh-128px)]"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent lg:from-background/70 lg:via-background/15"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/10 lg:ring-0"
                            aria-hidden
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};