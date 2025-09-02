/**
 * Página de login usando arquitectura modular
 * AuthLayout + LoginForm componentes separados
 * 
 * @author Frontend Team
 * @since v1.0.0
 */
import React from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";

export const Login: React.FC = () => {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
};

export default Login;