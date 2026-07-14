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
import { InstallPromptChip, InstallPromptSheet } from "@/components/athlete/pwa";
import { useLandingInstallPrompt } from "@/hooks/athlete/useLandingInstallPrompt";
import { cn } from "@/lib/utils";

const Home: React.FC = () => {
    const {
        isActive: isPwaFunnelActive,
        isSheetOpen: isPwaSheetOpen,
        closeSheet: closePwaSheet,
        openSheet: openPwaSheet,
        platform: pwaPlatform,
        promptInstall,
        showChip: showPwaChip,
    } = useLandingInstallPrompt();

    return (
        <div
            className={cn(
                "min-h-screen",
                showPwaChip && "pb-[calc(2.75rem+1rem+env(safe-area-inset-bottom))]"
            )}
        >
            <main>
                <HeroSection />
                <ProblemSection />
                <FeaturesSection />
                <AISection />
                <FAQSection />
                <ContactSection />
            </main>

            {isPwaFunnelActive && (
                <>
                    {showPwaChip && (
                        <InstallPromptChip variant="landing" onClick={openPwaSheet} />
                    )}
                    <InstallPromptSheet
                        isOpen={isPwaSheetOpen}
                        onClose={closePwaSheet}
                        platform={pwaPlatform}
                        onInstall={promptInstall}
                    />
                </>
            )}
        </div>
    );
};

export default Home;
