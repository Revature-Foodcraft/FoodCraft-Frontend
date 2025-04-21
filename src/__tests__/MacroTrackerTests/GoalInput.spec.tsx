import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalInput from '../../Components/MacroTracker/GoalInput';

describe('GoalInput Component', () => {
    const mockCurrentGoals = { Protein: 120, Fats: 70, Carbs: 200, Calories: 2000 };
    const mockOnSave = jest.fn();
    const mockSetGoalsVisible = jest.fn();

    it('renders correctly with current goals', () => {
        render(
            <GoalInput
                currentGoals={mockCurrentGoals}
                onSave={mockOnSave}
                setGoalsVisible={mockSetGoalsVisible}
            />
        );

        expect(screen.getByLabelText('Protein')).toBeInTheDocument();
        expect(screen.getByLabelText('Fats')).toBeInTheDocument();
        expect(screen.getByLabelText('Carbs')).toBeInTheDocument();
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
    });

    it('updates goal values when inputs are changed', () => {
        render(
            <GoalInput
                currentGoals={mockCurrentGoals}
                onSave={mockOnSave}
                setGoalsVisible={mockSetGoalsVisible}
            />
        );

        const proteinInput = screen.getByLabelText('Protein');
        fireEvent.change(proteinInput, { target: { value: '150' } });

        expect(proteinInput.value).toBe('150');
    });

    it('calls onSave and setGoalsVisible when Save button is clicked', () => {
        render(
            <GoalInput
                currentGoals={mockCurrentGoals}
                onSave={mockOnSave}
                setGoalsVisible={mockSetGoalsVisible}
            />
        );

        const saveButton = screen.getByText('Save Goals');
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledWith({ Protein: 120, Fats: 70, Carbs: 200, Calories: 2000 });
        expect(mockSetGoalsVisible).toHaveBeenCalledWith(false);
    });
});