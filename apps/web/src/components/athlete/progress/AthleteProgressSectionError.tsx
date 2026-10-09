/**
 * AthleteProgressSectionError.tsx — Aviso de sección secundaria con reintento.
 * @author Frontend Team
 * @since v1.0.3
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";

export interface AthleteProgressSectionErrorProps {
    title: string;
    description?: string;
    onRetry: () => void;
}

export const AthleteProgressSectionError: React.FC<AthleteProgressSectionErrorProps> = ({
    title,
    description,
    onRetry,
}) => {
    return (
        <Alert
            variant="warning"
            compact
            title={title}
            description={description}
            action={
                <Button type="button" variant="ghost" onClick={onRetry}>
                    Reintentar
                </Button>
            }
        />
    );
};
