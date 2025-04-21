import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateRecipe from "../../pages/saveRecipe";
import { MemoryRouter } from "react-router-dom";
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("CreateRecipe Component", () => {
  test("renders form elements correctly", async () => {
    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", { level: 1, name: /Create Recipe/i });
    expect(heading).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/Recipe Name/i)).toBeInTheDocument();

    expect(screen.getByText(/Select Cuisine/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Category/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /\+ Add Ingredient/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ Add Instruction/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Recipe/i })).toBeInTheDocument();

    expect(screen.getByText(/Calories/i)).toBeInTheDocument();
    expect(screen.getByText(/Protein/i)).toBeInTheDocument();
    expect(screen.getByText(/Carbs/i)).toBeInTheDocument();
    expect(screen.getByText(/Fat/i)).toBeInTheDocument();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
  });

  test("updates recipe name on user input", () => {
    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );
    const recipeNameInput = screen.getByPlaceholderText(/Recipe Name/i) as HTMLInputElement;

    fireEvent.change(recipeNameInput, { target: { value: "My Awesome Recipe" } });
    expect(recipeNameInput.value).toBe("My Awesome Recipe");
  });

  test("adds a new ingredient field when '+ Add Ingredient' button is clicked", () => {
    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    const initialIngredientPlaceholders = screen.queryAllByText("Search Ingredient");
    const initialCount = initialIngredientPlaceholders.length;

    const addIngredientBtn = screen.getByRole("button", { name: /\+ Add Ingredient/i });
    fireEvent.click(addIngredientBtn);

    const newIngredientPlaceholders = screen.queryAllByText("Search Ingredient");
    expect(newIngredientPlaceholders.length).toBe(initialCount + 1);
  });

  test("adds a new instruction field when '+ Add Instruction' button is clicked", () => {
    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Step 1/i)).toBeInTheDocument();

    const addInstructionBtn = screen.getByRole("button", { name: /\+ Add Instruction/i });
    fireEvent.click(addInstructionBtn);

    expect(screen.getByPlaceholderText(/Step 2/i)).toBeInTheDocument();
  });

  test("updates macro inputs when changed", () => {
    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    const macroInputs = screen.getAllByRole("spinbutton") as HTMLInputElement[];

    fireEvent.change(macroInputs[0], { target: { value: "300" } });

    expect(macroInputs[0].value).toBe("300");
  });

  test("handles file upload and shows preview image", async () => {

    const generateUrlResponse = { uploadUrl: "http://dummy-upload-url", publicUrl: "http://dummy-public-url.jpg" };

    const originalFetch = global.fetch;
    global.fetch = jest.fn((url: string, options?: RequestInit) => {
      if (url.includes("s3/generate-upload-url")) {
        return Promise.resolve({
          json: () => Promise.resolve(generateUrlResponse),
        } as Response);
      }
      if (options?.method === "PUT") {
        return Promise.resolve({ ok: true } as Response);
      }
      return originalFetch(url, options);
    }) as jest.Mock;

    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const previewImage = screen.getByRole("img", { name: /test-image\.png/i });
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute("src", generateUrlResponse.publicUrl);
    });

    global.fetch = originalFetch;
  });

  test("calls handleSubmit and submits recipe when 'Submit Recipe' is clicked", async () => {
    localStorage.setItem("token", "dummy-token");

    const recipeSubmitResponse = { success: true };
    const fetchSubmitMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(recipeSubmitResponse),
    } as Response);
    global.fetch = fetchSubmitMock as any;

    render(
      <MemoryRouter>
        <CreateRecipe />
      </MemoryRouter>
    );

    const recipeNameInput = screen.getByPlaceholderText(/Recipe Name/i) as HTMLInputElement;
    fireEvent.change(recipeNameInput, { target: { value: "Test Recipe Submission" } });

    const macroInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(macroInputs[0], { target: { value: "350" } });

    const submitButton = screen.getByRole("button", { name: /Submit Recipe/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchSubmitMock).toHaveBeenCalledWith(
        "http://3.144.40.72:5000/recipes/addRecipe",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer dummy-token`,
          }),
          body: expect.any(String),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Recipe created successfully!")).toBeInTheDocument();
    });

    global.fetch = jest.fn();
  });
});