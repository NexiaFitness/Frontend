/**
 * Página principal de NEXIA - Landing page
 * Primera impresión para usuarios no autenticados
 * 
 * Nota: La PublicNavbar ya se incluye automáticamente desde PublicLayout,
 * por lo que no se debe duplicar aquí.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { HeroSection } from "../components/home/HeroSection";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen">
            {/* Contenido principal */}
            <main>
                <HeroSection />

                {/* Futuras secciones */}
                {/* <FeaturesSection /> */}
                {/* <TestimonialsSection /> */}
                {/* <PricingSection /> */}
                {/* <CTASection /> */}
                {/* <Footer /> */}
            </main>
        </div>
    );
};

export default Home;
