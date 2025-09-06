/**
 * Página de reseteo de contraseña usando arquitectura modular
 * AuthLayout + ResetPasswordForm componentes separados
 * Siguiendo mismos patrones que ForgotPassword.tsx
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm";

export const ResetPassword: React.FC = () => {
    return (
        <AuthLayout>
            <ResetPasswordForm />
        </AuthLayout>
    );
};

export default ResetPassword;