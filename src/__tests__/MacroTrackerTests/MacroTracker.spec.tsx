import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MacroTracker from '../../Components/MacroTracker/MacroTracker';
import { useMacros } from '../../Components/MacroTracker/useMacros';

jest.mock('../../Components/MacroTracker/useMacros');

describe('MacroTracker Component', () => {
    const mockUseMacros = {
        macros: [
            { label: 'Protein', amount: 50, goal: 100 },
            { label: 'Carbs', amount: 150, goal: 200 },
        ],
        loading: false,
        error: '',
        inputValues: { Protein: 0, Carbs: 0 },
        setInputValues: jest.fn(),
        showInputs: false,
        setShowInputs: jest.fn(),
        updateMacros: jest.fn(),
        goals: { Protein: 120, Fats: 70, Carbs: 200, Calories: 2000 },
        updateGoals: jest.fn(),
        fetchMacros: jest.fn(),
        goalsVisible: false,
        setGoalsVisible: jest.fn(),
    };

    beforeEach(() => {
        (useMacros as jest.Mock).mockReturnValue(mockUseMacros);
    });

    it('renders correctly with macros', () => {
        render(<MacroTracker />);

        expect(screen.getByText("Today's Macros")).toBeInTheDocument();
        expect(screen.getByText('Protein')).toBeInTheDocument();
        expect(screen.getByText('Carbs')).toBeInTheDocument();
    });

    it('shows AddToMacros when Add Macros button is clicked', () => {
        mockUseMacros.showInputs = true;
        render(<MacroTracker />);

        expect(screen.getByText('Add Macros')).toBeInTheDocument();
    });

    it('shows GoalInput when Change Daily Goals button is clicked', () => {
        mockUseMacros.goalsVisible = true;
        render(<MacroTracker />);

        expect(screen.getByText('Save Goals')).toBeInTheDocument();
    });
});