import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import LoginRegisterPopup from "../../Components/LoginRegisterPopup";
import { MemoryRouter } from "react-router-dom";

describe("LoginRegisterPopup", () => {
    test("renders initial button only and no popup", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        expect(
            screen.getByRole("button", { name: /Login\/Register/i })
        ).toBeInTheDocument();

        expect(
            screen.queryByText(/Why create an account\?/i)
        ).not.toBeInTheDocument();
    });

    test("opens popup when clicking the Login/Register button", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole("button", {
            name: /Login\/Register/i,
        });
        fireEvent.click(toggleButton);

        expect(
            screen.getByText(/Why create an account\?/i)
        ).toBeInTheDocument();

        expect(screen.getByText(/Benefits/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Upload your own recipes/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Save recipes/i)).toBeInTheDocument();
    });

    test("closes popup when clicking on the modal background", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole("button", {
            name: /Login\/Register/i,
        });
        fireEvent.click(toggleButton);

        expect(
            screen.getByText(/Why create an account\?/i)
        ).toBeInTheDocument();

        const popup = screen.getByText(/Why create an account\?/i).closest(
            ".modal.fade.show"
        );
        expect(popup).toBeDefined();

        if (popup) {
            fireEvent.click(popup);
        }

        expect(
            screen.queryByText(/Why create an account\?/i)
        ).not.toBeInTheDocument();
    });

    test("closes popup when clicking the Close button", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole("button", {
            name: /Login\/Register/i,
        });
        fireEvent.click(toggleButton);

        const closeButton = screen.getByRole("button", { name: /Close/i });
        fireEvent.click(closeButton);

        expect(
            screen.queryByText(/Why create an account\?/i)
        ).not.toBeInTheDocument();
    });

    test("closes popup when clicking the Login link button", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole("button", {
            name: /Login\/Register/i,
        });
        fireEvent.click(toggleButton);

        const modalFooter = screen.getByText(/Why create an account\?/i)
            .closest(".modal-content")
            ?.querySelector(".modal-footer") as HTMLElement;

        expect(modalFooter).toBeInTheDocument();

        if (modalFooter) {
            const footer = within(modalFooter);
            const loginButton = footer.getByRole("button", { name: /^Login$/i });
            fireEvent.click(loginButton);
        }

        expect(
            screen.queryByText(/Why create an account\?/i)
        ).not.toBeInTheDocument();
    });

    test("closes popup when clicking the Register link button", () => {
        render(
            <MemoryRouter>
                <LoginRegisterPopup />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole("button", {
            name: /Login\/Register/i,
        });
        fireEvent.click(toggleButton);

        const modalFooter = screen.getByText(/Why create an account\?/i)
            .closest(".modal-content")
            ?.querySelector(".modal-footer") as HTMLElement;

        expect(modalFooter).toBeInTheDocument();

        if (modalFooter) {
            const footer = within(modalFooter);
            const registerButton = footer.getByRole("button", { name: /^Register$/i });
            fireEvent.click(registerButton);
        }

        expect(
            screen.queryByText(/Why create an account\?/i)
        ).not.toBeInTheDocument();
    });
});