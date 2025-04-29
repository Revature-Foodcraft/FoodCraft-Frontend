import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import RecipeCard from '../../Components/SavedRecipes/RecipeCard';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('RecipeCard Component', () => {
    const mockNavigate = jest.fn();
    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    const mockProps = {
        id: '1',
        title: 'Test Recipe',
        author: 'Test Author',
        description: 'Test Description',
        onDelete: jest.fn(),
    };

    it('renders the RecipeCard component with correct props', () => {
        render(
            <MemoryRouter>
                <RecipeCard {...mockProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        expect(screen.getByText('By: Test Author')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('navigates to the correct route when clicked', () => {
        render(
            <MemoryRouter>
                <RecipeCard {...mockProps} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('By: Test Author'));
        expect(mockNavigate).toHaveBeenCalledWith('/recipe/db/1');
    });

    it('calls onDelete when delete button is clicked', () => {
        render(
            <MemoryRouter>
                <RecipeCard {...mockProps} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: "🗑" }));

        expect(mockProps.onDelete).toHaveBeenCalled();
    });
});