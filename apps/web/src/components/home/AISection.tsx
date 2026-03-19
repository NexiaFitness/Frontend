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

export const AISection: React.FC = () => {
    return (
        <section className="bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[500px]">
                <div className="relative h-full min-h-[300px]">
                    <img
                        src="https://res.cloudinary.com/dcpirdjji/image/upload/v1759014559/IA_y_el_deporte_l9jolr.webp"
                        alt="Inteligencia artificial aplicada al entrenamiento deportivo"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 sm:py-16 lg:py-0 lg:justify-start">
                    <div className="space-y-6 max-w-xl text-center lg:text-left">
                        <div className="space-y-4">
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                                Inteligencia Artificial
                                <br />
                                <span className="text-primary">Especializada</span>
                            </h3>
                            
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Mientras otros ofrecen IA genérica, NEXIA desarrolla el primer sistema 
                                de inteligencia artificial diseñado específicamente para entrenadores 
                                profesionales.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-foreground mb-2">
                                    Consultor-IA Científico
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Respuestas instantáneas basadas en estudios de ciencias del deporte.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-foreground mb-2">
                                    12 Modelos Especializados
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Desde periodización inteligente hasta prevención de lesiones.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-foreground mb-2">
                                    Automatización Predictiva
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Ajustes automáticos basados en respuesta del cliente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mt-12 lg:mt-16 pb-12 sm:pb-16 lg:pb-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-lg font-semibold text-foreground mb-2">Consultor-IA</div>
                        <div className="text-sm text-muted-foreground">
                            Respuestas científicas 24/7
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground mb-2">Predictivo</div>
                        <div className="text-sm text-muted-foreground">
                            Ajustes automáticos
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground mb-2">Especializado</div>
                        <div className="text-sm text-muted-foreground">
                            Para profesionales del deporte
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground mb-2">Integrado</div>
                        <div className="text-sm text-muted-foreground">
                            Entrenamiento + gestión unificados
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};