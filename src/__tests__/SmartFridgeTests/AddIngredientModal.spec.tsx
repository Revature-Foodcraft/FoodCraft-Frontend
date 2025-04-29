import { render, screen, fireEvent } from "@testing-library/react";
import AddIngredientModal from "../../Components/SmartFridge/AddIngredientModal";

jest.mock("../../Components/SmartFridge/AddIngredientModal", () => {
    const originalModule = jest.requireActual("../../Components/SmartFridge/AddIngredientModal");

    return {
        ...originalModule,
        fetchSuggestions: jest.fn((query) => {
            const mockSuggestions = [
                { id: "365", name: "Tomato" },
                { id: "13", name: "Baby Plum Tomatoes" },
                { id: "316", name: "Tomato Puree" },
            ];



            originalModule.setSuggestions(mockSuggestions);
        }),
    };
});

describe("AddIngredientModal", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders the modal with input fields", () => {
        render(<AddIngredientModal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Unit:/i)).toBeInTheDocument();
    });

    it("calls onCancel when the cancel button is clicked", () => {
        render(<AddIngredientModal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByText(/Cancel/i));
        expect(mockOnCancel).toHaveBeenCalled();
    });


});