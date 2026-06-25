/**
 * ClientInvitePage — invitar atleta por email (nombre + correo).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useClientInvite } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageTitle } from "@/components/dashboard/shared/PageTitle";
import { TrainerTransferAckModal } from "@/components/clients/invitations";

export const ClientInvitePage: React.FC = () => {
    const navigate = useNavigate();
    const [showDevLink, setShowDevLink] = useState(false);
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
        lastInvitation,
        resetSuccess,
    } = useClientInvite();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await submitInvite();
        if (result?.magic_link) {
            setShowDevLink(true);
        }
    };

    const handleTransferConfirm = async () => {
        const result = await confirmTransferAndSend();
        if (result?.magic_link) {
            setShowDevLink(true);
        }
    };

    const handleBackToList = () => {
        resetSuccess();
        setShowDevLink(false);
        navigate("/dashboard/clients");
    };

    if (lastInvitation) {
        return (
            <div className="mx-auto max-w-xl space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Clientes", path: "/dashboard/clients" },
                        { label: "Invitar atleta", active: true },
                    ]}
                />
                <div className="rounded-lg border border-success/20 bg-success/5 p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                        <Mail className="h-5 w-5" aria-hidden />
                    </div>
                    <h1 className="text-lg font-semibold text-foreground">Invitación enviada</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Hemos enviado un enlace a{" "}
                        <span className="font-medium text-foreground">{lastInvitation.email}</span>.
                        Aparecerá en tu lista como «Pendiente de aceptar» hasta que el atleta acepte.
                    </p>
                    {showDevLink && lastInvitation.magic_link ? (
                        <p className="mt-4 break-all rounded-md bg-surface p-3 text-xs text-muted-foreground">
                            Enlace dev: {lastInvitation.magic_link}
                        </p>
                    ) : null}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button variant="primary" onClick={handleBackToList} className="w-full sm:w-auto">
                            Volver a clientes
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetSuccess();
                                setShowDevLink(false);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Invitar a otro
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto max-w-xl space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Clientes", path: "/dashboard/clients" },
                        { label: "Invitar atleta", active: true },
                    ]}
                />

                <div className="space-y-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/clients")}
                        className="px-0 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                    <PageTitle
                        title="Invitar atleta"
                        subtitle="Introduce nombre y correo. El atleta recibirá un enlace para crear su cuenta y completar su perfil."
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-surface p-5 sm:p-6">
                    <div className="space-y-2">
                        <label htmlFor="invite-nombre" className="text-sm font-medium text-foreground">
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
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="invite-apellidos" className="text-sm font-medium text-foreground">
                            Apellidos <span className="text-muted-foreground">(opcional)</span>
                        </label>
                        <Input
                            id="invite-apellidos"
                            type="text"
                            value={values.apellidos}
                            onChange={(event) => setField("apellidos", event.target.value)}
                            placeholder="Ej: Pérez"
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="invite-email" className="text-sm font-medium text-foreground">
                            Correo electrónico <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="invite-email"
                            type="email"
                            value={values.email}
                            onChange={(event) => setField("email", event.target.value)}
                            placeholder="ejemplo@correo.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className="w-full min-h-touch sm:min-h-0 sm:w-auto"
                        >
                            {isSubmitting ? "Enviando…" : "Enviar invitación"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/clients")}
                            className="w-full min-h-touch sm:min-h-0 sm:w-auto"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
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
