/**
 * AmrapBlock Test Suite
 *
 * Tests de integración para la card AMRAP del constructor.
 * Cubre el valor por defecto de duración y la edición libre del campo.
 *
 * @since v8.2.0
 */

import React, { useState } from "react";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "../../../constructorTypes";
import { AmrapBlock } from "../AmrapBlock";
import { normalizeAmrapRow } from "../../utils/amrapRow";

function createAmrapRow(overrides: Partial<ConstructorRow> = {}): ConstructorRow {
    const base: ConstructorRow = {
        id: "row-amrap-1",
        blockTypeId: 1,
        setType: SET_TYPE.AMRAP,
        sets: null,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        rest: null,
        exercises: [],
        ...overrides,
    };
    return normalizeAmrapRow(base);
}

function ControlledAmrapBlock({
    initialRow = createAmrapRow(),
    onUpdateSpy,
    ...rest
}: Omit<React.ComponentProps<typeof AmrapBlock>, "row" | "onUpdate" | "onUpdateExercise"> & {
    initialRow?: ConstructorRow;
    onUpdateSpy?: (rowId: string, updates: Partial<ConstructorRow>) => void;
}) {
    const [row, setRow] = useState(initialRow);

    const handleUpdate = (rowId: string, updates: Partial<ConstructorRow>) => {
        setRow((prev) => ({ ...prev, ...updates }));
        onUpdateSpy?.(rowId, updates);
    };

    const handleUpdateExercise = (
        _rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => {
        setRow((prev) => ({
            ...prev,
            exercises: prev.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
            ),
        }));
    };

    return (
        <AmrapBlock
            {...rest}
            row={row}
            onUpdate={handleUpdate}
            onUpdateExercise={handleUpdateExercise}
        />
    );
}

describe("AmrapBlock", () => {
    it("renders default duration of 10 minutes", () => {
        render(
            <ControlledAmrapBlock
                blockTypes={[]}
                groupLabel="AMRAP A"
                onAddExercise={() => {}}
            />
        );

        expect(screen.getByLabelText("Duración total")).toHaveValue("10");
    });

    it("maps duration input changes to timeCap in seconds", () => {
        const onUpdateSpy = vi.fn();
        render(
            <ControlledAmrapBlock
                blockTypes={[]}
                groupLabel="AMRAP A"
                onAddExercise={() => {}}
                onUpdateSpy={onUpdateSpy}
            />
        );

        const durationInput = screen.getByLabelText("Duración total");
        fireEvent.change(durationInput, { target: { value: "25" } });

        expect(onUpdateSpy).toHaveBeenLastCalledWith(
            "row-amrap-1",
            expect.objectContaining({ timeCap: 25 * 60 })
        );
        expect(durationInput).toHaveValue("25");
    });

    it("filters non-numeric characters in duration input", () => {
        const onUpdateSpy = vi.fn();
        render(
            <ControlledAmrapBlock
                blockTypes={[]}
                groupLabel="AMRAP A"
                onAddExercise={() => {}}
                onUpdateSpy={onUpdateSpy}
            />
        );

        const durationInput = screen.getByLabelText("Duración total");
        fireEvent.change(durationInput, { target: { value: "2a5b" } });

        expect(onUpdateSpy).toHaveBeenLastCalledWith(
            "row-amrap-1",
            expect.objectContaining({ timeCap: 25 * 60 })
        );
        expect(durationInput).toHaveValue("25");
    });

    it("calls onUpdate with null when duration is cleared", async () => {
        const user = userEvent.setup();
        const onUpdateSpy = vi.fn();
        render(
            <ControlledAmrapBlock
                blockTypes={[]}
                groupLabel="AMRAP A"
                onAddExercise={() => {}}
                onUpdateSpy={onUpdateSpy}
            />
        );

        const durationInput = screen.getByLabelText("Duración total");
        await user.clear(durationInput);

        expect(onUpdateSpy).toHaveBeenLastCalledWith(
            "row-amrap-1",
            expect.objectContaining({ timeCap: null })
        );
    });
});
