import { render, screen } from "@testing-library/react";
import SmartFridgeContainer from "../../Components/SmartFridge/SmartFridgeContainer";

describe("SmartFridgeContainer", () => {
    it("renders Smart Fridge title", () => {
        render(<SmartFridgeContainer />);
        expect(screen.getByText(/Smart Fridge/i)).toBeInTheDocument();
    });
});