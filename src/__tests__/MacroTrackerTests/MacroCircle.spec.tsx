import React from 'react';
import { render, screen } from '@testing-library/react';
import MacroCircle from '../../Components/MacroTracker/MacroCircle';

describe('MacroCircle Component', () => {
    const mockMacroData = { label: 'Protein', amount: 50, goal: 100 };

    it('renders correctly with given macro data', () => {
        render(<MacroCircle {...mockMacroData} />);

        expect(screen.getByText('Protein')).toBeInTheDocument();
        expect(screen.getByText('50/100')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('displays 0% progress when goal is 0', () => {
        render(<MacroCircle label="Protein" amount={50} goal={0} />);

        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('caps progress at 100% when amount exceeds goal', () => {
        render(<MacroCircle label="Protein" amount={150} goal={100} />);

        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it("displays 0% progress when amount is 0 and goal is greater than 0", () => {
        render(<MacroCircle label="Protein" amount={0} goal={100} />);
        expect(screen.getByText("0%"));
    });

    it("displays correct percentage when amount is less than goal", () => {
        render(<MacroCircle label="Protein" amount={50} goal={100} />);
        expect(screen.getByText("50%"));
    });

    it("renders flame icon at correct position", () => {
        render(<MacroCircle label="Protein" amount={50} goal={100} />);
        const flame = screen.getByText("🔥");
        expect(flame).toBeInTheDocument();
    });
});