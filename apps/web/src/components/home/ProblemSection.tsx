/**
 * ProblemSection - Layout híbrido con overlays sutiles y click en imágenes
 * 
 * Desktop (lg+): Split screen con hover, click en imagen para cambiar
 * Mobile/Tablet (<lg): Carousel con overlays más sutiles, click en imagen
 *
 * Correcciones:
 * - Overlays más sutiles (especialmente azul)
 * - Click en imagen para cambiar slide/sección
 * - Mejor legibilidad en mobile/tablet
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v2.2.2 - Overlays sutiles + click en imágenes
 */

import React, { useState, useEffect } from "react";
import { TYPOGRAPHY } from "@/utils/typography";
import { Button } from "@/components/ui/buttons/Button";

export const ProblemSection: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0); // 0 = Problema, 1 = Solución
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
            id: 'problema',
            image: 'https://res.cloudinary.com/dcpirdjji/image/upload/v1758976238/entrenador-saturadp_pluqzo.webp',
            title: 'El Problema Actual',
            subtitle: 'La gestión tradicional no es suficiente para avanzar',
            problems: [
                'Calendarios que no se ajustan a tus necesidades reales',
                'Herramientas que gestionan lo básico, pero no el entrenamiento completo',
                'Métodos tradicionales frente a una programación basada en ciencia'
            ],
            buttonText: 'Ver Limitaciones Actuales',
            theme: 'red'
        },
        {
            id: 'solucion',
            image: 'https://res.cloudinary.com/dcpirdjji/image/upload/v1758976233/entrenando_ope6ew.png',
            title: 'La Solución NEXIA',
            subtitle: 'Profesionalización basada en ciencia',
            problems: [
                'Programas basados en miles de estudios científicos',
                'IA diseñada para optimizar tu entrenamiento',
                'Todo en uno: entrenamiento, gestión y ciencia'
            ],
            buttonText: 'Descubrir NEXIA',
            theme: 'blue'
        }
    ];

    return (
        <section className="bg-slate-50">
            {/* Header Estático */}
            <div className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <h2 className={`${TYPOGRAPHY.pageTitle} text-slate-800 mb-6`}>
                        El Problema con las Soluciones Actuales
                    </h2>
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-blue-400 mb-8`}>
                        La Gestión <span className="text-slate-800">No Es Suficiente</span>
                    </h3>
                    <p className={`${TYPOGRAPHY.bodyLarge} text-slate-600 max-w-4xl mx-auto leading-relaxed`}>
                        Los profesionales del fitness merecen más que herramientas básicas. 
                        Con NEXIA, obtienes una plataforma completa que entiende la ciencia detrás del entrenamiento efectivo.
                    </p>
                </div>
            </div>

            {/* DESKTOP: Split Screen Original (lg+) */}
            <div className="hidden lg:block relative h-[calc(100vh-128px)] w-full overflow-hidden">
                <div className="h-full flex">
                    {/* Problema - Lado Izquierdo */}
                    <div 
                        className={`relative transition-all duration-700 ease-in-out cursor-pointer ${
                            expandedSection === 0 ? 'w-3/4' : 'w-1/4'
                        }`}
                        onMouseEnter={() => setHoveredSection(0)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => setActiveSection(0)}
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url('${sections[0].image}')` }}
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
                                        <div key={index} className="flex items-center space-x-3">
                                            <span className="text-red-400 text-xl">×</span>
                                            <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed`}>
                                                {problem}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-red-400 text-white hover:bg-red-400 hover:text-white uppercase tracking-wide"
                                >
                                    {sections[0].buttonText}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Solución - Lado Derecho */}
                    <div 
                        className={`relative transition-all duration-700 ease-in-out cursor-pointer ${
                            expandedSection === 1 ? 'w-3/4' : 'w-1/4'
                        }`}
                        onMouseEnter={() => setHoveredSection(1)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => setActiveSection(1)}
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url('${sections[1].image}')` }}
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
                                        <div key={index} className="flex items-center space-x-3 justify-end">
                                            <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed text-right`}>
                                                {solution}
                                            </p>
                                            <span className="text-blue-400 text-xl">✓</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-blue-400 text-white hover:bg-blue-400 hover:text-white uppercase tracking-wide"
                                >
                                    {sections[1].buttonText}
                                </Button>
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

            {/* MOBILE/TABLET: Carousel (hasta lg) */}
            <div className="block lg:hidden relative h-screen w-full overflow-hidden">
                {/* Imagen clickeable */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 cursor-pointer"
                    style={{ backgroundImage: `url('${sections[activeSection].image}')` }}
                    onClick={() => setActiveSection(prev => prev === 0 ? 1 : 0)}
                />
                
                {/* Overlay MUY sutil en mobile */}
                <div className={`absolute inset-0 transition-all duration-1000 ${
                    sections[activeSection].theme === 'red' 
                        ? 'bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/40'
                        : 'bg-gradient-to-b from-blue-900/40 via-blue-900/20 to-blue-900/30'
                }`} />
                
                <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8">
                    <div className="text-center max-w-lg transition-all duration-500">
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
                                <div key={index} className="flex items-center justify-center space-x-3">
                                    <span className={`text-xl ${
                                        sections[activeSection].theme === 'red' ? 'text-red-400' : 'text-blue-400'
                                    }`}>
                                        {sections[activeSection].theme === 'red' ? '×' : '✓'}
                                    </span>
                                    <p className={`${TYPOGRAPHY.body} text-white/90 leading-relaxed`}>
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        <Button
                            variant="outline"
                            size="lg"
                            className={`border-2 text-white hover:text-white uppercase tracking-wide ${
                                sections[activeSection].theme === 'red' 
                                    ? 'border-red-400 hover:bg-red-400'
                                    : 'border-blue-400 hover:bg-blue-400'
                            }`}
                        >
                            {sections[activeSection].buttonText}
                        </Button>
                    </div>
                </div>

                {/* Indicadores clickeables mobile */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {sections.map((section, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSection(index)}
                            className={`h-2 transition-all duration-300 ${
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
