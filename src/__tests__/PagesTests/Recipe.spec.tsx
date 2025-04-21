import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Recipe from "../../pages/Recipe";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const fakeMeal = {
  strMeal: "Test Meal",
  strIngredient1: "Chicken",
  strMeasure1: "200g",
  strIngredient2: "",
  strMeasure2: "",
  strInstructions: "Mix thoroughly. Cook it well.",
  strMealThumb: "http://example.com/meal.jpg",
  strYoutube: "https://www.youtube.com/watch?v=testvideo",
  strCategory: "TestCategory"
};

const fakeReviews = [
  {
    reviewId: "r1",
    recipeId: "123",
    user_id: "u1",
    comment: "Great recipe",
    rating: 5,
    dateCreated: "2021-01-01"
  }
];

const fakeUsers = [
  {
    user_id: "u1",
    picture: "http://example.com/user.jpg",
    account: { firstname: "John", lastname: "Doe" }
  }
];

const fakeSimilarRecipe = {
  PK: "sr1",
  name: "Similar Test",
  pictures: ["http://example.com/similar.jpg"],
  user_id: "user1"
};

(global as any).imageNotFound = "not-found.jpg";

Storage.prototype.getItem = jest.fn(() => "dummy-token");

beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation((input, init) => {
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      throw new Error("Invalid input type");
    }

    if (url.includes("lookup.php")) {
      return Promise.resolve({
        json: () => Promise.resolve({ meals: [fakeMeal] })
      } as Response);
    }
    if (url.includes("/recipes/123/reviews") && init && init.method === "POST") {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true })
      } as Response);
    }
    if (url.includes("/recipes/123/reviews")) {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, reviews: fakeReviews })
      } as Response);
    }
    if (url.includes("/users?ids=")) {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, users: fakeUsers })
      } as Response);
    }
    if (url.includes("recipes?category=")) {
      return Promise.resolve({
        json: () => Promise.resolve({ recipes: [fakeSimilarRecipe] })
      } as Response);
    }
    if (url.includes("/user/recipes")) {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ success: true })
      } as Response);
    }
    if (url.includes("/recipes/123") && !url.includes("/reviews")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            recipe: {
              name: "Regular Test Meal",
              ingredients: [{ amount: "1 cup", name: "Flour" }],
              instructions: ["Mix ingredients", "Bake at 350 F"],
              macros: { calories: 300, fat: 10, carbs: 40, protein: 5 },
              pictures: ["http://example.com/recipe.jpg"],
              youtube: "",
              category: "Dessert",
              user_id: "local"
            }
          })
      } as Response);
    }
    return Promise.resolve({
      json: () => Promise.resolve({})
    } as Response);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Recipe Component - API Recipe", () => {
  beforeEach(() => {
    window.history.pushState({}, "Test page", "/recipe/api/123");
  });

  test("displays a loading message initially then renders recipe details", async () => {
    render(
      <MemoryRouter initialEntries={["/recipe/api/123"]}>
        <Routes>
          <Route path="/recipe/api/:id" element={<Recipe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading recipe/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test Meal");

    expect(screen.getByText("200g Chicken")).toBeInTheDocument();

    expect(screen.getByText("Mix thoroughly")).toBeInTheDocument();
    expect(screen.getByText("Cook it well.")).toBeInTheDocument();

    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/testvideo");

    expect(screen.getByText("Similar Test")).toBeInTheDocument();
  });

  test("handles saving the recipe to list correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/recipe/api/123"]}>
        <Routes>
          <Route path="/recipe/api/:id" element={<Recipe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    );

    const saveButton = screen.getByText(/Save To Recipe List/i);
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(screen.getByText("Added to save list!")).toBeInTheDocument()
    );
  });

  test("handles review submission successfully", async () => {
    render(
      <MemoryRouter initialEntries={["/recipe/api/123"]}>
        <Routes>
          <Route path="/recipe/api/:id" element={<Recipe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    );

    const addReviewButton = screen.getByText(/Add Review/i);
    fireEvent.click(addReviewButton);

    expect(screen.getByText("Add a Review")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Your comment...");
    fireEvent.change(textarea, { target: { value: "This is a test review." } });

    const select = screen.getByDisplayValue("5 Stars");
    fireEvent.change(select, { target: { value: "4" } });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText("Review submitted successfully!")).toBeInTheDocument()
    );

    expect(screen.queryByText("Add a Review")).not.toBeInTheDocument();
  });
});

describe("Recipe Component - Non API Recipe", () => {
  beforeEach(() => {
    window.history.pushState({}, "Test page", "/recipe/123");
  });

  test("fetches and displays non API recipe details", async () => {
    render(
      <MemoryRouter initialEntries={["/recipe/123"]}>
        <Routes>
          <Route path="/recipe/:id" element={<Recipe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Regular Test Meal");
    expect(screen.getByText("1 cup Flour")).toBeInTheDocument();
    expect(screen.getByText("No video available.")).toBeInTheDocument();
  });
});