import { renderHook, act } from '@testing-library/react';
import { useMacros } from '../../Components/MacroTracker/useMacros';

global.fetch = jest.fn();

describe('useMacros Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches macros on mount', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                daily_macros: {
                    protein: 50,
                    fats: 20,
                    carbs: 100,
                    proteinGoal: 100,
                    fatsGoal: 50,
                    carbsGoal: 200,
                    calories: 1500,
                    caloriesGoal: 2000,
                },
            }),
        });

        const { result } = renderHook(() => useMacros());

        await act(async () => {
            await result.current.fetchMacros();
        });

        expect(result.current.macros).toEqual([
            { label: 'Protein', amount: 50, goal: 100 },
            { label: 'Fats', amount: 20, goal: 50 },
            { label: 'Carbs', amount: 100, goal: 200 },
            { label: 'Calories', amount: 1500, goal: 2000 },
        ]);
    });

    it('handles errors during fetch', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        const { result } = renderHook(() => useMacros());

        await act(async () => {
            await result.current.fetchMacros();
        });

        expect(result.current.error).toBe('Failed to fetch');
    });
});