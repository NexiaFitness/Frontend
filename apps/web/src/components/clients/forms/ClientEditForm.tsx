/**
 * ClientEditForm.tsx — Formulario de edición de cliente existente
 *
 * Usa ClientFormBase para renderizar todos los campos de forma unificada.
 *
 * @since v4.5.0
 * @updated v4.6.0 - Refactorizado para usar ClientFormBase
 */

import React from "react";
import type { Client, ClientFormData } from "@nexia/shared/types/client";
import { ClientFormBase } from "../ClientFormBase";

interface ClientEditFormProps {
    client: Client;
    onSuccess?: () => void;
}

export const ClientEditForm: React.FC<ClientEditFormProps> = ({
    client,
    onSuccess,
}) => {
    return (
        <ClientFormBase
            mode="edit"
            initialData={client as ClientFormData}
            clientId={client.id}
            onSubmitSuccess={onSuccess}
        />
    );
};
