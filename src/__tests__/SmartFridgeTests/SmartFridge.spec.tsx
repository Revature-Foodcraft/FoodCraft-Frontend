import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SmartFridgeContainer from "../../Components/SmartFridge/SmartFridgeContainer";
import useIngredients from "../../Components/SmartFridge/useIngredients";
import { IngredientCategory } from "../../Types/Ingredient";

jest.mock("../../Components/SmartFridge/useIngredients");

describe("SmartFridgeContainer", () => {
    const mockUseIngredients = useIngredients as jest.MockedFunction<typeof useIngredients>;

    beforeEach(() => {
        mockUseIngredients.mockReturnValue({
            ingredients: [
                { id: "1", name: "Carrot", amount: 2, unit: "kg", category: IngredientCategory.Vegetables },
                { id: "2", name: "Chicken", amount: 1, unit: "kg", category: IngredientCategory.Meat },
            ],
            loading: false,
            error: null,
            addIngredient: jest.fn(),
            updateIngredient: jest.fn(),
            removeIngredient: jest.fn(),
            fetchIngredients: jest.fn(),
        });
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ data: "mocked response" }),
            })
        ) as jest.Mock;

    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    it("renders the Smart Fridge title", () => {
        render(<SmartFridgeContainer />);
        expect(screen.getByText(/Smart Fridge/i)).toBeInTheDocument();
    });

    it("displays ingredients grouped by category", () => {
        render(<SmartFridgeContainer />);
        expect(screen.getByText(/Vegetables/i)).toBeInTheDocument();
        expect(screen.getByText(/Carrot/i)).toBeInTheDocument();
        expect(screen.getByText(/Meat/i)).toBeInTheDocument();
        expect(screen.getByText(/Chicken/i)).toBeInTheDocument();
    });

    it("opens the Add Ingredient modal when the button is clicked", () => {
        render(<SmartFridgeContainer />);
        const addButton = screen.getByText(/Add Ingredient/i);
        fireEvent.click(addButton);
        expect(screen.getByText(/Add Ingredient/i)).toBeInTheDocument();
    });

    it("handles ingredient removal", async () => {
        const removeIngredientMock = jest.fn();
        mockUseIngredients.mockReturnValueOnce({
            ...mockUseIngredients(null),
            removeIngredient: removeIngredientMock,
        });

        render(<SmartFridgeContainer />);
        const deleteButton = screen.getAllByRole("button", { name: "" })[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(removeIngredientMock).toHaveBeenCalledWith("1");
        });
    });

    it("handles ingredient updates", async () => {
        const updateIngredientMock = jest.fn();
        mockUseIngredients.mockReturnValueOnce({
            ...mockUseIngredients(null),
            updateIngredient: updateIngredientMock,
        });

        render(<SmartFridgeContainer />);
        const editableText = screen.getByText(/2 kg/i);
        fireEvent.click(editableText);

        const inputField = screen.getByRole("spinbutton");
        fireEvent.change(inputField, { target: { value: "3" } });

        const saveButton = screen.getByText(/Save/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(updateIngredientMock).toHaveBeenCalledWith("1", 3, "kg");
        });
    });

    it("adds a new ingredient and displays it in the correct category", async () => {
        const addIngredientMock = jest.fn();
        mockUseIngredients.mockReturnValueOnce({
            ...mockUseIngredients(null),
            addIngredient: addIngredientMock,
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    ingredients: [

                        {
                            "unit": "N/A",
                            "SK": "INGREDIENT",
                            "PK": "211",
                            "name": "Milk"
                        },
                        {
                            "unit": "N/A",
                            "SK": "INGREDIENT",
                            "PK": "546",
                            "name": "Almond Milk"
                        }
                    ]
                }),
            })
        ) as jest.Mock;

        render(<SmartFridgeContainer />);
        // Open Add Ingredient Modal
        fireEvent.click(screen.getByText(/Add Ingredient/i));

        // Fill the ingredient form
        fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: "Milk" } });
        fireEvent.change(screen.getByLabelText(/Amount:/i), { target: { value: "2" } });
        fireEvent.change(screen.getByLabelText(/Unit:/i), { target: { value: "l" } });
        fireEvent.change(screen.getByLabelText(/Category:/i), { target: { value: IngredientCategory.Dairy } });


        // Submit the form
        fireEvent.click(screen.getByText(/Save/i));

        console.log("Mock addIngredient called with:", addIngredientMock.mock.calls);

        // Verify ingredient addition
        await waitFor(() => {
            expect(addIngredientMock).toHaveBeenCalledWith({
                name: "Milk",
                amount: 2,
                unit: "l",
                category: IngredientCategory.Dairy,
            });
        });


        // Ensure ingredient appears in UI
        await waitFor(() => {
            expect(screen.getByText(/Dairy/i)).toBeInTheDocument();
            expect(screen.getByText(/Milk/i)).toBeInTheDocument();
        });

    });
});