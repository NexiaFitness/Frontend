/**
 * AthleteSessionRegistrationAlerts.tsx — Avisos plazo / error progress (D-REG-CLOSED-01).
 */

import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import {
    ATHLETE_REGISTRATION_CLOSED_BODY,
    ATHLETE_REGISTRATION_CLOSED_TITLE,
    ATHLETE_REGISTRATION_PROGRESS_ERROR_BODY,
    ATHLETE_REGISTRATION_PROGRESS_ERROR_TITLE,
} from "@/components/athlete/sessions/athleteSessionRegistrationPresentation";

export function AthleteSessionRegistrationAlerts(props: {
    showClosed: boolean;
    showProgressError: boolean;
    onRetryProgress: () => void;
}) {
    const { showClosed, showProgressError, onRetryProgress } = props;
    return (
        <>
            {showClosed ? (
                <Alert
                    variant="warning"
                    title={ATHLETE_REGISTRATION_CLOSED_TITLE}
                    description={ATHLETE_REGISTRATION_CLOSED_BODY}
                />
            ) : null}
            {showProgressError ? (
                <Alert
                    variant="error"
                    title={ATHLETE_REGISTRATION_PROGRESS_ERROR_TITLE}
                    description={ATHLETE_REGISTRATION_PROGRESS_ERROR_BODY}
                    action={
                        <Button variant="secondary" size="sm" onClick={onRetryProgress}>
                            Reintentar
                        </Button>
                    }
                />
            ) : null}
        </>
    );
}
