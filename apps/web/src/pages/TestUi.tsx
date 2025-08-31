/**
 * Página de prueba para validar el Button de ui-web
 * Comprueba que Tailwind, aliases y build de ui-web funcionan correctamente
 * 
 * @author Frontend
 * @since v1.0.0
 */

import React from "react";
import { Button } from "@nexia/ui-web";

const TestUi: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="space-x-4">
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
