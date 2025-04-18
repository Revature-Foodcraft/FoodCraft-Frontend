import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SortByDropdown from "../../Components/SearchFeature/SortByDropdown";
import { DisplayContext } from "../../Components/Contexts";

describe("SortByDropdown Component", () => {
  const defaultContext = {
    selectedCuisine: "",
    setSelectedCuisine: jest.fn(),
    mealCategory: "",
    setMealCategorySelect: jest.fn(),
    sortBy: "Recently Added",
    setSortBy: jest.fn(),
    invert: false,
    setInvert: jest.fn(),
  };

  const renderComponent = (contextOverrides = {}) => {
    const contextValue = { ...defaultContext, ...contextOverrides };
    render(
      <DisplayContext.Provider value={contextValue}>
        <SortByDropdown />
      </DisplayContext.Provider>
    );
    return contextValue;
  };

  it("renders correctly with initial context", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /Sort by:/i })).toHaveTextContent(
      "Sort by: Recently Added"
    );

    expect(screen.queryByRole("list")).toBeNull();
  });

  it("opens dropdown when sort button is clicked", () => {
    renderComponent();

    const sortButton = screen.getByRole("button", { name: /Sort by:/i });
    fireEvent.click(sortButton);

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    expect(screen.getByLabelText("Recently Added")).toBeInTheDocument();
    expect(screen.getByLabelText("Rating")).toBeInTheDocument();
    expect(screen.getByLabelText("Alphabetically")).toBeInTheDocument();
  });

  it("calls setSortBy when a sort option is selected", () => {
    const { setSortBy: mockSetSortBy } = renderComponent();

    const sortButton = screen.getByRole("button", { name: /Sort by:/i });
    fireEvent.click(sortButton);


    const ratingOption = screen.getByLabelText("Rating");
    fireEvent.click(ratingOption);


    expect(mockSetSortBy).toHaveBeenCalledWith("Rating");
  });

  it("toggles invert when the filter button is clicked", () => {
    const { invert, setInvert: mockSetInvert } = renderComponent({ invert: false });
    
    const filterImage = screen.getByAltText("Filter Icon");
    const filterButton = filterImage.closest("button");
    expect(filterButton).toBeInTheDocument();

    fireEvent.click(filterButton!);

    expect(mockSetInvert).toHaveBeenCalledWith(true);
  });

  it("closes the dropdown when the overlay is clicked", async () => {
    renderComponent();

    const sortButton = screen.getByRole("button", { name: /Sort by:/i });
    fireEvent.click(sortButton);
    expect(screen.getByRole("list")).toBeInTheDocument();

    const overlay = document.querySelector('div[style*="position: fixed"]');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByRole("list")).toBeNull();
    });
  });
});