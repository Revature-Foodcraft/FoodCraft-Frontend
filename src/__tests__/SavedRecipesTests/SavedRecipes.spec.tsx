import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SavedRecipes from '../../Components/SavedRecipes/SavedRecipes';
import { MemoryRouter } from 'react-router-dom';

global.fetch = jest.fn();

describe('SavedRecipes Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: [] }),
        });

        render(
            <MemoryRouter>
                <SavedRecipes />
            </MemoryRouter>
        );

        expect(screen.getByText('Loading recipes...')).toBeInTheDocument();
    });

    it('renders recipes when fetched successfully', async () => {
        const mockRecipes = [
            { PK: '1', name: 'Recipe 1', user_id: 'User 1', description: 'Description 1' },
            { PK: '2', name: 'Recipe 2', user_id: 'User 2', description: 'Description 2' },
        ];

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: mockRecipes }),
        });

        render(
            <MemoryRouter>
                <SavedRecipes />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Recipe 1')).toBeInTheDocument());
        expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    });

    it('handles errors during fetch', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(
            <MemoryRouter>
                <SavedRecipes />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Failed to load recipes/i)).toBeInTheDocument());
    });

    it('deletes a recipe when delete button is clicked', async () => {
        const mockRecipes = [
            { PK: '1', name: 'Recipe 1', user_id: 'User 1', description: 'Description 1' },
        ];

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: mockRecipes }),
        });

        render(
            <MemoryRouter>
                <SavedRecipes />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Recipe 1')).toBeInTheDocument());

        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => expect(screen.queryByText('Recipe 1')).not.toBeInTheDocument());
    });
});