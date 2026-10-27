/**
 * VolumeNotesBlock.tsx — Lo que el volumen no cuenta o no puede contar (H4).
 *
 * Contexto: las respuestas de volumen (borrador del constructor, semana guardada y validación
 * de sesión) traen `volume_notes`. Este componente las muestra junto al panel de volumen:
 * avisos (`Alert` warning) para lo que hay que completar y una línea meta para lo informativo
 * (series de calentamiento excluidas). Nada se oculta (SPEC_H4 R2).
 * Notas de mantenimiento: el texto sale de `volumeNotesCopy` (shared); las clases, de
 * sessionProgrammingPresentation. Sin lógica de negocio aquí.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import React from "react";
import { Info } from "lucide-react";
import { Alert } from "@/components/ui/feedback";
import type { VolumeNotesOut } from "@nexia/shared/types/sessionLoad";
import { volumeNotesCopy } from "@nexia/shared/training/weeklyVolumePanelPresentation";
import {
    SESSION_PROGRAMMING_VOLUME_NOTE_ALERT,
    SESSION_PROGRAMMING_VOLUME_NOTE_INFO,
    SESSION_PROGRAMMING_VOLUME_NOTE_INFO_ICON,
    SESSION_PROGRAMMING_VOLUME_NOTES,
} from "./sessionProgrammingPresentation";

export interface VolumeNotesBlockProps {
    notes: VolumeNotesOut | null | undefined;
}

export const VolumeNotesBlock: React.FC<VolumeNotesBlockProps> = ({ notes }) => {
    const items = volumeNotesCopy(notes);
    if (items.length === 0) return null;
    return (
        <div className={SESSION_PROGRAMMING_VOLUME_NOTES} data-testid="volume-notes">
            {items.map((item) =>
                item.tone === "warning" ? (
                    <Alert
                        key={item.key}
                        variant="warning"
                        className={SESSION_PROGRAMMING_VOLUME_NOTE_ALERT}
                        title={item.title}
                        description={item.description}
                    />
                ) : (
                    <p key={item.key} role="status" className={SESSION_PROGRAMMING_VOLUME_NOTE_INFO}>
                        <Info className={SESSION_PROGRAMMING_VOLUME_NOTE_INFO_ICON} aria-hidden />
                        <span>{item.title}</span>
                    </p>
                )
            )}
        </div>
    );
};
