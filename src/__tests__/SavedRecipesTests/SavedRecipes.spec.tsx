import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SavedRecipes from '../../Components/SavedRecipes/SavedRecipes';

describe('SavedRecipes Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
        global.fetch = jest.fn();
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('renders loading state initially', () => {
        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        expect(screen.getByText('Loading recipes...')).toBeInTheDocument();
    });

    it('renders error message when fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText((content) => content.includes("Oops! Looks like you haven't saved any recipes yet. Start building your collection now!"))).toBeInTheDocument();
        });
    });

    it('renders recipes when fetch is successful', async () => {
        const mockRecipes = [
            { PK: '1', name: 'Recipe 1', user_id: 'User 1', description: 'Description 1' },
            { PK: '2', name: 'Recipe 2', user_id: 'User 2', description: 'Description 2' },
        ];

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: mockRecipes }),
        });

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
            expect(screen.getByText('Recipe 2')).toBeInTheDocument();
        });
    });

    it('handles delete recipe functionality', async () => {
        const mockRecipes = [
            { PK: '1', name: 'Recipe 1', user_id: 'User 1', description: 'Description 1' },
        ];

        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ recipes: mockRecipes }),
            }) // Initial fetch
            .mockResolvedValueOnce({ ok: true }); // Delete request

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /🗑/ });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Recipe 1')).not.toBeInTheDocument();
        });
    });

    it('renders empty state when no recipes are available', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: [] }),
        });

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText("Oops! Looks like you haven't saved any recipes yet. Start building your collection now!")
            ).toBeInTheDocument();
        });
    });

    it('renders error when token is missing', async () => {
        localStorage.removeItem('token');

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText("Oops! Looks like you haven't saved any recipes yet. Start building your collection now!")
            ).toBeInTheDocument();
        });
    });

    it('handles fetch response not ok', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText("Oops! Looks like you haven't saved any recipes yet. Start building your collection now!")
            ).toBeInTheDocument();
        });
    });

    it('renders specific UI elements', async () => {
        const mockRecipes = [
            { PK: '1', name: 'Recipe 1', user_id: 'User 1', description: 'Description 1' },
        ];

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ recipes: mockRecipes }),
        });

        render(
            <BrowserRouter>
                <SavedRecipes />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /🗑/ })).toBeInTheDocument();
        });
    });
});