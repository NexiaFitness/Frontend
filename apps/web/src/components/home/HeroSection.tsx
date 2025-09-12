/**
 * HeroSection para homepage de NEXIA
 * Sección principal con value proposition y CTAs hacia registro
 * Layout split-screen consistent con sistema de diseño auth
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { meshGradient } from '@/utils/backgrounds';
import { ROUTES } from '@shared/config/constants';
import { Button } from '@/components/ui/buttons/Button';

export const HeroSection: React.FC = () => {
    return (
        <section 
            className="min-h-[800px]"
            style={{ background: meshGradient }}
        >
            <div className="grid lg:grid-cols-2 h-full min-h-[800px]">
                
                {/* Content Left */}
                <div className="flex items-center px-8 lg:px-20">
                    <div className="space-y-8">
                        <div className="space-y-6">
                            {/* Main Headline */}
                            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                                Profesionaliza tu 
                                <span className="block text-blue-400">
                                    entrenamiento
                                </span>
                            </h1>
                            
                            {/* Subtitle */}
                            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-lg">
                                Revoluciona la creación de programas de entrenamiento 
                                con la plataforma científica diseñada por profesionales 
                                del fitness.
                            </p>
                            
                            {/* Value Proposition */}
                            <p className="text-lg text-slate-800">
                                Ahorra tiempo, mejora resultados y gestiona tus clientes 
                                con herramientas inteligentes basadas en ciencia del deporte.
                            </p>
                        </div>

                        {/* CTA */}
                        <div>
                            <Link to={ROUTES.REGISTER}>
                                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                                    Empezar ahora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Visual Right */}
               {/* Visual Right */}
<div className="relative h-full min-h-[800px]">
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