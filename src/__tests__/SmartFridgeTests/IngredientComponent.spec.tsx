import { render, screen, fireEvent } from "@testing-library/react";
import IngredientComponent from "../../Components/SmartFridge/IngredientComponent";
import { IngredientCategory } from "../../Types/Ingredient";

describe("IngredientComponent", () => {
    const mockOnRemove = jest.fn();
    const mockOnUpdate = jest.fn();

    const mockIngredient = { id: "1", name: "Tomato", category: "Vegetable" as IngredientCategory, amount: 2, unit: "kg" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the ingredient details", () => {
        render(
            <IngredientComponent
                ingredient={mockIngredient}
                onRemove={mockOnRemove}
                onUpdate={mockOnUpdate}
            />
        );

        expect(screen.getByText(/Tomato/i)).toBeInTheDocument();
        expect(screen.getByText(/2 kg/i)).toBeInTheDocument();
    });

    it("calls onRemove when the delete button is clicked", () => {
        render(
            <IngredientComponent
                ingredient={mockIngredient}
                onRemove={mockOnRemove}
                onUpdate={mockOnUpdate}
            />
        );

        fireEvent.click(screen.getByRole("button"));
        expect(mockOnRemove).toHaveBeenCalledWith("1");
    });
});