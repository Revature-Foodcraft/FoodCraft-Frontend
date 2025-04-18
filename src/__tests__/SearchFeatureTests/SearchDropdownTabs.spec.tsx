import { render, screen, fireEvent } from "@testing-library/react";
import SearchDropdownTabs from "../../Components/SearchFeature/SearchDropdownTabs";

jest.mock('../../Components/SearchFeature/MealCategorySelect', () => {
    return {
      __esModule: true, 
      default: () => <div data-testid="meal-tab">MealCategorySelect Component</div>,
    };
  });

  jest.mock('../../Components/SearchFeature/CuisineSelect', () => {
    return {
      __esModule: true,
      default: () => <div data-testid="cuisine-tab">CuisineSelect Component</div>,
    };
  });

describe("SearchDropdownTabs Component", () => {
  it("renders MealCategorySelect by default and switches to CuisineSelect when the tab is clicked", () => {
    render(<SearchDropdownTabs />);

    const mealTabButton = screen.getByRole("button", { name: /Meal Type/i });
    const cuisineTabButton = screen.getByRole("button", { name: /Cuisine/i });

    expect(mealTabButton).toHaveClass("active");
    expect(cuisineTabButton).not.toHaveClass("active");

    expect(screen.getByTestId("meal-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("cuisine-tab")).not.toBeInTheDocument();

    fireEvent.click(cuisineTabButton);

    expect(cuisineTabButton).toHaveClass("active");
    expect(mealTabButton).not.toHaveClass("active");

    expect(screen.getByTestId("cuisine-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("meal-tab")).not.toBeInTheDocument();
  });
});