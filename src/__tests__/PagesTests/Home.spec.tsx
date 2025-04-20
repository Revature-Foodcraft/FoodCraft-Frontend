import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../../pages/Home"; // Adjust the path as needed
import { MemoryRouter } from "react-router-dom";

// Dummy recipe to be returned from fetch for each call.
const dummyRecipe = {
  idMeal: "1234",
  strMeal: "Test Meal",
  strMealThumb: "https://test.com/thumb.jpg",
};

// Mock global.fetch so that each call returns our dummy recipe.
beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve({ meals: [dummyRecipe] }),
    } as Response)
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Home Component", () => {
  test("renders the main title and slideshow with first image active", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check that the main title is rendered.
    expect(screen.getByText("Welcome to FoodCraft")).toBeInTheDocument();

    // Check that at least one image (for pictureOne) is rendered with the proper alt text.
    const firstSlideImage = screen.getByAltText("Slideshow picture 1");
    expect(firstSlideImage).toBeInTheDocument();

    // Query all slideshow images and then check that the first slide has the "active" class.
    const slideImages = document.querySelectorAll(".slide-image");
    expect(slideImages.length).toBeGreaterThan(0);
    expect(slideImages[0]).toHaveClass("active");
  });

  test("fetches and displays 8 featured recipes", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for the component to update after fetch calls.
    // The getFeaturedRecipes function makes 8 fetch calls, so our dummy recipe should appear 8 times.
    await waitFor(() => {
      // Query for all elements that display the recipe title.
      // Since each recipe card displays the recipe title in a <p> element with class "recipe-title",
      // we can look for the dummy recipe title.
      const recipeTitles = screen.getAllByText(dummyRecipe.strMeal);
      expect(recipeTitles.length).toBe(8);
    });
  });

  test("renders the Best Recipes section", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check that the Best Recipes by Rating section heading appears.
    const bestRecipesHeading = screen.getByText("Best Recipes by Rating");
    expect(bestRecipesHeading).toBeInTheDocument();

    // Check that at least one best recipe card is rendered (they are static).
    // For example, the first best recipe should have text "Recipe Title 1".
    expect(screen.getByText("Recipe Title 1")).toBeInTheDocument();
  });


});