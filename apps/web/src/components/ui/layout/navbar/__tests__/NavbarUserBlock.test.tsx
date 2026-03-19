/**
 * NavbarUserBlock — Tests de comportamiento (user null vs con datos, iniciales).
 * No se comprueban clases Tailwind.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { NavbarUserBlock } from "../NavbarUserBlock";
import type { User } from "@nexia/shared/types/auth";
import { USER_ROLES } from "@nexia/shared/config/constants";

const mockUser: User = {
    id: 1,
    email: "coach@example.com",
    nombre: "Carlos",
    apellidos: "Demo",
    role: USER_ROLES.TRAINER,
    is_active: true,
    is_verified: true,
    created_at: "2024-01-01T00:00:00Z",
};

describe("NavbarUserBlock", () => {
    it("renders nothing when user is null", () => {
        render(<NavbarUserBlock user={null} />);
        expect(screen.queryByText("Carlos Demo")).not.toBeInTheDocument();
        expect(screen.queryByText("CD")).not.toBeInTheDocument();
    });

    it("renders user full name when user is provided", () => {
        render(<NavbarUserBlock user={mockUser} />);
        expect(screen.getByText("Carlos Demo")).toBeInTheDocument();
    });

    it("renders initials from nombre and apellidos", () => {
        render(<NavbarUserBlock user={mockUser} />);
        expect(screen.getByText("CD")).toBeInTheDocument();
    });

    it("renders single initial when only nombre", () => {
        const userAna: User = { ...mockUser, nombre: "Ana", apellidos: "" };
        render(<NavbarUserBlock user={userAna} />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });
});
