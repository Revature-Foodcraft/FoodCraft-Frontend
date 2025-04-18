import { render, screen, waitFor } from "@testing-library/react";
import DisplayRecipe from "../../Components/SearchFeature/DisplayRecipes";
import { DisplayContext } from "../../Components/Contexts";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';

jest.mock("fuse.js", () => {
  return {
    __esModule: true,
    default: class Fuse {
      list: any[];
      options: any;
      constructor(list: any[], options: any) {
        this.list = list;
        this.options = options;
      }
      search(query: string) {
        const lowerQuery = query.toLowerCase();
        return this.list
          .filter(item => String(item.name).toLowerCase().includes(lowerQuery))
          .map(item => ({ item }));
      }
    },
  };
});

describe("DisplayRecipe Component", () => {
  const testRecipe = {
    id: "1",
    PK: "1",
    name: "Test Recipe",
    dateCreated: "2024-01-01",
    rating: 5,
    source: "api",
  };

  const contextValue = {
    sortBy: "Recently Added",
    invert: false,
    selectedCuisine: "",
    mealCategory: "",
    setSelectedCuisine: jest.fn(),
    setMealCategorySelect: jest.fn(),
    setSortBy: jest.fn(),
    setInvert: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches recipes and renders them with pagination and a proper Link", async () => {
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: [testRecipe],
          }),
      })
    );
    render(
      <DisplayContext.Provider value={contextValue}>
        <MemoryRouter>
          <DisplayRecipe searchQuery={null} />
        </MemoryRouter>
      </DisplayContext.Provider>
    );

    await waitFor(() => expect(screen.getByText("Test Recipe")).toBeInTheDocument());
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();

    const linkElement = screen.getByRole("link", { name: /Test Recipe/i });
    expect(linkElement).toHaveAttribute("href", "/recipe/api/1");

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("sorts recipes by Rating", async () => {
    const recipe1 = { id: "1", PK: "1", name: "Alpha", dateCreated: "2024-01-01", rating: 2, source: "api" };
    const recipe2 = { id: "2", PK: "2", name: "Beta", dateCreated: "2024-01-02", rating: 5, source: "api" };
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: [recipe1, recipe2],
          }),
      })
    );
    const contextWithSortRating = { ...contextValue, sortBy: "Rating" };
    render(
      <DisplayContext.Provider value={contextWithSortRating}>
        <MemoryRouter>
          <DisplayRecipe searchQuery={null} />
        </MemoryRouter>
      </DisplayContext.Provider>
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Beta");
    expect(links[1]).toHaveTextContent("Alpha");
  });

  it("sorts recipes alphabetically", async () => {
    const recipe1 = { id: "1", PK: "1", name: "Beta", dateCreated: "2024-01-01", rating: 2, source: "api" };
    const recipe2 = { id: "2", PK: "2", name: "Alpha", dateCreated: "2024-01-02", rating: 5, source: "api" };
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: [recipe1, recipe2],
          }),
      })
    );
    const contextWithSortAlpha = { ...contextValue, sortBy: "Alphabetically" };
    render(
      <DisplayContext.Provider value={contextWithSortAlpha}>
        <MemoryRouter>
          <DisplayRecipe searchQuery={null} />
        </MemoryRouter>
      </DisplayContext.Provider>
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    const links = screen.getAllByRole("link");

    expect(links[0]).toHaveTextContent("Alpha");
    expect(links[1]).toHaveTextContent("Beta");
  });

  it("applies invert when flagged", async () => {
    const recipe1 = { id: "1", PK: "1", name: "Alpha", dateCreated: "2024-01-01", rating: 2, source: "api" };
    const recipe2 = { id: "2", PK: "2", name: "Beta", dateCreated: "2024-01-02", rating: 5, source: "api" };
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: [recipe1, recipe2],
          }),
      })
    );
    const contextWithInvert = { ...contextValue, invert: true, sortBy: "Recently Added" };
    render(
      <DisplayContext.Provider value={contextWithInvert}>
        <MemoryRouter>
          <DisplayRecipe searchQuery={null} />
        </MemoryRouter>
      </DisplayContext.Provider>
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Alpha");
    expect(links[1]).toHaveTextContent("Beta");
  });

  it("paginates results correctly when more than 18 recipes are returned", async () => {
    const recipes = Array.from({ length: 20 }, (_, index) => ({
      id: `${index + 1}`,
      PK: `${index + 1}`,
      name: `Recipe ${index + 1}`,
      dateCreated: `2024-01-${(index % 30) + 1 < 10 ? `0${(index % 30) + 1}` : (index % 30) + 1}`,
      rating: index % 5,
      source: "api",
    }));
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: recipes,
          }),
      })
    );
    render(
      <DisplayContext.Provider value={contextValue}>
        <MemoryRouter>
          <DisplayRecipe searchQuery={null} />
        </MemoryRouter>
      </DisplayContext.Provider>
    );

    await waitFor(() => expect(screen.getByText("Recipe 1")).toBeInTheDocument());

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("filters recipes based on searchQuery using Fuse", async () => {

    const recipe1 = { id: "1", PK: "1", name: "Apple Pie", dateCreated: "2024-01-01", rating: 3, source: "api" };
    const recipe2 = { id: "2", PK: "2", name: "Banana Bread", dateCreated: "2024-01-02", rating: 4, source: "api" };
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            recipes: [recipe1, recipe2],
          }),
      })
    );
    render(
      <DisplayContext.Provider value={contextValue}>
        <MemoryRouter>
          <DisplayRecipe searchQuery="Apple" />
        </MemoryRouter>
      </DisplayContext.Provider>
    );
    await waitFor(() => expect(screen.getByText("Apple Pie")).toBeInTheDocument());

    expect(screen.queryByText("Banana Bread")).not.toBeInTheDocument();
  });
});