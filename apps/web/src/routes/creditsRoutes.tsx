/**
 * creditsRoutes.tsx — /creditos, una página y dos shells.
 *
 * Visitante: layout público. Sesión: shell del rol. La página es la misma.
 */

import React from "react";
import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { SessionOrPublicLayout } from "@/routes/SessionOrPublicLayout";

const CreditsPage = lazyWithRetry(() => import("@/pages/CreditsPage"));

export function creditsRoutes(): React.ReactElement {
    return (
        <Route element={<SessionOrPublicLayout />}>
            <Route path="/creditos" element={<CreditsPage />} />
        </Route>
    );
}
