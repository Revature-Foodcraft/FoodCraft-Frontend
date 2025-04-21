import { render, screen, fireEvent } from "@testing-library/react";
import IngredientComponent from "../../Components/SmartFridge/IngredientComponent";
import { Ingredient } from "../../Types/Ingredient";

describe("IngredientComponent", () => {
    it("renders ingredient name", () => {
        const ingredient: Ingredient = { id: "1", name: "Milk", amount: 1, unit: "L", category: "Dairy" };
        render(
            <IngredientComponent
                ingredient={ingredient}
                onRemove={jest.fn()}
                onUpdate={jest.fn()}
            />
        );
        expect(screen.getByText(/Milk/i)).toBeInTheDocument();
    });
});