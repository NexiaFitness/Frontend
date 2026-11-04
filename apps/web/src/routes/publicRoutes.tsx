/**
 * publicRoutes.tsx — Rutas del layout público.
 *
 * Extraídas de App.tsx (H5, agent.md §7.1): ese archivo ya pasaba de 600 líneas
 * y no puede crecer. Créditos no va aquí; elige el shell según haya sesión.
 */

import React from "react";
import { Navigate, Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { PublicLayout } from "@/components/ui/layout/PublicLayout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

const ForgotPassword = lazyWithRetry(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("@/pages/auth/ResetPassword"));
const VerifyEmail = lazyWithRetry(() => import("@/pages/auth/VerifyEmail"));
const InvitationAcceptPage = lazyWithRetry(() => import("@/pages/invitation/InvitationAcceptPage"));

export function publicRoutes(isAuthenticated: boolean): React.ReactElement {
    return (
        <Route element={<PublicLayout />}>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
            />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/invitation" element={<InvitationAcceptPage />} />
        </Route>
    );
}
