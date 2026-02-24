/**
 * FAQSection - Preguntas frecuentes profesionales
 * 
 * 8 preguntas estratégicas que responden objeciones reales:
 * - Diferenciación sin mencionar competidores
 * - Timeline honesto del proyecto
 * - Funcionalidad actual vs futura
 * - Accordion interactivo simple
 * - Fondo blanco para alternancia
 *
 * @author Frontend Team
 * @since v2.5.0 - Professional FAQ implementation
 */

import React, { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "¿En qué se diferencia NEXIA de otras plataformas de gestión?",
        answer: "NEXIA es la primera plataforma que combina gestión empresarial completa con programación científica de entrenamiento. Mientras otras se enfocan solo en calendarios y pagos, nosotros integramos periodización multinivel, gestión de cargas y algoritmos basados en ciencias del deporte."
    },
    {
        question: "¿Cuándo estará disponible la plataforma?",
        answer: "El MVP con funcionalidades core estará disponible en Q1 2025. Esto incluye gestión de clientes, programación de entrenamientos y periodización científica. Las funcionalidades de IA avanzada se desarrollarán durante 2026."
    },
    {
        question: "¿Funciona para todos los tipos de entrenadores?",
        answer: "NEXIA está diseñado específicamente para entrenadores personales profesionales que buscan aplicar metodología científica en sus programas. Es ideal para profesionales que quieren ir más allá de la gestión básica y ofrecer programación basada en evidencia."
    },
    {
        question: "¿Necesito conocimientos técnicos para usar NEXIA?",
        answer: "No necesitas conocimientos técnicos avanzados. La interfaz está diseñada para ser intuitiva, y toda la ciencia se aplica automáticamente tras bambalinas. Solo necesitas entender los principios básicos del entrenamiento que ya manejas como profesional."
    },
    {
        question: "¿Cuánto costará la suscripción?",
        answer: "Los precios finales están por confirmarse. Los usuarios que se unan al acceso anticipado tendrán descuentos especiales y pricing preferencial. El modelo será por suscripción mensual con diferentes tiers según las funcionalidades necesarias."
    },
    {
        question: "¿La inteligencia artificial estará disponible desde el lanzamiento?",
        answer: "El MVP incluirá algoritmos inteligentes para periodización y gestión de cargas. El Consultor-IA completo y los 12 modelos especializados se desarrollarán progresivamente durante 2026, empezando con los más críticos para la programación."
    },
    {
        question: "¿Puedo importar mis clientes y datos actuales?",
        answer: "Sí, la plataforma incluirá herramientas de importación para migrar tus clientes actuales desde hojas de cálculo o otras plataformas. También tendremos soporte dedicado para ayudarte en el proceso de migración sin perder información."
    },
    {
        question: "¿Habrá soporte técnico y entrenamiento?",
        answer: "Absolutamente. Incluiremos onboarding personalizado, documentación completa y soporte técnico directo. Como es una plataforma profesional, entendemos que necesitas asistencia especializada, no solo chatbots genéricos."
    }
];

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h3 className={`${TYPOGRAPHY.pageTitle} text-slate-800 mb-8`}>
                        Preguntas
                        <br />
                        <span style={{ color: '#4A67B3' }}>Frecuentes</span>
                    </h3>
                    <p className={`${TYPOGRAPHY.bodyLarge} text-slate-600 max-w-3xl mx-auto leading-relaxed`}>
                        Respuestas directas a las dudas más comunes sobre NEXIA y cómo puede 
                        profesionalizar tu práctica como entrenador.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div 
                            key={index}
                            className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                                openIndex === index ? 'border-primary' : 'border-border'
                            }`}
                            onMouseEnter={(e) => {
                                if (openIndex !== index) {
                                    e.currentTarget.classList.remove('border-border');
                                    e.currentTarget.classList.add('border-primary');
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (openIndex !== index) {
                                    e.currentTarget.classList.remove('border-primary');
                                    e.currentTarget.classList.add('border-border');
                                }
                            }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 text-left bg-muted hover:bg-muted/80 transition-colors duration-200 flex justify-between items-center"
                            >
                                <span className="text-sm font-semibold text-foreground pr-4">
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 transition-transform duration-200 ${
                                    openIndex === index ? 'rotate-180' : 'rotate-0'
                                }`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                </div>
                            </button>
                            
                            <div className={`transition-all duration-200 overflow-hidden ${
                                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="px-6 py-5 bg-white">
                                    <p className={`${TYPOGRAPHY.body} text-slate-600 leading-relaxed`}>
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Call to Action */}
                <div className="mt-16 text-center">
                    <p className="text-base text-muted-foreground mb-4">
                        ¿No encuentras la respuesta que buscas?
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                        Contacta directamente con nuestro equipo para resolver cualquier duda específica 
                        sobre tu caso de uso o necesidades particulares.
                    </p>
                </div>
            </div>
        </section>
    );
};