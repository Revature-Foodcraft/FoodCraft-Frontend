import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../../pages/Home";
import { MemoryRouter } from "react-router-dom";

const dummyRecipe = {
  idMeal: "1234",
  strMeal: "Test Meal",
  strMealThumb: "https://test.com/thumb.jpg",
};

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

    expect(screen.getByText("Welcome to FoodCraft")).toBeInTheDocument();

    const firstSlideImage = screen.getByAltText("Slideshow picture 1");
    expect(firstSlideImage).toBeInTheDocument();

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

    await waitFor(() => {
      const recipeTitles = screen.getAllByText(dummyRecipe.strMeal);
      expect(recipeTitles.length).toBe(16);
    });
  });

});