/**
 * AdminDashboardWidget.tsx — Contenedor glass con skeleton / error aislado.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import {
    ADMIN_DASHBOARD_COPY,
    ADMIN_DASHBOARD_WIDGET,
    ADMIN_DASHBOARD_WIDGET_SKELETON,
    ADMIN_DASHBOARD_WIDGET_TITLE,
} from "./adminDashboardPresentation";

export interface AdminDashboardWidgetProps {
    title: string;
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
    children: React.ReactNode;
    "data-testid"?: string;
}

export const AdminDashboardWidget: React.FC<AdminDashboardWidgetProps> = ({
    title,
    isLoading = false,
    isError = false,
    onRetry,
    children,
    "data-testid": testId,
}) => {
    return (
        <section className={ADMIN_DASHBOARD_WIDGET} data-testid={testId}>
            <NexiaGlassAccentRim />
            <h2 className={ADMIN_DASHBOARD_WIDGET_TITLE}>{title}</h2>
            {isLoading ? <div className={ADMIN_DASHBOARD_WIDGET_SKELETON} /> : null}
            {!isLoading && isError ? (
                <Alert
                    variant="error"
                    action={
                        onRetry ? (
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={onRetry}
                            >
                                {ADMIN_DASHBOARD_COPY.retry}
                            </Button>
                        ) : undefined
                    }
                >
                    {ADMIN_DASHBOARD_COPY.loadError}
                </Alert>
            ) : null}
            {!isLoading && !isError ? children : null}
        </section>
    );
};
