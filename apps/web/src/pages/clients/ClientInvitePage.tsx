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
import { cn } from "@/lib/utils";
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
    CLIENT_INVITE_FOOTER_BTN,
    CLIENT_INVITE_SUBMIT,
    CLIENT_INVITE_SUCCESS_CARD,
    CLIENT_INVITE_TIP_BLOCK,
    CLIENT_INVITE_CARD_INNER,
    CLIENT_INVITE_TIPS_CARD,
    CLIENT_INVITE_TIPS_LEAD,
    CLIENT_INVITE_TIPS_NOTE,
    TrainerTransferAckModal,
} from "@/components/clients/invitations";

const FORM_VARIANT = "premium" as const;

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
                                variant="outline"
                                onClick={() => {
                                    resetSuccess();
                                }}
                                className={CLIENT_INVITE_FOOTER_BTN}
                            >
                                Invitar a otro
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleBackToList}
                                className={CLIENT_INVITE_SUBMIT}
                            >
                                Volver a clientes
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
                            <div className={CLIENT_INVITE_CARD_INNER}>
                                <div className={CLIENT_INVITE_FIELDS_GRID}>
                                    <div className={CLIENT_INVITE_FIELD_FULL}>
                                        <Input
                                            id="invite-nombre"
                                            variant={FORM_VARIANT}
                                            label="Nombre"
                                            type="text"
                                            value={values.nombre}
                                            onChange={(event) => setField("nombre", event.target.value)}
                                            placeholder="Ej: Juan"
                                            autoComplete="given-name"
                                            isRequired
                                            required
                                            size="sm"
                                        />
                                    </div>

                                    <Input
                                        id="invite-apellidos"
                                        variant={FORM_VARIANT}
                                        label="Apellidos (opcional)"
                                        type="text"
                                        value={values.apellidos}
                                        onChange={(event) => setField("apellidos", event.target.value)}
                                        placeholder="Ej: Pérez"
                                        autoComplete="family-name"
                                        size="sm"
                                    />

                                    <Input
                                        id="invite-email"
                                        variant={FORM_VARIANT}
                                        label="Correo electrónico"
                                        type="email"
                                        value={values.email}
                                        onChange={(event) => setField("email", event.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        autoComplete="email"
                                        isRequired
                                        required
                                        size="sm"
                                    />
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

                                <div className={cn(CLIENT_INVITE_ACTIONS, "mt-auto")}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/dashboard/clients")}
                                        disabled={isSubmitting}
                                        className={CLIENT_INVITE_FOOTER_BTN}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className={CLIENT_INVITE_SUBMIT}
                                    >
                                        {isSubmitting ? "Enviando…" : "Enviar invitación"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <aside className={CLIENT_INVITE_ASIDE} aria-label="Información sobre la invitación">
                        <div className={CLIENT_INVITE_TIPS_CARD}>
                            <NexiaGlassAccentRim />
                            <div className={CLIENT_INVITE_CARD_INNER}>
                                <div className="flex items-center gap-2">
                                    <UserPlus className="size-4 text-primary" aria-hidden />
                                    <h2 className={CLIENT_INVITE_SECTION_LABEL}>Qué ocurre después</h2>
                                </div>
                                <div className={CLIENT_INVITE_TIP_BLOCK}>
                                    <p className="text-sm leading-snug text-foreground">
                                        {CLIENT_INVITE_TIPS_LEAD}
                                    </p>
                                </div>
                                <p className="mt-auto flex items-start gap-2 text-xs leading-snug text-muted-foreground">
                                    <Info className="mt-0.5 size-3.5 shrink-0 text-primary/70" aria-hidden />
                                    {CLIENT_INVITE_TIPS_NOTE}
                                </p>
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
