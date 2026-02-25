/**
 * Página principal de NEXIA - Landing page
 * Primera impresión para usuarios no autenticados
 * 
 * Nota: La navbar (AppNavbar) se incluye desde PublicLayout,
 * por lo que no se debe duplicar aquí.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.3.0 - ScientificSection agregada con evidencia real
 */

import React from "react";
import { HeroSection } from "../components/home/HeroSection";
import { ProblemSection } from "../components/home/ProblemSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { AISection } from "../components/home/AISection";
import { FAQSection } from "../components/home/FAQSection";
import { ContactSection } from "../components/home/ContactSection";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen">
            <main>
                {/* 1. Hero Section - Mesh gradient + split screen */}
                <HeroSection />

                {/* 2. Problem Section - Fondo blanco + contraste emocional */}
                <ProblemSection />

                {/* 3. Features Section - Mesh gradient + grid características */}
                <FeaturesSection />

                {/* 4. AI Section - Mesh gradient invertido + roadmap IA */}
                <AISection />

                {/* 5. FAQ Section - Fondo blanco + accordion */}
                <FAQSection />

                {/* 6. Contact Section - Background image + formulario */}
                <ContactSection />
            </main>
        </div>
    );
};

export default Home;