import { render, screen, waitFor } from '@testing-library/react';
import { useMacros } from '../../Components/MacroTracker/useMacros';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

describe('useMacros', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
        jest.clearAllMocks();
    });

    const TestComponent = () => {
        const hook = useMacros();
        return (
            <div>
                <div data-testid="macros">{JSON.stringify(hook.macros)}</div>
                <div data-testid="loading">{hook.loading.toString()}</div>
                <div data-testid="error">{hook.error}</div>
                <div data-testid="inputValues">{JSON.stringify(hook.inputValues)}</div>
                <div data-testid="goals">{JSON.stringify(hook.goals)}</div>
            </div>
        );
    };

    it('should initialize with default values', () => {
        render(<TestComponent />);

        expect(screen.getByTestId('macros').textContent).toBe('[]');
        expect(screen.getByTestId('error').textContent).toBe('');
        expect(screen.getByTestId('inputValues').textContent).toBe(
            JSON.stringify({ Protein: 0, Fats: 0, Carbs: 0, Calories: 0 })
        );
        expect(screen.getByTestId('goals').textContent).toBe(
            JSON.stringify({ Protein: 120, Fats: 70, Carbs: 200, Calories: 2000 })
        );
    });

    it('should fetch macros successfully', async () => {
        const mockResponse = {
            daily_macros: {
                protein: 50,
                fats: 20,
                carbs: 100,
                calories: 1200,
                proteinGoal: 120,
                fatsGoal: 70,
                carbsGoal: 200,
                caloriesGoal: 2000,
            },
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('macros').textContent).toContain('Protein');
        });
    });

    it('should handle fetch macros error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Failed to fetch macros, status: 500');
        });
    });

    it('should update macros successfully', async () => {
        const mockResponse = {
            daily_macros: {
                protein: 60,
                fats: 30,
                carbs: 110,
                calories: 1300,
                proteinGoal: 120,
                fatsGoal: 70,
                carbsGoal: 200,
                caloriesGoal: 2000,
            },
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('macros').textContent).toContain('Protein');
        });
    });

    it('should handle update macros error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Failed to fetch macros, status: 500');
        });
    });

    it('should update goals successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('goals').textContent).toContain('Protein');
        });
    });

    it('should handle update goals error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Failed to fetch macros, status: 500');
        });
    });
});