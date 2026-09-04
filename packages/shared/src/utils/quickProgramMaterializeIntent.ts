/**
 * quickProgramMaterializeIntent.ts — Intent O9: client_request_id acoplado al payload materializable.
 *
 * Regla: un client_request_id identifica un intento concreto de materialize (payload congelado).
 * Si el borrador cambia de forma que altera el payload O9, se rota el id para evitar 409 al entrenador.
 * Reintentos con el mismo payload conservan el mismo id (idempotencia red / doble clic).
 */

import type {
    MaterializationClientRequestId,
    QuickProgramDraft,
} from "../types/quickProgramDraft";
import {
    applyDerivedPhaseDates,
    createMaterializationClientRequestId,
    draftToMaterializePayload,
} from "./quickProgramDraft";

export interface MaterializationIntentBinding {
    clientRequestId: MaterializationClientRequestId;
    payloadFingerprint: string;
}

/** JSON canónico (claves ordenadas) alineado con hash BE. */
export function canonicalJson(value: unknown): string {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
        .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
        .join(",")}}`;
}

/** Huella estable del payload O9 derivado del borrador. */
export function computeMaterializePayloadFingerprint(
    draft: QuickProgramDraft,
): string {
    const payload = draftToMaterializePayload(applyDerivedPhaseDates(draft));
    return canonicalJson(payload);
}

export interface AlignDraftMaterializationIntentResult {
    draft: QuickProgramDraft;
    binding: MaterializationIntentBinding;
    rotated: boolean;
}

/**
 * Sincroniza clientRequestId con la huella actual del payload materializable.
 * Rota el id solo cuando el payload cambia respecto al binding previo.
 */
export function alignDraftMaterializationIntent(
    draft: QuickProgramDraft,
    binding: MaterializationIntentBinding | null,
): AlignDraftMaterializationIntentResult {
    const derived = applyDerivedPhaseDates(draft);
    const payloadFingerprint = computeMaterializePayloadFingerprint(derived);

    if (
        binding !== null &&
        binding.payloadFingerprint === payloadFingerprint
    ) {
        return {
            draft: { ...derived, clientRequestId: binding.clientRequestId },
            binding,
            rotated: false,
        };
    }

    const clientRequestId =
        binding === null
            ? derived.clientRequestId
            : createMaterializationClientRequestId();

    const nextBinding: MaterializationIntentBinding = {
        clientRequestId,
        payloadFingerprint,
    };

    return {
        draft: { ...derived, clientRequestId },
        binding: nextBinding,
        rotated: binding !== null,
    };
}
