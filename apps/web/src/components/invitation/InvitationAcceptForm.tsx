/**
 * InvitationAcceptForm — aceptar invitación de entrenador (público).
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input, Checkbox } from "@/components/ui/forms";
import { Alert, LoadingSpinner, ServerErrorBanner } from "@/components/ui/feedback";
import {
    AUTH_INPUT_MOBILE,
    AUTH_LINK,
    AUTH_LINK_MUTED,
    AUTH_SUBMIT_MOBILE,
} from "@/components/auth/authFormPresentation";
import { useInvitationAccept, loginSuccess } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import type { User } from "@nexia/shared/types/auth";
import {
    formatInvitationExpiry,
    getInvitationInvalidMessage,
    getInvitationResumeLoginMessage,
} from "./invitationAcceptPresentation";

interface InvitationAcceptFormProps {
    token: string | null;
}

export const InvitationAcceptForm: React.FC<InvitationAcceptFormProps> = ({ token }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const goToLogin = React.useCallback(
        (email: string) => {
            if (!token) return;
            navigate("/auth/login", {
                state: {
                    email,
                    from: `/invitation?token=${encodeURIComponent(token)}`,
                    message: "Inicia sesión con tu cuenta de atleta para aceptar la invitación.",
                },
            });
        },
        [navigate, token],
    );

    const {
        validation,
        isValidating,
        isValidateError,
        isAccepting,
        formData,
        errors,
        serverError,
        clearErrors,
        handleInputChange,
        setCheckbox,
        requiresPassword,
        requiresTrainerSwitch,
        needsLogin,
        wrongAccount,
        requestLogin,
        submitAccept,
    } = useInvitationAccept(token, { onRequiresLogin: goToLogin });

    if (!token) {
        return (
            <div className="space-y-4 text-center">
                <h1 className="text-xl font-bold text-foreground">Invitación no válida</h1>
                <p className="text-sm text-muted-foreground">
                    Falta el enlace de invitación. Revisa el correo que te envió tu entrenador.
                </p>
                <Button variant="outline" onClick={() => navigate("/auth/login")} className="w-full">
                    Ir al inicio de sesión
                </Button>
            </div>
        );
    }

    if (isValidating) {
        return (
            <div className="flex flex-col items-center gap-3 py-8">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">Validando invitación…</p>
            </div>
        );
    }

    if (isValidateError || !validation) {
        return (
            <div className="space-y-4 text-center">
                <h1 className="text-xl font-bold text-foreground">No se pudo validar</h1>
                <p className="text-sm text-muted-foreground">
                    Comprueba tu conexión e inténtalo de nuevo.
                </p>
                <Button variant="outline" onClick={() => navigate("/auth/login")} className="w-full">
                    Ir al inicio de sesión
                </Button>
            </div>
        );
    }

    if (!validation.valid) {
        const message = getInvitationInvalidMessage(validation.reason);
        return (
            <div className="space-y-4 text-center">
                <h1 className="text-xl font-bold text-foreground">Invitación no disponible</h1>
                <Alert variant="error">{message}</Alert>
                <Button variant="primary" onClick={() => navigate("/auth/login")} className="w-full">
                    Iniciar sesión
                </Button>
            </div>
        );
    }

    const expiryLabel = formatInvitationExpiry(validation.expires_at);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const response = await submitAccept();
        if (!response?.user || !response.access_token) return;
        dispatch(
            loginSuccess({
                user: response.user as unknown as User,
                token: response.access_token,
                refreshToken: response.refresh_token,
            }),
        );
        navigate(
            response.requires_onboarding ? "/onboarding/athlete" : "/dashboard",
            { replace: true },
        );
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    Te invita {validation.trainer_name ?? "tu entrenador"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Crea tu cuenta de atleta en NEXIA para vincularte con tu entrenador.
                </p>
                {expiryLabel ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Válida hasta el {expiryLabel}
                    </p>
                ) : null}
            </div>

            {requiresTrainerSwitch ? (
                <Alert variant="warning">
                    {validation.previous_trainer_name
                        ? `Actualmente estás vinculado a ${validation.previous_trainer_name}. Si aceptas, pasarás a entrenar con ${validation.trainer_name ?? "este entrenador"}.`
                        : `Si aceptas, cambiarás de entrenador y quedarás vinculado a ${validation.trainer_name ?? "este entrenador"}.`}
                </Alert>
            ) : null}

            {needsLogin ? (
                <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
                    <p className="text-sm text-foreground">
                        {getInvitationResumeLoginMessage(validation.email ?? "")}
                    </p>
                    <Button type="button" variant="primary" onClick={requestLogin} className="w-full">
                        Iniciar sesión
                    </Button>
                </div>
            ) : null}

            {wrongAccount ? (
                <Alert variant="error">
                    Has iniciado sesión con otra cuenta. Cierra sesión e inicia con{" "}
                    {validation.email}.
                </Alert>
            ) : null}

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            {!needsLogin ? (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <Input
                        type="email"
                        label="Correo electrónico"
                        size="sm"
                        value={validation.email ?? ""}
                        readOnly
                        disabled
                        className={AUTH_INPUT_MOBILE}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            type="text"
                            label="Nombre"
                            size="sm"
                            value={formData.nombre}
                            onChange={handleInputChange("nombre")}
                            error={errors.nombre}
                            placeholder="Tu nombre"
                            isRequired
                            disabled={isAccepting}
                            className={AUTH_INPUT_MOBILE}
                        />
                        <Input
                            type="text"
                            label="Apellidos"
                            size="sm"
                            value={formData.apellidos}
                            onChange={handleInputChange("apellidos")}
                            error={errors.apellidos}
                            placeholder="Opcional"
                            disabled={isAccepting}
                            className={AUTH_INPUT_MOBILE}
                        />
                    </div>

                    {requiresPassword ? (
                        <>
                            <Input
                                type="password"
                                label="Contraseña"
                                size="sm"
                                value={formData.password}
                                onChange={handleInputChange("password")}
                                error={errors.password}
                                placeholder="Crea una contraseña segura"
                                isRequired
                                disabled={isAccepting}
                                className={AUTH_INPUT_MOBILE}
                            />
                            <Input
                                type="password"
                                label="Confirmar contraseña"
                                size="sm"
                                value={formData.confirmPassword}
                                onChange={handleInputChange("confirmPassword")}
                                error={errors.confirmPassword}
                                placeholder="Repite la contraseña"
                                isRequired
                                disabled={isAccepting}
                                className={AUTH_INPUT_MOBILE}
                            />
                        </>
                    ) : null}

                    <Checkbox
                        label="Acepto los términos y condiciones de uso de NEXIA"
                        checked={formData.tosAccepted}
                        onChange={(event) => setCheckbox("tosAccepted", event.target.checked)}
                        error={errors.tosAccepted}
                        isRequired
                        disabled={isAccepting}
                    />

                    {requiresTrainerSwitch ? (
                        <Checkbox
                            label="Entiendo que aceptar implica cambiar de entrenador"
                            checked={formData.confirmTrainerSwitch}
                            onChange={(event) =>
                                setCheckbox("confirmTrainerSwitch", event.target.checked)
                            }
                            error={errors.confirmTrainerSwitch}
                            isRequired
                            disabled={isAccepting}
                        />
                    ) : null}

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isAccepting || wrongAccount}
                        className={AUTH_SUBMIT_MOBILE}
                    >
                        {isAccepting ? "Aceptando…" : "Aceptar invitación"}
                    </Button>
                </form>
            ) : null}

            <p className={AUTH_LINK_MUTED}>
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={requestLogin} className={AUTH_LINK}>
                    Inicia sesión
                </button>
            </p>
        </div>
    );
};
