/**
 * Página de recuperación de contraseña usando arquitectura modular
 * AuthLayout + ForgotPasswordForm componentes separados
 * Siguiendo mismos patrones que Login.tsx y Register.tsx
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";

export const ForgotPassword: React.FC = () => {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPassword;