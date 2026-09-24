import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { AdminUserReasonModal } from "../AdminUserReasonModal";

describe("AdminUserReasonModal", () => {
    it("no confirma sin motivo de al menos 5 caracteres", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        render(
            <AdminUserReasonModal
                isOpen
                action="force-logout"
                reason=""
                onReasonChange={() => undefined}
                canSubmit={false}
                isLoading={false}
                onClose={() => undefined}
                onConfirm={onConfirm}
            />
        );

        const submit = screen.getByTestId("admin-user-reason-submit");
        expect(submit).toBeDisabled();

        await user.click(submit);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("confirma cuando canSubmit es true", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        render(
            <AdminUserReasonModal
                isOpen
                action="activate"
                reason="motivo válido"
                onReasonChange={() => undefined}
                canSubmit
                isLoading={false}
                onClose={() => undefined}
                onConfirm={onConfirm}
            />
        );

        await user.click(screen.getByTestId("admin-user-reason-submit"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
