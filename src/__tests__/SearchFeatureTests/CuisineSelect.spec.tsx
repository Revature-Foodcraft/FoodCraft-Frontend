import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CuisineSelect from "../../Components/SearchFeature/CuisineSelect";
import { DisplayContext } from "../../Components/Contexts";

beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          meals: [{ strArea: "Italian" }, { strArea: "French" }],
        }),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("CuisineSelect Component", () => {
  it("renders cuisines from the mock API", async () => {
    const mockSetSelectedValue = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: mockSetSelectedValue,
      mealCategory: "",
      setMealCategorySelect: jest.fn(),
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <CuisineSelect />
      </DisplayContext.Provider>
    );

    const italianCheckbox = await screen.findByLabelText("Italian");
    const frenchCheckbox = await screen.findByLabelText("French");

    expect(italianCheckbox).toBeInTheDocument();
    expect(frenchCheckbox).toBeInTheDocument();
  });

  it("calls setSelectedCuisine when a checkbox is toggled", async () => {
    const mockSetSelectedValue = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: mockSetSelectedValue,
      mealCategory: "",
      setMealCategorySelect: jest.fn(),
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <CuisineSelect />
      </DisplayContext.Provider>
    );

    const italianCheckbox = await screen.findByLabelText("Italian");

    fireEvent.click(italianCheckbox);

    expect(mockSetSelectedValue).toHaveBeenCalledWith(expect.any(Function));

    const updater = mockSetSelectedValue.mock.calls[0][0];
    expect(updater("")).toBe("Italian");
  });

  it("logs an error when the API call fails", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("API Error"))
    );
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const mockSetSelectedValue = jest.fn();
    const mockContextValue = {
      selectedCuisine: "",
      setSelectedCuisine: mockSetSelectedValue,
      mealCategory: "",
      setMealCategorySelect: jest.fn(),
      sortBy: "Recently Added",
      setSortBy: jest.fn(),
      invert: false,
      setInvert: jest.fn(),
    };

    render(
      <DisplayContext.Provider value={mockContextValue}>
        <CuisineSelect />
      </DisplayContext.Provider>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    });

    consoleLogSpy.mockRestore();
  });
});