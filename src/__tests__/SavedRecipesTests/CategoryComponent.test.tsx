import { render, screen } from "@testing-library/react";
import CategoryComponent from "../../Components/SmartFridge/CategoryComponent";
import { IngredientCategory } from "../../Types/Ingredient";

describe("CategoryComponent", () => {
    it("renders category title", () => {
        render(
            <CategoryComponent
                category={IngredientCategory.Dairy}
                items={[]}
                onRemove={jest.fn()}
                onUpdate={jest.fn()}
            />
        );
        expect(screen.getByText(/Dairy/i)).toBeInTheDocument();
    });
});