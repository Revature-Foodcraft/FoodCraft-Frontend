import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../Components/Header";
import { AuthContext } from "../../Components/Contexts";

jest.mock("../../Components/LoginRegisterPopup", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="login-register-popup">LoginRegisterPopup</div>
    ),
}));
jest.mock("../../Components/SearchFeature/SortByDropdown", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="sort-by-dropdown">SortByDropdown</div>
    ),
}));
jest.mock("../../Components/SearchFeature/SearchDropdownTabs", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="search-dropdown-tabs">SearchDropdownTabs</div>
    ),
}));
jest.mock("../../Components/SearchFeature/DisplayRecipes", () => ({
    DisplayRecipe: ({ searchQuery }: { searchQuery: string | null }) => (
        <div data-testid="display-recipe">DisplayRecipe - {searchQuery}</div>
    ),
    __esModule: true,
    default: ({ searchQuery }: { searchQuery: string | null }) => (
        <div data-testid="display-recipe">DisplayRecipe - {searchQuery}</div>
    ),
}));

jest.mock("../../assets/logo.svg", () => "logo.png");

describe("Header Component", () => {
    const renderHeader = (isLoggedIn: boolean) => {
        const authValue = { isLoggedIn, setLogInStatus: jest.fn() };
        return render(
            <AuthContext.Provider value={authValue}>
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    test("renders header with logo, title and navigation for logged out user", () => {
        renderHeader(false);

        expect(screen.getByAltText(/FoodCraft Logo/i)).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /FoodCraft/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();

        expect(screen.getByTestId("login-register-popup")).toBeInTheDocument();
    });

    test("renders header with Profile and Account links for logged in user", () => {
        renderHeader(true);

        expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /Profile/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Account/i })).toBeInTheDocument();

        expect(screen.queryByTestId("login-register-popup")).not.toBeInTheDocument();
    });

    test("opens and closes the search modal using the close button", async () => {
        renderHeader(true);

        expect(screen.queryByText(/Search Recipes/i)).not.toBeInTheDocument();

        const searchBtn = screen.getByRole("button", { name: /Search/i });
        fireEvent.click(searchBtn);

        await waitFor(() => {
            expect(screen.getByText(/Search Recipes/i)).toBeInTheDocument();
        });

        const closeBtn = screen.getByRole("button", { name: /×/i });
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(screen.queryByText(/Search Recipes/i)).not.toBeInTheDocument();
        });
    });

    test("closes the search modal when clicking on the backdrop", async () => {
        renderHeader(true);

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));
        await waitFor(() => {
            expect(screen.getByText(/Search Recipes/i)).toBeInTheDocument();
        });

        const backdrop = screen
            .getByText(/Search Recipes/i)
            .closest(".custom-backdrop") as HTMLElement;
        expect(backdrop).toBeInTheDocument();

        fireEvent.click(backdrop);

        await waitFor(() => {
            expect(screen.queryByText(/Search Recipes/i)).not.toBeInTheDocument();
        });
    });

    test("toggles the cuisine tab when clicking the Cuisine Filter button", async () => {
        renderHeader(true);

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));
        await waitFor(() => {
            expect(screen.getByText(/Search Recipes/i)).toBeInTheDocument();
        });

        expect(screen.queryByTestId("search-dropdown-tabs")).not.toBeInTheDocument();

        const cuisineBtn = screen.getByRole("button", { name: /Cuisine Filter/i });
        fireEvent.click(cuisineBtn);

        expect(screen.getByTestId("search-dropdown-tabs")).toBeInTheDocument();

        fireEvent.click(cuisineBtn);
        expect(screen.queryByTestId("search-dropdown-tabs")).not.toBeInTheDocument();
    });

    test("updates the search input value in the modal", async () => {
        renderHeader(true);

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));
        await waitFor(() => {
            expect(screen.getByText(/Search Recipes/i)).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Search for recipes\.\.\./i) as HTMLInputElement;
        expect(searchInput).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "Pasta" } });
        expect(searchInput.value).toBe("Pasta");
    });
});