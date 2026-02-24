/**
 * FeaturesSection - Grid de 6 características con layout horizontal
 * 
 * Cards horizontales más anchas que altas, sin emojis innecesarios.
 * Efectos visuales inspirados en Emergent: overlays, hover effects.
 *
 * Layout:
 * - Desktop: Grid 2x3 con cards horizontales (imagen izq + contenido der)
 * - Tablet: Grid 1x6 vertical
 * - Mobile: Grid 1x6 (stack vertical)
 * - Fondo: meshGradient normal para alternancia visual
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v2.1.1 - Layout horizontal, sin emoji cohete
 */

import React from "react";

interface FeatureCard {
    title: string;
    description: string;
    image: string;
    alt: string;
}

const features: FeatureCard[] = [
    {
        title: "Planificación Científica de Periodización",
        description: "Periodización multinivel del entrenamiento desde macrociclos anuales hasta microciclos semanales, respaldada por investigación en ciencias del deporte.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009018/planificacion_cientifica_sesbnp.webp",
        alt: "Dashboard científico de planificación de entrenamiento con fases de periodización"
    },
    {
        title: "Programación de Ejercicios con IA",
        description: "Selección inteligente de ejercicios y progresión basada en biomecánica, gestión de cargas y principios de adaptación.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009110/haciendo_ejercicio_IA_w0s1ir.webp",
        alt: "Atleta entrenando con análisis de IA y métricas biomecánicas en tiempo real"
    },
    {
        title: "Recomendaciones Basadas en Evidencia",
        description: "Recomendaciones de entrenamiento derivadas de investigación peer-reviewed, no solo intuición o tradición.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009226/entrenamiento_b0retp.webp",
        alt: "Sesión de entrenamiento profesional en gimnasio moderno con equipamiento científico"
    },
    {
        title: "Panel de Analíticas Avanzadas",
        description: "Seguimiento del progreso del cliente en tiempo real con métricas científicas incluyendo RPE, carga de volumen y tasas de adaptación.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009330/panel_analiticas-avanzadas_1_y4gr6r.webp",
        alt: "Visualización holográfica de métricas corporales y datos de rendimiento deportivo"
    },
    {
        title: "Gestión Empresarial Completa",
        description: "Programación, pagos y gestión de clientes integrados de forma fluida con la programación de entrenamientos.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009422/gestion_empresarial_nut2qz.webp",
        alt: "Entrenadora profesional gestionando clientes con tablet en gimnasio moderno"
    },
    {
        title: "Gestión Inteligente de Cargas",
        description: "Cálculos automáticos de carga de entrenamiento y monitorización de fatiga para prevenir sobreentrenamiento y optimizar el rendimiento.",
        image: "https://res.cloudinary.com/dcpirdjji/image/upload/v1759009489/gestion_cargas_ektk6l.png",
        alt: "Interfaz holográfica mostrando análisis de carga de entrenamiento y fatiga muscular"
    }
];

export const FeaturesSection: React.FC = () => {
    return (
        <section 
            className="py-16 sm:py-20 lg:py-24 bg-background"
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="text-center mb-16">
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                        La Ciencia Se Encuentra
                        <br />
                        <span className="text-primary">con la Gestión Empresarial</span>
                    </h3>
                    <p className="text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        La primera plataforma que integra de forma fluida programación de entrenamiento 
                        basada en evidencia con herramientas completas de gestión empresarial.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="group bg-card border border-border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1"
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                                    {/* backgroundImage inline: URL dinámico por feature (runtime). */}
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${feature.image}')` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r md:bg-gradient-to-r from-card/60 via-transparent to-transparent md:from-transparent md:to-card/80" />
                                </div>
                                <div className="relative md:w-3/5 p-6 bg-card flex flex-col justify-center">
                                    <h4 className="text-lg font-semibold text-foreground mb-4 transition-colors duration-300 group-hover:text-primary">
                                        {feature.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">6+</div>
                        <div className="text-sm text-muted-foreground">Características Principales</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">2.500+</div>
                        <div className="text-sm text-muted-foreground">Estudios Analizados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">50+</div>
                        <div className="text-sm text-muted-foreground">Variables Monitorizadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">12</div>
                        <div className="text-sm text-muted-foreground">Modelos de IA</div>
                    </div>
                </div>
            </div>
        </section>
    );
};