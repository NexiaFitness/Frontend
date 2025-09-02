/**
 * Página de prueba para validar componentes UI
 * Solo para testing de Button, Input, etc. - NO para login
 * Login oficial está en /login
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
            <div className="space-x-4 bg-white/20 backdrop-blur-md p-10 rounded-xl">
                <h2 className="text-2xl font-bold text-primary-400 mb-6">Test UI Components</h2>

                <div className="space-x-4">
                    <Button variant="primary" size="md">
                        Primary Button
                    </Button>
                    <Button variant="secondary" size="md">
                        Secondary Button
                    </Button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-700">
                        Para login ve a: <a href="/login" className="text-primary-400 underline">/login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestUi;