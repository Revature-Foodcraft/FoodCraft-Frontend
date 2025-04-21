import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MacroTracker from '../../Components/MacroTracker/MacroTracker';
import MacroCircle from '../../Components/MacroTracker/MacroCircle';
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

    it('calls fetchMacros on component mount', () => {
        render(<MacroTracker />);
        expect(mockUseMacros.fetchMacros).toHaveBeenCalled();
    });

    it('toggles showInputs state when Add Macros button is clicked', () => {
        mockUseMacros.showInputs = false; // Ensure initial state is false
        render(<MacroTracker />);
        const addButton = screen.getByText('Add Macros');
        fireEvent.click(addButton);
        expect(mockUseMacros.setShowInputs).toHaveBeenCalledWith(true);
    });

    it('handles toggling showInputs off when already true', () => {
        mockUseMacros.showInputs = true;
        render(<MacroTracker />);
        const addButton = screen.getByText('Add Macros');
        fireEvent.click(addButton);
        expect(mockUseMacros.setShowInputs).toHaveBeenCalledWith(false);
    });

    it('toggles goalsVisible state when Change Daily Goals button is clicked', () => {
        jest.clearAllMocks();
        mockUseMacros.goalsVisible = false; // Ensure initial state is false

        render(<MacroTracker />);
        const goalsButton = screen.getByText('Change Daily Goals');
        fireEvent.click(goalsButton);
        expect(mockUseMacros.setGoalsVisible).toHaveBeenCalledTimes(1);
        expect(mockUseMacros.setGoalsVisible).toHaveBeenCalledWith(true);
    });

    it('handles toggling goalsVisible off when already true', () => {
        mockUseMacros.goalsVisible = true;
        render(<MacroTracker />);
        const goalsButton = screen.getByText('Change Daily Goals');
        fireEvent.click(goalsButton);
        expect(mockUseMacros.setGoalsVisible).toHaveBeenCalledWith(false);
    });

    it('renders loading state', () => {
        mockUseMacros.loading = true;
        render(<MacroTracker loading={true} />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it('renders error state', () => {
        mockUseMacros.error = 'Error fetching data';
        render(<MacroTracker error="Error fetching data" />);
        expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
    });

    it('renders macro data correctly', () => {

        const macros = [
            { label: 'Protein', amount: 50, goal: 100 },
            { label: 'Carbs', amount: 75, goal: 150 },
        ];
        mockUseMacros.macros = macros;
        render(<MacroTracker />);
        const proteinElements = screen.getAllByText(/Protein/i);
        expect(proteinElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/50\/100/i)).toBeInTheDocument();
        //expect(screen.getByText(/^Carbs$/i)).toBeInTheDocument();
        expect(screen.getByRole('label', { name: 'Carbs' })).toBeInTheDocument();
        expect(screen.getByText(/75\/150/i)).toBeInTheDocument();
    });

    it('handles empty macros list', () => {
        mockUseMacros.macros = [];
        render(<MacroTracker />);
        expect(screen.getByText(/No macros to display/i)).toBeInTheDocument();
    });
});

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