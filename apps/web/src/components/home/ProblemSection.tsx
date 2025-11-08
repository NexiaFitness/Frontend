/**
 * ProblemSection - Layout híbrido con imágenes enteras y táctil mejorado
 * 
 * Desktop (lg+): Split screen con hover, click en imagen para cambiar
 * Mobile/Tablet (<lg): Carousel con click/táctil en TODA la imagen
 *
 * Cambios v2.5.0:
 * - Messaging empático sin atacar competencia
 * - Iconos X/✓ alineados a primera línea
 * - Transiciones suaves y armónicas en mobile/tablet
 * - Funcionalidad de click preservada completamente
 * 
 * Buttons no reutilizables, cambiar cuando se normalice el home
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v2.5.0 - Messaging final + UX polish
 */

import React, { useState, useEffect } from "react";
import { TYPOGRAPHY } from "@/utils/typography";

export const ProblemSection: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0); // 0 = Situación Actual, 1 = Con NEXIA
    const [hoveredSection, setHoveredSection] = useState<number | null>(null);

    // Auto-cambio cada 6 segundos (desktop: solo si NO hay hover, mobile: siempre)
    useEffect(() => {
        const interval = setInterval(() => {
            // En desktop, solo cambiar si no hay hover
            if (window.innerWidth >= 1024) {
                if (hoveredSection === null) {
                    setActiveSection(prev => prev === 0 ? 1 : 0);
                }
            } else {
                // En mobile, siempre cambiar
                setActiveSection(prev => prev === 0 ? 1 : 0);
            }
        }, 6000);
        return () => clearInterval(interval);
    }, [hoveredSection]);

    // Determinar qué sección debe estar expandida (solo desktop)
    const expandedSection = hoveredSection !== null ? hoveredSection : activeSection;

    const sections = [
        {
            id: 'situacion-actual',
            image: 'https://res.cloudinary.com/dcpirdjji/image/upload/v1758976238/entrenador-saturadp_pluqzo.webp',
            title: 'Tu Situación Actual',
            subtitle: 'Múltiples herramientas para cada tarea',
            problems: [
                'App para calendarios, otra para pagos, hoja de cálculo para programas',
                'Tiempo perdido cambiando entre diferentes plataformas',
                'Información dispersa dificulta el seguimiento integral'
            ],
            buttonText: 'Ver Cómo Simplificamos',
            theme: 'red'
        },
        {
            id: 'con-nexia',
            image: 'https://res.cloudinary.com/dcpirdjji/image/upload/v1758976233/entrenando_ope6ew.png',
            title: 'Tu Flujo de Trabajo con NEXIA',
            subtitle: 'Todo integrado en una sola plataforma',
            problems: [
                'Programación basada en metodología deportiva',
                'Gestión de clientes y seguimiento en tiempo real',
                'Calendario, pagos y análisis de progreso unificados'
            ],
            buttonText: 'Conocer NEXIA',
            theme: 'blue'
        }
    ];

    return (
        <section className="bg-slate-50">
            {/* Header Estático */}
            <div className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <h2 className={`${TYPOGRAPHY.pageTitle} text-slate-800 mb-6`}>
                        NEXIA para Entrenadores
                    </h2>
                    <h3 className={`${TYPOGRAPHY.sectionTitle} mb-8`} style={{ color: '#4A67B3' }}>
                        Programación y <span className="text-slate-800">Gestión Integradas</span>
                    </h3>
                    <p className={`${TYPOGRAPHY.bodyLarge} text-slate-600 max-w-4xl mx-auto leading-relaxed`}>
                        Una plataforma que combina la creación de programas de entrenamiento con la gestión de tu negocio. 
                        Incluye seguimiento de progreso de atletas, análisis de rendimiento, y todas las herramientas administrativas. 
                        Todo en un lugar, basado en metodología deportiva.
                    </p>
                </div>
            </div>

            {/* DESKTOP: Split Screen con IMG elements (lg+) */}
            <div className="hidden lg:block relative h-[calc(100vh-128px)] w-full overflow-hidden">
                <div className="h-full flex">
                    {/* Situación Actual - Lado Izquierdo */}
                    <div 
                        className={`relative transition-all duration-700 ease-in-out cursor-pointer overflow-hidden ${
                            expandedSection === 0 ? 'w-3/4' : 'w-1/4'
                        }`}
                        onMouseEnter={() => setHoveredSection(0)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => setActiveSection(0)}
                    >
                        {/* Imagen como elemento */}
                        <img
                            src={sections[0].image}
                            alt="Entrenador trabajando con múltiples herramientas"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {/* Overlay más sutil para rojo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-start px-12">
                            <div className={`text-left max-w-2xl transition-all duration-500 ${
                                expandedSection === 0 ? 'opacity-100 translate-x-0' : 'opacity-70 -translate-x-4'
                            }`}>
                                <h4 className={`${TYPOGRAPHY.cardTitle} text-white mb-6 border-l-4 border-red-400 pl-6`}>
                                    {sections[0].title}
                                </h4>
                                
                                <p className={`${TYPOGRAPHY.subtitle} text-red-200 font-light leading-relaxed mb-8 italic`}>
                                    {sections[0].subtitle}
                                </p>
                                
                                <div className="mb-8 space-y-4">
                                    {sections[0].problems.map((problem, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <span className="text-red-400 text-xl leading-none">×</span>
                                            <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed`}>
                                                {problem}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                <button className="border-2 border-red-400 text-white hover:bg-red-400 hover:text-white px-8 py-3 font-semibold transition-all duration-300 uppercase tracking-wide">
                                    {sections[0].buttonText}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Con NEXIA - Lado Derecho */}
                    <div 
                        className={`relative transition-all duration-700 ease-in-out cursor-pointer overflow-hidden ${
                            expandedSection === 1 ? 'w-3/4' : 'w-1/4'
                        }`}
                        onMouseEnter={() => setHoveredSection(1)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => setActiveSection(1)}
                    >
                        {/* Imagen como elemento */}
                        <img
                            src={sections[1].image}
                            alt="Entrenador usando plataforma integrada NEXIA"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {/* Overlay MUCHO más sutil para azul */}
                        <div className="absolute inset-0 bg-gradient-to-l from-blue-900/50 via-blue-900/30 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-end px-12">
                            <div className={`text-right max-w-2xl transition-all duration-500 ${
                                expandedSection === 1 ? 'opacity-100 translate-x-0' : 'opacity-70 translate-x-4'
                            }`}>
                                <h4 className={`${TYPOGRAPHY.cardTitle} text-white mb-6 border-r-4 border-blue-400 pr-6`}>
                                    {sections[1].title}
                                </h4>
                                
                                <p className={`${TYPOGRAPHY.subtitle} text-blue-200 font-light leading-relaxed mb-8 italic`}>
                                    {sections[1].subtitle}
                                </p>
                                
                                <div className="mb-8 space-y-4">
                                    {sections[1].problems.map((solution, index) => (
                                        <div key={index} className="flex items-start space-x-3 justify-end">
                                            <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed text-right`}>
                                                {solution}
                                            </p>
                                            <span className="text-blue-400 text-xl leading-none">✓</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <button className="border-2 border-blue-400 text-white hover:bg-blue-400 hover:text-white px-8 py-3 font-semibold transition-all duration-300 uppercase tracking-wide">
                                    {sections[1].buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicadores desktop */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <div className={`w-16 h-1 transition-all duration-300 ${expandedSection === 0 ? 'bg-red-400' : 'bg-white/30'}`}></div>
                    <div className="w-4 h-1 bg-white/30"></div>
                    <div className={`w-16 h-1 transition-all duration-300 ${expandedSection === 1 ? 'bg-blue-400' : 'bg-white/30'}`}></div>
                </div>
            </div>

            {/* MOBILE/TABLET: Carousel con transiciones suaves y armónicas (hasta lg) */}
            <div className="block lg:hidden relative h-screen w-full overflow-hidden">
                {/* Contenedor clickeable COMPLETO */}
                <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setActiveSection(prev => prev === 0 ? 1 : 0)}
                >
                    {/* Imagen como elemento - transiciones más suaves */}
                    <img
                        src={sections[activeSection].image}
                        alt={sections[activeSection].theme === 'red' 
                            ? "Entrenador trabajando con múltiples herramientas" 
                            : "Entrenador usando plataforma integrada NEXIA"
                        }
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
                    />
                    
                    {/* Overlay MUY sutil en mobile - transición más suave */}
                    <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        sections[activeSection].theme === 'red' 
                            ? 'bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/40'
                            : 'bg-gradient-to-b from-blue-900/40 via-blue-900/20 to-blue-900/30'
                    }`} />
                    
                    <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8">
                        <div className="text-center max-w-lg transition-all duration-500 ease-in-out">
                            <h4 className={`${TYPOGRAPHY.cardTitle} text-white mb-6 border-b-4 pb-4 ${
                                sections[activeSection].theme === 'red' ? 'border-red-400' : 'border-blue-400'
                            }`}>
                                {sections[activeSection].title}
                            </h4>
                            
                            <p className={`${TYPOGRAPHY.subtitle} mb-8 italic font-light leading-relaxed ${
                                sections[activeSection].theme === 'red' ? 'text-red-200' : 'text-blue-200'
                            }`}>
                                {sections[activeSection].subtitle}
                            </p>
                            
                            <div className="mb-8 space-y-4">
                                {sections[activeSection].problems.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <span className={`text-xl leading-none ${
                                            sections[activeSection].theme === 'red' ? 'text-red-400' : 'text-blue-400'
                                        }`}>
                                            {sections[activeSection].theme === 'red' ? '×' : '✓'}
                                        </span>
                                        <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed text-left`}>
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            <button
                                className={`border-2 text-white hover:text-white px-8 py-3 font-semibold transition-all duration-300 uppercase tracking-wide ${
                                    sections[activeSection].theme === 'red' 
                                        ? 'border-red-400 hover:bg-red-400'
                                        : 'border-blue-400 hover:bg-blue-400'
                                }`}
                            >
                                {sections[activeSection].buttonText}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Indicadores clickeables mobile - FUERA del área de imagen */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {sections.map((section, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar doble click
                                setActiveSection(index);
                            }}
                            className={`h-2 transition-all duration-300 ease-in-out ${
                                index === activeSection 
                                    ? `w-16 ${section.theme === 'red' ? 'bg-red-400' : 'bg-blue-400'}` 
                                    : 'w-8 bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};