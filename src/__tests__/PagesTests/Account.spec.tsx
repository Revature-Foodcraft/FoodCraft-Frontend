import React from "react";
import { render, screen } from "@testing-library/react";
import Account from "../../pages/Account"; // Adjust the path as necessary
import MacroTracker from "../../Components/MacroTracker/MacroTracker";
import SmartFridge from "../../Components/SmartFridge/SmartFridgeContainer";
import SavedRecipes from "../../Components/SavedRecipes/SavedRecipes";

jest.mock('../../Components/MacroTracker/MacroTracker', () => ({
    __esModule: true,
    default: () => (
      <div data-testid="macro-tracker">MacroTracker Mock</div>
    ),
  }));
  
  jest.mock('../../Components/SmartFridge/SmartFridgeContainer', () => ({
    __esModule: true,
    default: () => (
      <div data-testid="smart-fridge">SmartFridge Mock</div>
    ),
  }));
  
  jest.mock('../../Components/SavedRecipes/SavedRecipes', () => ({
    __esModule: true,
    default: () => (
      <div data-testid="saved-recipes">SavedRecipes Mock</div>
    ),
  }));
  
  describe('Account Component', () => {
    it('renders the account container with the main content', () => {
      const { container } = render(<Account />);
      const accountContainer = container.querySelector('.account-container');
      expect(accountContainer).toBeInTheDocument();
    });
  
    it('renders the MacroTracker section', () => {
      render(<Account />);
      const macroTracker = screen.getByTestId('macro-tracker');
      expect(macroTracker).toBeInTheDocument();
      expect(macroTracker).toHaveTextContent('MacroTracker Mock');
    });
  
    it('renders the SmartFridge section', () => {
      render(<Account />);
      const smartFridge = screen.getByTestId('smart-fridge');
      expect(smartFridge).toBeInTheDocument();
      expect(smartFridge).toHaveTextContent('SmartFridge Mock');
    });
  
    it('renders the SavedRecipes section', () => {
      render(<Account />);
      const savedRecipes = screen.getByTestId('saved-recipes');
      expect(savedRecipes).toBeInTheDocument();
      expect(savedRecipes).toHaveTextContent('SavedRecipes Mock');
    });
  });