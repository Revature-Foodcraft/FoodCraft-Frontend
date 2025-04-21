import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddToMacros from '../../Components/MacroTracker/AddToMacros';

describe('AddToMacros Component', () => {
    const mockMacros = [
        { label: 'Protein', amount: 50, goal: 100 },
        { label: 'Carbs', amount: 150, goal: 200 },
    ];

    const mockInputValues = { Protein: 0, Carbs: 0 };
    const mockOnInputChange = jest.fn();
    const mockOnSubmit = jest.fn();

    it('renders correctly with given macros', () => {
        render(
            <AddToMacros
                macros={mockMacros}
                inputValues={mockInputValues}
                onInputChange={mockOnInputChange}
                onSubmit={mockOnSubmit}
            />
        );

        expect(screen.getByText('Protein')).toBeInTheDocument();
        expect(screen.getByText('Carbs')).toBeInTheDocument();
    });

    it('calls onInputChange when input values are changed', () => {
        render(
            <AddToMacros
                macros={mockMacros}
                inputValues={mockInputValues}
                onInputChange={mockOnInputChange}
                onSubmit={mockOnSubmit}
            />
        );

        const proteinInput = screen.getByLabelText('Protein');
        fireEvent.change(proteinInput, { target: { value: '20' } });

        expect(mockOnInputChange).toHaveBeenCalledWith('Protein', 20);
    });

    it('calls onSubmit when the Add button is clicked', () => {
        render(
            <AddToMacros
                macros={mockMacros}
                inputValues={mockInputValues}
                onInputChange={mockOnInputChange}
                onSubmit={mockOnSubmit}
            />
        );

        const addButton = screen.getByText('Add');
        fireEvent.click(addButton);

        expect(mockOnSubmit).toHaveBeenCalled();
    });
});