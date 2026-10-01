import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AthleteForTimeCompletionReview } from "../AthleteForTimeCompletionReview";

describe("AthleteForTimeCompletionReview (B4)", () => {
    it("propaga min/seg al padre en cada cambio y ±5 s", () => {
        const onTotalSecondsChange = vi.fn();
        render(
            <AthleteForTimeCompletionReview
                totalSeconds={6}
                onTotalSecondsChange={onTotalSecondsChange}
                roundRpe={null}
                onRoundRpeChange={vi.fn()}
            />
        );

        fireEvent.change(screen.getByLabelText("Minutos"), { target: { value: "12" } });
        fireEvent.change(screen.getByLabelText("Segundos"), { target: { value: "34" } });

        expect(onTotalSecondsChange).toHaveBeenCalledWith(754);
    });

    it("±5 s actualiza el total propagado", () => {
        function Harness() {
            const [total, setTotal] = useState(754);
            return (
                <AthleteForTimeCompletionReview
                    totalSeconds={total}
                    onTotalSecondsChange={setTotal}
                    roundRpe={null}
                    onRoundRpeChange={vi.fn()}
                />
            );
        }

        render(<Harness />);
        fireEvent.click(screen.getByLabelText("Sumar 5 segundos"));
        fireEvent.click(screen.getByLabelText("Restar 5 segundos"));

        expect(screen.getByLabelText("Minutos")).toHaveValue("12");
        expect(screen.getByLabelText("Segundos")).toHaveValue("34");
    });

    it("no acepta segundos ≥ 60 en el callback del padre", () => {
        const onTotalSecondsChange = vi.fn();
        render(
            <AthleteForTimeCompletionReview
                totalSeconds={60}
                onTotalSecondsChange={onTotalSecondsChange}
                roundRpe={null}
                onRoundRpeChange={vi.fn()}
            />
        );

        fireEvent.change(screen.getByLabelText("Segundos"), { target: { value: "61" } });
        expect(onTotalSecondsChange).not.toHaveBeenCalledWith(121);
    });

    it("escribir y confirmar inmediatamente sin perder foco guarda el valor escrito", () => {
        function Harness() {
            const [total, setTotal] = useState(6);
            return (
                <div>
                    <AthleteForTimeCompletionReview
                        totalSeconds={total}
                        onTotalSecondsChange={setTotal}
                        roundRpe={null}
                        onRoundRpeChange={vi.fn()}
                    />
                    <button type="button" data-testid="confirm">
                        Bloque completado ({total})
                    </button>
                </div>
            );
        }

        render(<Harness />);

        fireEvent.change(screen.getByLabelText("Minutos"), { target: { value: "12" } });
        fireEvent.change(screen.getByLabelText("Segundos"), { target: { value: "34" } });
        fireEvent.click(screen.getByTestId("confirm"));

        expect(screen.getByTestId("confirm")).toHaveTextContent("Bloque completado (754)");
    });
});
