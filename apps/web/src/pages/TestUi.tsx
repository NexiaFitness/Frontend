/**
 * Página de prueba para validar el Button de ui-web
 * Comprueba que Tailwind, aliases y build de ui-web funcionan correctamente
 * Prueba del mesh gradient para NEXIA
 * 
 * @author Frontend
 * @since v1.0.0
 */

import React from "react";
import { Button } from "@nexia/ui-web";

const TestUi: React.FC = () => {
  const meshGradientStyle = {
    background: `
        radial-gradient(130% 130% at 0% 100%, #56E0DB 0%, rgba(86,224,219,0) 80%),
        radial-gradient(120% 120% at 100% 150%, #0a8bdcff 0%, rgba(93,174,224,0) 85%),
        radial-gradient(50% 50% at 0% 0%, #94E3DF 0%, rgba(148,227,223,0) 75%),
        radial-gradient(200% 400% at 100% 0%, #FFECE3 0%, rgba(255,236,227,0) 90%),
        radial-gradient(150% 150% at 60% 30%, #7ECFDE 0%, rgba(126,207,222,0) 80%),
        #F0F4F5
    `
};


    return (
        <div 
            className="min-h-screen flex items-center justify-center"
            style={meshGradientStyle}
        >
           <div className="space-x-4 bg-red-500 p-10 rounded-xl">
    <Button variant="primary" size="md">
        Primary Button
    </Button>
    <Button variant="secondary" size="md">
        Secondary Button
    </Button>
</div>

        </div>
    );
};

export default TestUi;