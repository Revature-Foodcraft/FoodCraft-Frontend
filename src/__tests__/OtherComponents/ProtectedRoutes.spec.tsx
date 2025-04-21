import React from "react";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../../Components/ProtectedRoutes";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const DummyComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("renders children when isLoggedIn is true", () => {
        render(
            <MemoryRouter initialEntries={["/protected"]}>
                <ProtectedRoute isLoggedIn={true}>
                    <DummyComponent />
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("renders children when a token exists in localStorage", () => {
        localStorage.setItem("token", "dummy-token");

        render(
            <MemoryRouter initialEntries={["/protected"]}>
                <ProtectedRoute isLoggedIn={false}>
                    <DummyComponent />
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("redirects to /login when not logged in and no token exists", () => {
        render(
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute isLoggedIn={false}>
                                <DummyComponent />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
});