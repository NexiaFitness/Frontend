/**
 * AthleteSessionLogBlockSheet.test.tsx — «Registrar al final»: el peso visible es el guardado.
 *
 * Contexto: F5 del prompt de corrección pre-integración (D-LOG-TOUCH-01 §4). El peso
 * tecleado en la serie 1 se muestra en la serie 2 (misma serie, sin peso ni tocar);
 * ese valor tiene que estar en el borrador que se guarda, no solo en pantalla.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    buildInitialBlockDraft,
    type AthleteSessionLogBlockDraft,
    type AthleteSessionLogBlockModel,
} from "@nexia/shared/utils/athlete/athleteSessionLogUtils";
import { AthleteSessionLogBlockSheet } from "../AthleteSessionLogBlockSheet";

function setStep(index: number): AthleteRunStep {
    return {
        stepKey: `block-588-single-0-r${index}-S2-S${index}-${index}`,
        kind: "single_set",
        groupKind: "single_set",
        blockId: 588,
        blockName: "Acondicionamiento",
        groupId: "block-588-single-0",
        badgeLabel: "S2",
        roundIndex: index,
        roundTotal: 2,
        slotLabel: "S2",
        exerciseId: 11,
        exerciseName: "Curl de bíceps",
        setLabel: `S${index}`,
        setIndex: index,
        instruction: "",
        plannedLabel: "8 reps",
        restAfterSeconds: 60,
        inputMode: "weight_reps",
        blockExerciseId: 901,
        plannedWeight: null,
        defaultWeight: 0,
        defaultReps: 8,
        defaultRpe: null,
        loggedSets: 0,
        totalSetsInSlot: 2,
        timeCapMinutes: null,
        intervalSeconds: null,
        plannedDurationSeconds: null,
    } as AthleteRunStep;
}

const block: AthleteSessionLogBlockModel = {
    sessionBlockId: 588,
    blockTypeName: "Acondicionamiento",
    setType: "single_set",
    status: "pending",
    expectedStepKeys: [setStep(1).stepKey, setStep(2).stepKey],
    steps: [setStep(1), setStep(2)],
    summaryLine: null,
    isPendingHighlight: true,
    hasRegisterableSteps: true,
};

function Harness({ onDraft }: { onDraft: (d: AthleteSessionLogBlockDraft) => void }) {
    const [draft, setDraft] = useState(() => buildInitialBlockDraft(block, null));
    return (
        <AthleteSessionLogBlockSheet
            isOpen
            sheetState="ready"
            block={block}
            draft={draft}
            onDraftChange={(next) => {
                onDraft(next);
                setDraft(next);
            }}
            onClose={vi.fn()}
            onSave={vi.fn()}
            onMarkNotPerformed={vi.fn()}
            isSaving={false}
            errorMessage={null}
            isOnline
        />
    );
}

describe("AthleteSessionLogBlockSheet · F5 visible = guardado", () => {
    it("el peso tecleado en la serie 1 que se ve en la serie 2 está en el borrador", () => {
        const onDraft = vi.fn();
        render(<Harness onDraft={onDraft} />);

        const [set1, set2] = screen.getAllByRole("textbox", { name: "Peso" });
        expect(set2).toHaveValue("");
        fireEvent.change(set1, { target: { value: "60" } });
        fireEvent.blur(set1);

        expect(screen.getAllByRole("textbox", { name: "Peso" })[1]).toHaveValue("60");
        const last = onDraft.mock.calls.at(-1)?.[0] as AthleteSessionLogBlockDraft;
        expect(last.singleSets.map((s) => s.weight)).toEqual([60, 60]);
    });

    it("no rellena una serie posterior que el atleta ya tocó", () => {
        const onDraft = vi.fn();
        render(<Harness onDraft={onDraft} />);

        const [set1, set2] = screen.getAllByRole("textbox", { name: "Peso" });
        fireEvent.change(set2, { target: { value: "0" } });
        fireEvent.blur(set2);
        fireEvent.change(set1, { target: { value: "60" } });
        fireEvent.blur(set1);

        const last = onDraft.mock.calls.at(-1)?.[0] as AthleteSessionLogBlockDraft;
        expect(last.singleSets.map((s) => s.weight)).toEqual([60, 0]);
    });
});
