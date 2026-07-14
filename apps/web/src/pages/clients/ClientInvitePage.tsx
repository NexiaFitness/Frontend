/**
 * ClientInvitePage — invitar atleta (glass atleta §6.7, mobile-first + desktop lg+).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info, Mail, UserPlus } from "lucide-react";
import { useClientInvite } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AUTH_INPUT_MOBILE } from "@/components/auth/authFormPresentation";
import {
    CLIENT_INVITE_ACTIONS,
    CLIENT_INVITE_ASIDE,
    CLIENT_INVITE_BACK_LINK,
    CLIENT_INVITE_BODY,
    CLIENT_INVITE_FIELD_FULL,
    CLIENT_INVITE_FIELDS_GRID,
    CLIENT_INVITE_GLASS_CARD,
    CLIENT_INVITE_MAIN,
    CLIENT_INVITE_PAGE,
    CLIENT_INVITE_PAGE_GLOW,
    CLIENT_INVITE_SECTION_LABEL,
    CLIENT_INVITE_SUBMIT,
    CLIENT_INVITE_SUBMIT_DESKTOP,
    CLIENT_INVITE_SUCCESS_CARD,
    CLIENT_INVITE_TIP_BLOCK,
    CLIENT_INVITE_TIPS_CARD,
    TrainerTransferAckModal,
} from "@/components/clients/invitations";

export const ClientInvitePage: React.FC = () => {
    const navigate = useNavigate();
    const {
        values,
        setField,
        isSubmitting,
        errorMessage,
        pendingWarnings,
        showTransferModal,
        confirmTransferAndSend,
        dismissTransferModal,
        submitInvite,
        resendBlockedInvitation,
        blockedInvitationId,
        lastInvitation,
        resetSuccess,
    } = useClientInvite();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await submitInvite();
    };

    const handleTransferConfirm = async () => {
        await confirmTransferAndSend();
    };

    const handleBackToList = () => {
        resetSuccess();
        navigate("/dashboard/clients");
    };

    if (lastInvitation) {
        return (
            <div className={CLIENT_INVITE_PAGE}>
                <div
                    className={CLIENT_INVITE_PAGE_GLOW}
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 60% at 15% 10%, hsl(190 100% 50% / 0.1) 0%, transparent 55%)",
                    }}
                    aria-hidden
                />
                <button
                    type="button"
                    onClick={handleBackToList}
                    className={CLIENT_INVITE_BACK_LINK}
                >
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                    Volver a clientes
                </button>

                <div className={`${CLIENT_INVITE_SUCCESS_CARD} mt-6 lg:mt-8 lg:max-w-2xl`}>
                    <NexiaGlassAccentRim />
                    <div className="relative space-y-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
                            <Mail className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-foreground lg:text-2xl">
                                Invitación enviada
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                                Hemos enviado un enlace a{" "}
                                <span className="font-medium text-foreground">{lastInvitation.email}</span>.
                                Aparecerá en tu lista como «Pendiente de aceptar» hasta que el atleta acepte.
                            </p>
                        </div>
                        <div className={`${CLIENT_INVITE_ACTIONS} pt-2`}>
                            <Button
                                variant="primary"
                                onClick={handleBackToList}
                                className={`${CLIENT_INVITE_SUBMIT} ${CLIENT_INVITE_SUBMIT_DESKTOP}`}
                            >
                                Volver a clientes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetSuccess();
                                }}
                                className="min-h-touch lg:min-h-0"
                            >
                                Invitar a otro
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={CLIENT_INVITE_PAGE}>
                <div
                    className={CLIENT_INVITE_PAGE_GLOW}
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 60% at 15% 10%, hsl(190 100% 50% / 0.1) 0%, transparent 55%)",
                    }}
                    aria-hidden
                />

                <button
                    type="button"
                    onClick={() => navigate("/dashboard/clients")}
                    className={CLIENT_INVITE_BACK_LINK}
                >
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                    Volver
                </button>

                <header className="mb-6 mt-5 space-y-2 lg:mb-8 lg:mt-6">
                    <p className={CLIENT_INVITE_SECTION_LABEL}>Nuevo atleta</p>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
                        Invitar atleta
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
                        Nombre y correo. El atleta recibirá un enlace para crear su cuenta y completar su
                        perfil.
                    </p>
                </header>

                <div className={CLIENT_INVITE_BODY}>
                    <form onSubmit={handleSubmit} className={CLIENT_INVITE_MAIN}>
                        <div className={CLIENT_INVITE_GLASS_CARD}>
                            <NexiaGlassAccentRim />
                            <div className="relative space-y-5">
                                <div className={CLIENT_INVITE_FIELDS_GRID}>
                                    <div className={`space-y-2 ${CLIENT_INVITE_FIELD_FULL}`}>
                                        <label
                                            htmlFor="invite-nombre"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Nombre <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="invite-nombre"
                                            type="text"
                                            value={values.nombre}
                                            onChange={(event) => setField("nombre", event.target.value)}
                                            placeholder="Ej: Juan"
                                            autoComplete="given-name"
                                            required
                                            className={AUTH_INPUT_MOBILE}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="invite-apellidos"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Apellidos{" "}
                                            <span className="text-muted-foreground">(opcional)</span>
                                        </label>
                                        <Input
                                            id="invite-apellidos"
                                            type="text"
                                            value={values.apellidos}
                                            onChange={(event) => setField("apellidos", event.target.value)}
                                            placeholder="Ej: Pérez"
                                            autoComplete="family-name"
                                            className={AUTH_INPUT_MOBILE}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="invite-email"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Correo electrónico{" "}
                                            <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            value={values.email}
                                            onChange={(event) => setField("email", event.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            autoComplete="email"
                                            required
                                            className={AUTH_INPUT_MOBILE}
                                        />
                                    </div>
                                </div>

                                {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

                                {blockedInvitationId ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            void resendBlockedInvitation();
                                        }}
                                        className="min-h-touch w-full lg:min-h-0 lg:w-auto"
                                    >
                                        {isSubmitting ? "Reenviando…" : "Reenviar invitación"}
                                    </Button>
                                ) : null}

                                <div className={CLIENT_INVITE_ACTIONS}>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className={`${CLIENT_INVITE_SUBMIT} ${CLIENT_INVITE_SUBMIT_DESKTOP}`}
                                    >
                                        {isSubmitting ? "Enviando…" : "Enviar invitación"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/dashboard/clients")}
                                        className="min-h-touch lg:min-h-0"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <aside className={CLIENT_INVITE_ASIDE} aria-label="Información sobre la invitación">
                        <div className={CLIENT_INVITE_TIPS_CARD}>
                            <NexiaGlassAccentRim />
                            <div className="relative space-y-4">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="size-4 text-primary" aria-hidden />
                                    <h2 className={CLIENT_INVITE_SECTION_LABEL}>Qué ocurre después</h2>
                                </div>
                                <div className={CLIENT_INVITE_TIP_BLOCK}>
                                    <p className="text-sm leading-relaxed text-foreground">
                                        El atleta recibe un email con enlace seguro (7 días). En tu lista
                                        verás «Pendiente de aceptar» hasta que confirme.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Info className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
                                    <p className="leading-relaxed">
                                        Si no llega el correo, revisa spam. Puedes reenviar o cancelar desde
                                        la tarjeta del cliente. El nombre aparecerá pre-rellenado al aceptar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <TrainerTransferAckModal
                isOpen={showTransferModal}
                warnings={pendingWarnings}
                isSubmitting={isSubmitting}
                onConfirm={handleTransferConfirm}
                onCancel={dismissTransferModal}
            />
        </>
    );
};
