/**
 * ClientOverviewRatingModal.tsx — Registrar valoración sin expandir cockpit (UX-OVERVIEW).
 */

import React, { useState } from "react";
import type { ClientRatingCreate } from "@nexia/shared/types/client";
import { useCreateClientRatingMutation } from "@nexia/shared/api/clientsApi";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";

export interface ClientOverviewRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
}

export const ClientOverviewRatingModal: React.FC<ClientOverviewRatingModalProps> = ({
    isOpen,
    onClose,
    clientId,
}) => {
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingComment, setRatingComment] = useState("");
    const [createRating, { isLoading }] = useCreateClientRatingMutation();

    const handleClose = () => {
        setRatingValue(5);
        setRatingComment("");
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Registrar valoración"
            description="Valoración de satisfacción del cliente (1–5)."
        >
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const data: ClientRatingCreate = {
                        client_id: clientId,
                        rating: ratingValue,
                        comment: ratingComment.trim() || null,
                        rating_type: "general",
                    };
                    try {
                        await createRating({ clientId, data }).unwrap();
                        handleClose();
                    } catch {
                        // RTK / baseApi
                    }
                }}
            >
                <div>
                    <label htmlFor="overview-rating-select" className="mb-1 block text-sm font-medium">
                        Valoración (1-5)
                    </label>
                    <select
                        id="overview-rating-select"
                        value={ratingValue}
                        onChange={(e) => setRatingValue(Number(e.target.value))}
                        className="block w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                    >
                        {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="overview-rating-comment" className="mb-1 block text-sm font-medium">
                        Comentario (opcional)
                    </label>
                    <textarea
                        id="overview-rating-comment"
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isLoading} isLoading={isLoading}>
                        Guardar
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};
