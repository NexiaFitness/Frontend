/**
 * AISection - Layout EXACTO del HeroSection pero imagen izquierda
 * 
 * Estructura 100% copiada de HeroSection:
 * - Sin padding en contenedor de imagen
 * - Sin bordes redondeados 
 * - Imagen ocupa literalmente todo el lado izquierdo
 *
 * @author Frontend Team
 * @since v2.4.3 - Exact HeroSection structure
 */

import React from "react";
import { meshGradient } from "@/utils/backgrounds";
import { TYPOGRAPHY } from "@/utils/typography";

export const AISection: React.FC = () => {
    return (
        <section 
            style={{ background: meshGradient }}
        >
            {/* EXACTO como HeroSection - sin padding en contenedor principal para imagen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[500px]">
                {/* Left: Image Full - EXACTO como HeroSection */}
                <div className="relative h-full min-h-[300px]">
                    <img
                        src="https://res.cloudinary.com/dcpirdjji/image/upload/v1759014559/IA_y_el_deporte_l9jolr.webp"
                        alt="Inteligencia artificial aplicada al entrenamiento deportivo"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right: Content - EXACTO como HeroSection */}
                <div className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 sm:py-16 lg:py-0 lg:justify-start">
                    <div className="space-y-6 max-w-xl text-center lg:text-left">
                        {/* Header */}
                        <div className="space-y-4">
                            <h3 className={`${TYPOGRAPHY.pageTitle} text-slate-800 leading-tight`}>
                                Inteligencia Artificial
                                <br />
                                <span className="text-blue-400">Especializada</span>
                            </h3>
                            
                            <p className={`${TYPOGRAPHY.bodyLarge} text-slate-600 leading-relaxed`}>
                                Mientras otros ofrecen IA genérica, NEXIA desarrolla el primer sistema 
                                de inteligencia artificial diseñado específicamente para entrenadores 
                                profesionales.
                            </p>
                        </div>

                        {/* Three Main AI Features */}
                        <div className="space-y-4">
                            <div>
                                <h4 className={`${TYPOGRAPHY.subtitle} text-slate-800 mb-2 font-semibold`}>
                                    Consultor-IA Científico
                                </h4>
                                <p className={`${TYPOGRAPHY.body} text-slate-600 leading-relaxed`}>
                                    Respuestas instantáneas basadas en estudios de ciencias del deporte.
                                </p>
                            </div>

                            <div>
                                <h4 className={`${TYPOGRAPHY.subtitle} text-slate-800 mb-2 font-semibold`}>
                                    12 Modelos Especializados
                                </h4>
                                <p className={`${TYPOGRAPHY.body} text-slate-600 leading-relaxed`}>
                                    Desde periodización inteligente hasta prevención de lesiones.
                                </p>
                            </div>

                            <div>
                                <h4 className={`${TYPOGRAPHY.subtitle} text-slate-800 mb-2 font-semibold`}>
                                    Automatización Predictiva
                                </h4>
                                <p className={`${TYPOGRAPHY.body} text-slate-600 leading-relaxed`}>
                                    Ajustes automáticos basados en respuesta del cliente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Bar - con padding restaurado solo aquí */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mt-12 lg:mt-16 pb-12 sm:pb-16 lg:pb-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className={`${TYPOGRAPHY.metric} text-slate-800 mb-2`}>Consultor-IA</div>
                        <div className={`${TYPOGRAPHY.metricLabel} text-slate-600`}>
                            Respuestas científicas 24/7
                        </div>
                    </div>
                    <div>
                        <div className={`${TYPOGRAPHY.metric} text-slate-800 mb-2`}>Predictivo</div>
                        <div className={`${TYPOGRAPHY.metricLabel} text-slate-600`}>
                            Ajustes automáticos
                        </div>
                    </div>
                    <div>
                        <div className={`${TYPOGRAPHY.metric} text-slate-800 mb-2`}>Especializado</div>
                        <div className={`${TYPOGRAPHY.metricLabel} text-slate-600`}>
                            Para profesionales del deporte
                        </div>
                    </div>
                    <div>
                        <div className={`${TYPOGRAPHY.metric} text-slate-800 mb-2`}>Integrado</div>
                        <div className={`${TYPOGRAPHY.metricLabel} text-slate-600`}>
                            Entrenamiento + gestión unificados
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};