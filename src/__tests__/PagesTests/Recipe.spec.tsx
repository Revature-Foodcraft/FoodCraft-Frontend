import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Recipe from "../../pages/Recipe";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: (): { id: string } => ({ id: "test1" }),
    };
});

const dummyRecipe = {
    name: "Test Recipe",
    user_id: "42",
    ingredients: [
        { amount: "1 cup", name: "Flour", category: "Baking" },
        { amount: "2 tsp", name: "Salt", category: "Spices" },
    ],
    instructions: ["Mix all ingredients", "Bake for 30 minutes"],
    macros: { calories: 250, fat: 10, carbs: 30, protein: 5 },
    pictures: [{ link: "http://example.com/recipe.jpg" }],
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Dessert",
};
const dummyMeal = {
    strMeal: "Dummy Meal",
    strIngredient1: "Chicken",
    strMeasure1: "2 lbs",
    strInstructions: "Step1. Step2. Step3.",
    strMealThumb: "http://example.com/dummy.jpg",
    strYoutube: "https://www.youtube.com/watch?v=abcde",
    strCategory: "Main Course",
  };
  
  const dummyThemealdbResponse = { meals: [dummyMeal] };
  
const dummySimilarRecipesResponse = {
    recipes: [
        {
            PK: "sim1",
            name: "Similar Recipe 1",
            pictures: ["http://example.com/similar1.jpg"],
            user_id: "789",
        },
    ],
};

const dummyReviewsResponse = { success: true, reviews: [] };

beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(window, "alert").mockImplementation(() => { });
});

global.fetch = jest.fn((url: string, options?: RequestInit) => {
    if (url.startsWith("http://3.144.40.72:5000/recipes?category=")) {
        return Promise.resolve({
            json: () => Promise.resolve(dummySimilarRecipesResponse),
        } as Response);
    }
    if (url === "http://3.144.40.72:5000/user/recipes") {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({}),
        } as Response);
    }
    if (url.startsWith("http://3.144.40.72:5000/users?ids=")) {
        return Promise.resolve({
            json: () => Promise.resolve({ success: true, users: [] }),
        } as Response);
    }
    return Promise.reject(new Error("Unhandled URL: " + url));
}) as jest.Mock;

describe("Recipe Component", () => {

    test("renders recipe details, YouTube iframe, and similar recipes", async () => {
      // Setup global.fetch for this test
      global.fetch = jest.fn((url: string) => {
        if (url === "http://3.144.40.72:5000/recipes/test1") {
          return Promise.resolve({
            json: () => Promise.resolve({ recipe: dummyRecipe }),
          } as Response);
        }
        if (url === "http://3.144.40.72:5000/recipes/test1/reviews") {
          return Promise.resolve({
            json: () => Promise.resolve(dummyReviewsResponse),
          } as Response);
        }
        if (url.startsWith("http://3.144.40.72:5000/recipes?category=")) {
          return Promise.resolve({
            json: () => Promise.resolve(dummySimilarRecipesResponse),
          } as Response);
        }
        if (url === "http://3.144.40.72:5000/user/recipes") {
          return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({}),
          } as Response);
        }
        if (url.startsWith("http://3.144.40.72:5000/users?ids=")) {
          return Promise.resolve({
            json: () => Promise.resolve({ success: true, users: [] }),
          } as Response);
        }
        return Promise.reject(new Error("Unhandled URL: " + url));
      }) as jest.Mock;
  
      render(
        <MemoryRouter>
          <Recipe />
        </MemoryRouter>
      );
  
      // Check for loading
      expect(screen.getByText(/Loading recipe/i)).toBeInTheDocument();
  
      // Wait for recipe details to appear.
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1, name: /Test Recipe/i })).toBeInTheDocument();
      });
  
      expect(screen.getByRole("heading", { level: 3, name: /Test Recipe/i })).toBeInTheDocument();
      const saveButton = screen.getByRole("button", { name: /Save To Recipe List/i });
      expect(saveButton).toBeInTheDocument();
  
      expect(screen.getByText("1 cup Flour (Baking)")).toBeInTheDocument();
      expect(screen.getByText("2 tsp Salt (Spices)")).toBeInTheDocument();
  
      expect(screen.getByText("Mix all ingredients")).toBeInTheDocument();
      expect(screen.getByText("Bake for 30 minutes")).toBeInTheDocument();
  
      expect(screen.getByText(/250\skcal/i)).toBeInTheDocument();
      expect(screen.getByText(/10\sg/i)).toBeInTheDocument();
      expect(screen.getByText(/30\sg/i)).toBeInTheDocument();
      expect(screen.getByText(/5\sg/i)).toBeInTheDocument();
  
      const iframe = screen.getByTitle(/YouTube video player/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/dQw4w9WgXcQ");
  
      const foodImage = screen.getByAltText(/Test Recipe/i);
      expect(foodImage).toBeInTheDocument();
      expect(foodImage).toHaveAttribute("src", "http://example.com/recipe.jpg");
  
      expect(screen.getByRole("heading", { name: /Similar Recipes/i })).toBeInTheDocument();
      expect(screen.getByText("Similar Recipe 1")).toBeInTheDocument();
    });
  
    test("saves recipe to list when Save To Recipe List is clicked", async () => {
      render(
        <MemoryRouter>
          <Recipe />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1, name: /Test Recipe/i })).toBeInTheDocument();
      });
  
      const saveButton = screen.getByRole("button", { name: /Save To Recipe List/i });
      fireEvent.click(saveButton);
  
      expect(global.fetch).toHaveBeenCalledWith(
        "http://3.144.40.72:5000/user/recipes",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": expect.stringContaining("Bearer") },
          body: JSON.stringify({ recipeId: "test1" }),
        })
      );
  
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Added to save list");
      });
    });
  
    test("opens and closes the add review modal", async () => {
      render(
        <MemoryRouter>
          <Recipe />
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 3, name: /Test Recipe/i })).toBeInTheDocument();
      });
  
      const addReviewBtn = screen.getByRole("button", { name: /Add Review/i });
      fireEvent.click(addReviewBtn);
  
      await waitFor(() => {
        expect(screen.getByText(/Add a Review/i)).toBeInTheDocument();
      });
  
      const commentBox = screen.getByPlaceholderText(/Your comment\.\.\./i) as HTMLTextAreaElement;
      fireEvent.change(commentBox, { target: { value: "Great recipe!" } });
      expect(commentBox.value).toBe("Great recipe!");
  
      const ratingSelect = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(ratingSelect, { target: { value: "5" } });
      expect(ratingSelect.value).toBe("5");
  
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
  
      await waitFor(() => {
        expect(screen.queryByText(/Add a Review/i)).not.toBeInTheDocument();
      });
    });
  
    test("fetches recipe from themealdb API when URL includes '/recipe/api/'", async () => {
      window.history.pushState({}, "", "/recipe/api/123");
      global.fetch = jest.fn((url: string) => {
        if (url.startsWith("https://www.themealdb.com/api/json/v1/1/lookup.php?i=")) {
          return Promise.resolve({
            json: () => Promise.resolve(dummyThemealdbResponse),
          } as Response);
        }
        return Promise.resolve({
          json: () => Promise.resolve({ recipes: [] }),
        } as Response);
      }) as jest.Mock;
  
      render(
        <MemoryRouter initialEntries={["/recipe/api/123"]}>
          <Routes>
            <Route path="/recipe/api/:id" element={<Recipe />} />
          </Routes>
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 3, name: /Dummy Meal/i })).toBeInTheDocument();
      });
    });
  
    test("submits review successfully and closes review modal", async () => {
      window.history.pushState({}, "", "/recipe/test1");
      global.fetch = jest.fn((url: string, options?: RequestInit) => {
        if (url === "http://3.144.40.72:5000/recipes/test1") {
          return Promise.resolve({
            json: () => Promise.resolve({ recipe: dummyRecipe }),
          } as Response);
        }
        if (url === "http://3.144.40.72:5000/recipes/test1/reviews") {
          if (options && options.method === "POST") {
            const body = JSON.parse(options.body as string);
            expect(body).toEqual({ comment: "Awesome!", rating: 5 });
            return Promise.resolve({
              json: () => Promise.resolve({ success: true }),
            } as Response);
          }
          return Promise.resolve({
            json: () => Promise.resolve({ success: true, reviews: [] }),
          } as Response);
        }
        return Promise.reject(new Error("Unhandled URL: " + url));
      }) as jest.Mock;
  
      render(
        <MemoryRouter initialEntries={["/recipe/test1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<Recipe />} />
          </Routes>
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Add Review/i })).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByRole("button", { name: /Add Review/i }));
  
      await waitFor(() => {
        expect(screen.getByText(/Add a Review/i)).toBeInTheDocument();
      });
  
      const commentBox = screen.getByPlaceholderText(/Your comment/i) as HTMLTextAreaElement;
      fireEvent.change(commentBox, { target: { value: "Awesome!" } });
      expect(commentBox.value).toBe("Awesome!");
  
      const submitButton = screen.getByRole("button", { name: /Submit/i });
      fireEvent.click(submitButton);
  

      await waitFor(() => {
        expect(screen.queryByText(/Add a Review/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
  
      // Search among fetch calls for the POST call.
      const postCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) =>
          call[0] === "http://3.144.40.72:5000/recipes/test1/reviews" &&
          call[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();
      if (postCall) {
        const body = JSON.parse(postCall[1].body as string);
        expect(body).toEqual({ comment: "Awesome!", rating: 5 });
      }
  
      // Expect at least 3 calls: one for GET details, one for POST, one for GET reviews.
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  });
  