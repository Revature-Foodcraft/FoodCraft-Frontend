import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MealCategorySelect from "../../Components/SearchFeature/MealCategorySelect";
import { DisplayContext } from "../../Components/Contexts";

describe("MealCategorySelect Component", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            meals: [
              { strCategory: "Beef" },
              { strCategory: "Chicken" }
            ],
          }),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders meal categories from the mock API", async () => {
    const mockSetMealCategorySelect = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: jest.fn(),
      mealCategory: "",
      setMealCategorySelect: mockSetMealCategorySelect,
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <MealCategorySelect />
      </DisplayContext.Provider>
    );

    const beefCheckbox = await screen.findByLabelText("Beef");
    const chickenCheckbox = await screen.findByLabelText("Chicken");

    expect(beefCheckbox).toBeInTheDocument();
    expect(chickenCheckbox).toBeInTheDocument();
  });

  it("calls setMealCategorySelect when a checkbox is toggled", async () => {
    const mockSetMealCategorySelect = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: jest.fn(),
      mealCategory: "",
      setMealCategorySelect: mockSetMealCategorySelect,
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <MealCategorySelect />
      </DisplayContext.Provider>
    );

    const beefCheckbox = await screen.findByLabelText("Beef");

    fireEvent.click(beefCheckbox);

    expect(mockSetMealCategorySelect).toHaveBeenCalledWith(expect.any(Function));

    const updater = mockSetMealCategorySelect.mock.calls[0][0];

    expect(updater("")).toBe("Beef");
  });

  it("logs an error when the API call fails", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("API Error"))
    );
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const mockSetMealCategorySelect = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: jest.fn(),
      mealCategory: "",
      setMealCategorySelect: mockSetMealCategorySelect,
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <MealCategorySelect />
      </DisplayContext.Provider>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    });

    consoleLogSpy.mockRestore();
  });
});