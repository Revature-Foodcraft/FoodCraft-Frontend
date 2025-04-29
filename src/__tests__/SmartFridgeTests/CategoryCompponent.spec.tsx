import { render, screen } from "@testing-library/react";
import CategoryComponent from "../../Components/SmartFridge/CategoryComponent";
import { IngredientCategory } from "../../Types/Ingredient";

describe("CategoryComponent", () => {
    const mockOnRemove = jest.fn();
    const mockOnUpdate = jest.fn();

    const mockItems = [
        { ingredient: { id: "1", name: "Tomato", amount: 2, unit: "kg", category: IngredientCategory.Vegetables } },
        { ingredient: { id: "2", name: "Potato", amount: 5, unit: "kg", category: IngredientCategory.Vegetables } },
    ];

    it("renders the category title and items", () => {
        render(
            <CategoryComponent
                category={IngredientCategory.Vegetables}
                items={mockItems}
                onRemove={mockOnRemove}
                onUpdate={mockOnUpdate}
            />
        );

        expect(screen.getByText(/Vegetables/i)).toBeInTheDocument();
        expect(screen.getByText(/Tomato/i)).toBeInTheDocument();
        expect(screen.getByText(/Potato/i)).toBeInTheDocument();
    });
});